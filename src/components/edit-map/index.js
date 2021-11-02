import { useRef, useState } from 'react'
import { loadMap, saveMap } from '../../utils/firebase'
import { generateCells } from '../../utils/utils'
import { CL, Comment, FN, Var, Ctrl, Const, Tb, AFN } from '../code-text'
import Item from '../../models/Item'

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
      tiles: new Array(25).fill(new Item())
    })
  }

  var handleCellClick = (i) => {
    let mapClone = { ...editingMap },
        newVal = new Item(),
        toolItem = props.itemData.find(item => item.icon === props.tool)

    console.log(toolItem)

    switch (props.tool) {
      case '🚪':
        let dest = prompt("Enter destination map:")
        if (!dest) return false
        else {
          mapClone.teleportNodes[i] = dest
        }
        break
      case '❌':
      default:
        break
    }

    mapClone.tiles[i] = newVal
    setEditingMap(mapClone)
  }

  const mapGrid = () => {
    let map = editingMap
    if (map?.size?.width && map?.size?.height && map?.tiles) {
      return generateCells(null, map, handleCellClick, true)
    }
  }

  const updateMap = (newSize) => {
    console.log('new size: ', newSize)
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
            j > oldW-1 ? r.push(new Item()) : r.push(tiles[oldIndex])
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
        for (let i = tiles.length; i < newW * newH; i++) newTiles.push(new Item())
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
            <AFN name='setW' f={() => { updateMap({ width: parseInt(widthInput.current.value), height: editingMap.size.height })}}>
              <Var name="w" />{'='}<input ref={widthInput} className='inline-input' placeholder={editingMap.size.width}></input>
            </AFN>
            <Comment val="TODO: with" />{'}'}
          </CL>
          <CL>
            <AFN name='setH' f={() => { updateMap({ width: editingMap.size.width, height: parseInt(heightInput.current.value) })}}>
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
