import { useContext, useRef, useState } from 'react'
import { loadMap, saveMap, getUserData } from '../../utils/firebase'
import { generateCells } from '../../utils/utils'
import { CL, Comment, FN, Var, Ctrl, Const, Tb, AFN } from '../code-text'

export default function EditMap(props) {
  const [editingMap, setEditingMap] = useState(null)
  const mapInput = useRef(null),
        widthInput = useRef(null),
        heightInput = useRef(null)

  // Returns a random integer in range range as a string. idk i think its funny
  var Meth = { random: range => { return `${Math.floor(Math.random()*range)}` } }

  const editMap = async () => {
    let inputVal = mapInput.current.value
    if (inputVal) setEditingMap(await loadMap(inputVal))
    else setEditingMap({
      title: 'map' + Meth.random(100),
      size: {
        width: 5,
        height: 5
      },
      teleportNodes: {},
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
          mapClone.teleportNodes[i] = dest
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
        <>
          <CL><Ctrl val="let" />{`emoji, title = '${editingMap?.title}'`}</CL>
          <CL>
            <AFN name='setW' f={() => {setEditingMap((old) => {
              let clone = {...old}
              clone.size.width = widthInput.current.value
              return clone
            })}}>
              <Var name="w" />{'='}<input ref={widthInput} className='inline-input' placeholder={editingMap.size.width}></input>
            </AFN>
            <Comment val="TODO: with" />{'}'}
          </CL>
          <CL>
            <AFN name='setH' f={() => {setEditingMap((old) => {
              let clone = {...old}
              clone.size.height = heightInput.current.value
              return clone
            })}}>
              <Var name="h" />{'='}<input ref={heightInput} className='inline-input' placeholder={editingMap.size.height}></input>
            </AFN>
            <Comment val="TODO: hite" />{'}'}
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

          <CL>
            <div
              className="map-grid"
              style={{
                gridTemplateColumns: `repeat(${editingMap.size.width}, var(--line-height))`,
                gridTemplateRows: `repeat(${editingMap.size.height}, var(--line-height))`
              }}>
              {mapGrid()}
            </div>
          </CL>

          <CL>
            <AFN name='exit' f={() => {setEditingMap(null)}}></AFN>
            {' clear() }'}
          </CL>
          <CL></CL>
        </>
      ) : (
        // Edit Map
        <>
          <CL><Comment val='Click function name to run.' /></CL>
          
          <CL>
            <FN name='edit' f={editMap}>
              <Var name="map" />{'='}<input ref={mapInput} className='inline-input' placeholder="name" />
            </FN>
          </CL>
  
          <CL><Tb/><Var/>mapSnap = fb.getMap(map)</CL>
          
          <CL><Tb/><Ctrl val='if'/><span style={{ marginRight: '1ch'}}>{'(mapSnap.data() !== '}</span><Const val='BAD'/>{')'}</CL>
  
          <CL><Tb/><Tb/><Ctrl val='return'/>mapSnap.data()</CL>
  
          <CL><Tb/><Ctrl val='else'/><Ctrl val='return'/>new Map()</CL>
          
          <CL>{'}'}</CL>
        </>
      )}
    </div>
  )
}
