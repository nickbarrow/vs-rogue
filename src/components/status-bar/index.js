import { useEffect, useState } from 'react'
import { getItems } from '../../utils/firebase'
import Twemoji from 'react-twemoji'
import './status-bar.scss'

export default function StatusBar(props) {
  const [items, setItems] = useState(null)
  const [showTools, toggleTools] = useState(false)
  
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
      <div className='sb-btn tools' onClick={() => { toggleTools(!showTools) }}>
        <span><b>Current Tool:</b>{props.tool || 'None'}</span>

        {/* Do not wrap current tool in Twemoji, as it is clearly caching emojis I guess. */}
        <Twemoji options={{ folder: 'svg', ext: '.svg'}}>
          <div className={`submenu ${showTools ? 'active' : ''}`}>
            <div className='toolbox'>{items}</div>
          </div>
        </Twemoji>
      </div>
    </div>
  )
}