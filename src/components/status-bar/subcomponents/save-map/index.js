import { useState, useContext, useEffect } from 'react'
import { saveMap } from '../../../../utils/firebase'
import MapContext from '../../../../utils/MapContext'
import './save-map.scss'

export default function SaveMap(props) {
  var mapContext = useContext(MapContext)
  const [outputName, setOutputName] = useState(mapContext.editingMap?.title || 'new')

  // Update save name when map is loaded so we can overwrite.
  useEffect(() => {
    setOutputName(mapContext.editingMap?.title)
  }, [mapContext.editingMap])

  return (
    <div className={`submenu save-map ${props.show ? 'active' : ''}`}>
      <input
        name="filename"
        value={outputName}
        onChange={(e) => { setOutputName(e.target.value) }}
        placeholder="Map name" />
      <button
        onClick={async () => {
          if (mapContext.editingMap && outputName) {
            await saveMap({...mapContext.editingMap, title: outputName})
            props.setShow(false)
          }
        }}>
        Save
      </button>
    </div>
  )
}
