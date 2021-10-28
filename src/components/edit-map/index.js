import { useContext, useRef, useState } from 'react'
import { loadMap, saveMap } from '../../utils/firebase'
import MapEditContext from '../../utils/MapEditContext'
import { generateCells } from '../../utils/utils'
import { CL, Comment, FN, Var, Ctrl, Const, Tb, AFN } from '../code-text'

export default function EditMap(props) {
  const [editingMap, setEditingMap] = useState(null)
  const mapInput = useRef(null),
        widthInput = useRef(null),
        heightInput = useRef(null),
        nameInput = useRef(null)
  
  var mapEditContext = useContext(MapEditContext)

  // idk i think its funny
  var Meth = {
    random: function (digits) {
      let s = ''
      for (let i = 0; i < digits; i++)
        s += Math.floor(Math.random()*10)
      return s
    }
  }

  const editMap = async () => {
    let inputVal = mapInput.current.value
    if (inputVal) {
      // if (inputVal === 'current' && props.user)
      //   setEditingMap()
      setEditingMap(await loadMap(inputVal))
    } else setEditingMap({
      title: 'map' + Meth.random(4),
      size: {
        width: 5,
        height: 5
      },
      tiles: new Array(25)
    })
  }

  var handleCellClick = (i) => {
    let mapClone = { ...editingMap },
        newVal = props.tool

    switch (props.tool) {
      case '🚪':
        let dest = prompt("Enter destination map:")
        if (!dest) return false
        else {
          let tpNodes = mapClone.teleportNodes || []
          // let alreadyTpHere = 
          // tpNodes.push({

          // })
        }
        break
      case '❌':
        newVal = ''
        break
      default: break
    }

    mapClone.tiles[i] = newVal
    setEditingMap(mapClone)
  }

  const mapGrid = () => {
    let map = editingMap
    if (map?.size?.width && map?.size?.height && map?.tiles) {
      return generateCells(map, handleCellClick, true)
    }
  }

  return (
    <div className="map-generator">
      {editingMap ? (
        <pre className='code'>
          <Ctrl val="let" />{`emoji, title = '${editingMap?.title}'`}
          <CL>
            <AFN name='setW' f={() => {setEditingMap((old) => {
                let clone = {...old}
                clone.size.width = widthInput.current.value
                return clone
              })}}>
              <Var name="w" />{'='}<input ref={widthInput} className='inline-input' placeholder='5'></input>
            </AFN>
            <Comment val="TODO: heighth" />{'}'}
          </CL>
          <CL>
            <AFN name='setH' f={() => {setEditingMap((old) => {
              let clone = {...old}
              clone.size.height = heightInput.current.value
              return clone
            })}}>
              <Var name="h" />{'='}<input ref={heightInput} className='inline-input' placeholder='5'></input>
            </AFN>
            <Comment val="TODO: widh" />{'}'}
          </CL>
          <CL>
            <AFN name='save' f={() => {saveMap(editingMap)}}>
              <Var name="name" />{'='}<input className='inline-input' placeholder={editingMap.title} style={{ width: '8ch'}} onChange={(e) => {
                setEditingMap(old => {
                  let clone = {...old}
                  clone.title = e.target.value
                  return clone
                })
              }}></input>
            </AFN>
            <Comment val="TODO: asve" />{'}'}
          </CL>

          <div
            className="map-grid"
            style={{
              gridTemplateColumns: `repeat(${editingMap.size.width}, var(--line-height))`,
              gridTemplateRows: `repeat(${editingMap.size.height}, var(--line-height))`
            }}>
            {mapGrid()}
          </div>

          <CL>
            <AFN name='exit' f={() => {setEditingMap(null)}}></AFN>
            {' clear() }'}
          </CL>
          {/* <i>const</i> <i className='fn' onClick={() => { saveMap(editingMap) }}>save</i>{' = () => {\n'}
          {'  firebase.set(mapDoc, '}<i className='ri'>this</i>{'});\n'}
          {'}'} */}
        </pre>
      ) : (
        <pre className="code">
          <CL><Comment val='Click function name to run.' /></CL>
          
          <CL>
            <FN name='editMap' f={editMap}>
              <Var name="map" />{'='}<input ref={mapInput} className='inline-input'></input>
            </FN>
          </CL>
  
          <CL><Tb/><Var/>mapSnap = fb.getMap(map)</CL>
          
          <CL><Tb/><Ctrl val='if'/>(mapSnap.data() !== <Const val='BAD'/>{')'}</CL>
  
          <CL><Tb/><Tb/><Ctrl val='return'/>mapSnap.data()</CL>
  
          <CL><Tb/>{'} '}<Ctrl val='else'/><Ctrl val='return'/>new Map()</CL>
          
          <CL>{'}'}</CL>
        </pre>
      )}
    </div>
  )
}
