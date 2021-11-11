import { useRef, useState } from 'react'
import { getMap, saveMap } from '../../utils/firebase'
import { generateCells } from '../../utils/utils'
import { CL, Comment, FN, Var, Ctrl, Const, Tb, AFN } from '../code-text'
import Item from '../../models/Item'
import Map from '../../models/Map'

export default function EditMap(props) {
  const [editingMap, setEditingMap] = useState(null)
  const mapInput = useRef(null),
        widthInput = useRef(null),
        heightInput = useRef(null)
        
  // Returns a random integer in range range as a string. idk i think its funny
  var Meth = { random: range => { return `${Math.floor(Math.random()*range)}` } }

  const editMap = async () => {
    let inputVal = mapInput.current.value
    // Load map from db as Map class.
    if (inputVal) setEditingMap(new Map(await getMap(inputVal)))
    else setEditingMap(new Map())
  }

  var handleCellClick = (i) => {
    let mapClone = { ...editingMap }, newVal
    if (props.tool) {
      let toolItem = new Item(props.itemData.find(item => item.icon === props.tool))
      switch (toolItem.action) {
        case 'teleport':
          let dest = prompt("Enter destination map:")
          if (!dest) return false
          else newVal = {...toolItem, ...{ teleportTo: dest }}
          break
        case 'arrive':
          let origin = prompt("Enter origin map:")
          if (!origin) return false
          else newVal = {...toolItem, ...{ origin: origin }}
          break
        case 'message':
          let msg = prompt("Enter a message:")
          if (!msg) return false
          else newVal = {...toolItem, ...{ description: msg }}
          break
        case 'info':
          console.log(mapClone.tiles[i])
          return
          break
        case 'clear':
          newVal = new Item()
          break
        default:
          newVal = toolItem
          break
      }
    } else newVal = new Item()
    mapClone.tiles[i] = newVal
    setEditingMap(new Map(mapClone))
  }

  const updateMap = (newSize) => {
    let mapClone = {...editingMap},
        tiles = [...editingMap.tiles],
        oldW = editingMap.size.width,
        oldH = editingMap.size.height,
        newW = newSize.width,
        newH = newSize.height,
        index,
        newTiles = []

    if (newW !== oldW) {
      // Fewer cols
      if (newW < oldW) {
        for (let i = 0; i < oldH; i++) {
          for (let j = 0; j < oldW; j++) {
            index = i * oldW + j
            if (j === 0) newTiles.push(tiles.slice(index, index + (newW)))
          }
        }
      } else {
        // More cols
        for (let i = 0; i < oldH; i++) {
          let r = []
          for (let j = 0; j < newW; j++) {
            let oldIndex = i * oldW + j
            j > oldW-1 ? r.push({}) : r.push(tiles[oldIndex])
          }
          newTiles.push(r)
        }
      }
    } else if (newH !== oldH) {
      // Fewer rows
      if (newH < oldH) newTiles = tiles.slice(0, newH * oldW)
      // More rows
      else if (newH > oldH) {
        newTiles = tiles
        for (let i = tiles.length; i < newW * newH; i++) newTiles.push({})
      }
    } else return // No change so don't update.

    mapClone.size = {
      width: newW,
      height: newH
    }
    mapClone.tiles = newTiles.flat(1)
    setEditingMap(mapClone)
  }

  return (
    <div className="map-generator">
      {editingMap ? (
        <>
          <CL><Ctrl val="let" />{`emoji, title = '${editingMap?.title}'`}</CL>
          <CL>
            <AFN name='setW' f={() => {
              setEditingMap(new Map(editingMap).updateSize({ width: parseInt(widthInput.current.value) }))
              // updateMap({ width: parseInt(widthInput.current.value), height: editingMap.size.height })
              }}>
              <Var name="w" />{'='}<input ref={widthInput} className='inline-input' placeholder={editingMap.size.width}></input>
            </AFN>
            <Comment val="TODO: with" />{'}'}
          </CL>
          <CL>
            <AFN name='setH' f={() => {
              setEditingMap(new Map(editingMap).updateSize({ height: parseInt(heightInput.current.value) }))
              // updateMap({ width: editingMap.size.width, height: parseInt(heightInput.current.value) })
              }}>
              <Var name="h" />{'='}<input ref={heightInput} className='inline-input' placeholder={editingMap.size.height}></input>
            </AFN>
            <Comment val="TODO: hite" />{'}'}
          </CL>
          <CL>
            <AFN name='save' f={() => {
              editingMap instanceof Map ? editingMap.save() : alert('you fucked up buddy') }}>
              <Var name="name" />{'='}<input className='inline-input' placeholder={editingMap.title} style={{ width: '8ch'}} onChange={(e) => {
                setEditingMap(new Map({...editingMap, title: e.target.value}))
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
              {generateCells(null, editingMap, handleCellClick, true)}
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
