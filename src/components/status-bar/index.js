import { useEffect, useState } from 'react'
import { getItems } from '../../utils/firebase'
import { VscSourceControl, VscSync } from 'react-icons/vsc'
import Twemoji from 'react-twemoji'

export default function StatusBar(props) {
  const [items, setItems] = useState(null)
  const [showTools, toggleTools] = useState(false)
  const [showInventory, toggleInventory] = useState(false)
  
  useEffect(() => {
    const loadItems = async () => {
      let dbItems = await getItems(), c = []
      dbItems.forEach((item, index) => {
        c.push(<div
                className='tool'
                onClick={() => { props.setTool(item.icon) }}
                key={index}>{item.icon}</div>)
      })
      setItems(c)
    }
    loadItems()
  }, [])

  return (
    <div className='status-bar'>
      
      <div className='sb-btn tools' onClick={() => {  }}>
        <div style={{ transform: 'rotate(90deg)', marginRight: '10px' }}>
          <VscSourceControl color={"#959DAC"} />
        </div>
        <span>main*</span>
      </div>

      <div className='sb-btn'>
        <VscSync color={"#959DAC"} />
      </div>

      <div className='sb-btn tools' onClick={() => { toggleTools(!showTools) }}>
        <span><b>Current Tool:</b>{props.tool || 'None'}</span>

        {/* Do not wrap current tool in Twemoji, as it is clearly caching emojis I guess. */}
        <Twemoji options={{ folder: 'svg', ext: '.svg'}}>
          <div className={`submenu ${showTools ? 'active' : ''}`}>
            <div className='toolbox'>{items}</div>
          </div>
        </Twemoji>
      </div>
      
      <div className='sb-btn tools' onClick={() => { toggleInventory(!showInventory) }}>
        <span><b>Inventory</b></span>

        <div className={`submenu ${showInventory ? 'active' : ''}`}>
          <div className='toolbox'>{items}</div>
        </div>
      </div>
    </div>
  )
}