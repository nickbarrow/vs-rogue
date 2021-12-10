import { useEffect, useState, useRef, useCallback } from 'react'
import { getMap, setUserData } from '../utils/firebase'
import { isAdjacent, moveTo, harvest, toolEquipped } from '../utils/utils'

export default function PlayGrid (props) {
  const [ud, _setUd] = useState(null)
  const setUD = data => { props.setLocalUD(data) }
  // Hook to update shorthand version of localUserData.
  useEffect(() => { _setUd(props.localUD) }, [props.localUD])

  var containerRef = useRef(null)
  const containerWidth = useContainerWidth()
  const [cellWidth, setCellWidth] = useState(0)
  
  // Load a new map.
  const loadMap = async (mapName) => {
    let tmpUD = {...ud}, loadingMap, startIdx

    if (ud.mapStates?.[mapName]) {
      console.log(`📌 Entering ${mapName}.`)
      // If we've visited this map before but aren't currently there, get and move to arrival pt.
      if (ud.currentMap != mapName) {
        let pt = ud.mapStates[mapName].arrivalPoints.find(point => point.origin === ud.currentMap)
        if (pt) {
          loadingMap = {...ud.mapStates[mapName]}
          startIdx = pt.index
          loadingMap = await moveTo(startIdx, loadingMap, loadingMap.tiles.findIndex(tile => tile.icon === ud.icon), ud.icon)
        } else console.log("ERROR LOADING ARRIVAL PT")
      }
    } else {
      console.log('🗺️ Entering new area...')
      // Get fresh map from database.
      loadingMap = await getMap(mapName)
      // get arrival points on load because its like a million times easier this way for now shhh
      loadingMap.arrivalPoints = loadingMap.tiles.reduce((prev, curr, index) => {
        if (curr.icon === '🚩') {
          prev.push({...curr, index})
          // wipe icon and action so it is navigable
          loadingMap.tiles[index].icon = null
          loadingMap.tiles[index].action = null
        }
        return prev
      }, [])

      // Find player start location (1st map pin or teleport arrival).
      startIdx = mapName === 'map001' ? loadingMap.tiles.findIndex(tile => tile.icon === '📍')
        : loadingMap.arrivalPoints.find(pt => pt.origin === ud.currentMap).index
      // Move player icon to starting location
      loadingMap = await moveTo(startIdx, loadingMap, null, ud.icon)
      // Set user data
      tmpUD.mapStates[mapName] = {...loadingMap}
    }
    tmpUD.currentMap = mapName
    await setUserData(props.user.uid, tmpUD)
    setUD(tmpUD)
  }

  // Clicked map tile.
  const handleCellClick = async (i) => {
    let mapClone = {...ud.mapStates[ud.currentMap]},
        pi = ud.icon,
        pl = mapClone.tiles.findIndex(e => e.icon === pi || e.icon === '📍'),
        tmpUD = {...ud},
        cTile = mapClone.tiles[i],
        cItemData = props.itemData.find(item => item.icon === mapClone.tiles[i].icon),   // Server data for item.
        cItem = props.itemData.find(item => item.icon === mapClone.tiles[i].icon) || mapClone.tiles[i]  // for user or empty space

    // Validate action regardless of tile.
    if (!isAdjacent(i, pl, mapClone.size.width, 2)) {
      console.log("That's too far!")
      return false }

    // Check for low-hanging fruit before even bothering with item lookup, etc.
    // Actions which don't change w/ tool.
    if (cTile.icon === null && cTile.action === null) {
      mapClone = moveTo(i, mapClone, pl, pi)
      tmpUD.mapStates[ud.currentMap] = mapClone
      setUD(tmpUD)
      return
    } else if (cTile.action === 'inventory') {
      toggleInventory(!showInventory)
      return
    }
      
    // Toolable? jfc
    let cTool = ud.inventory[ud.equippedItem] ?? null
    if (cTool                                       // If user has something equipped,
        && "toolActions" in cItemData               // clicked item is 'toolable',
        && cTool.icon in cItemData.toolActions) {   // & clicked item can be modified by current tool
      let cItemToolData = cItemData.toolActions[cTool.icon]
      switch (cItemToolData.action) {
        case 'harvest':
          let hi = cItemToolData.harvestItems
          // pass harvest function our drops and success callback
          await harvest(hi, (idx) => {
            let harvestingItem = props.itemData.find(item => item.icon == hi[idx].item)
            tmpUD.inventory.push(harvestingItem)
            console.log(`Used ${cTool.icon} to harvest ${hi[idx].item}`)
            if (cItemToolData.destroyOnHarvest) mapClone = moveTo(null, mapClone, i, null)
            else mapClone.tiles[i].harvestingDisabled = true
          })
          tmpUD.mapStates[ud.currentMap] = mapClone
          setUD(tmpUD)
          break
        default:
          break
      }
    } else {
      // Do non-tool action
      switch (cItemData.action) {  
        case 'pickup':
          console.log(`Picked up ${cItemData.icon}`)
          tmpUD.inventory.push(cItemData)
          mapClone = moveTo(null, mapClone, i, null)
          tmpUD.mapStates[ud.currentMap] = mapClone
          setUD(tmpUD)
          break
          
        case 'harvest':  
          if ('harvestingDisabled' in cTile && cTile.harvestingDisabled)
            console.log('Already harvested!')
          else {
            let hi = cItem.harvestItems
            if (!hi) return false
            else await harvest(hi, (idx) => {
              mapClone.tiles[i].harvestingDisabled = true
              tmpUD.inventory.push(props.itemData.find(item => item.icon === hi[idx].item))
              console.log(`Picked up ${tmpUD.inventory[tmpUD.inventory.length-1].icon}`)
            })
            tmpUD.mapStates[ud.currentMap] = mapClone
            setUD(tmpUD)
          } 
          break;
  
        case 'teleport':
          // Force teleport requirements to 1 unit of adjacency.
          if (!isAdjacent(i, pl, mapClone.size.width, 1))
            console.log("I can't reach the door handle from here!")
          else await loadMap(mapClone.tiles[i].teleportTo)
          break
        
        case 'message':
          if (cTile.description) console.log(`💭 ${cTile.description}`)
          break
          
        default:
          // Log item description if no valid action.
          if (cItemData.description) console.log(`💭 ${cItemData.description}`)
          break
      }
    }
  }

  const generateCells = (pi, map, clickHandler, isEditingGrid) => {
    let pl = isEditingGrid ? null : map.tiles.findIndex(e => e.icon === pi || e.icon === '📍'),
        g = [],
        w = parseInt(map.size.width, 10),
        h = parseInt(map.size.height, 10)
  
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        let index = i * w + j,
            imAdjacent = isEditingGrid ? false : isAdjacent(index, pl, w, 2)
  
        g.push(
          <div
            className={`cell ${imAdjacent ? 'accessible' : ''} ${map.tiles[index].harvestingDisabled === true ? 'harvesting-disabled' : ''}`}
            style={{ width: cellWidth, height: cellWidth }}
            onClick={() => { clickHandler(index) }}
            key={index}>
              <span>
                {
                  // If editing, just draw icon
                  isEditingGrid ? map.tiles[index].icon
                  // If playing and player location, draw player icon
                  : index === pl ? pi 
                  
                    : map.tiles[index].icon === '🚩' ? ''
                      : map.tiles[index].icon
                }
              </span>
          </div>
        )
      }
    }
    return g
  }

  // Custom hook to get PlayGrid size (minus padding)
  function useContainerWidth () {
    const [cw, setCW] = useState(0)
    useEffect(() => {
      // Get width without padding
      const handleResize = () => { setCW(containerRef.current.getBoundingClientRect().width) }  
      // Call handler immediately.
      handleResize()  
      // Event listener
      window.addEventListener("resize", handleResize)
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize)
    }, [])
    return cw
  }
  
  
  useEffect(() => {
    if (containerWidth && ud?.mapStates[ud.currentMap]) {
      console.log(containerWidth)
      let w = parseInt(ud.mapStates[ud.currentMap].size.width),
          cellW = containerWidth/(w+1);
      setCellWidth(cellW)
    }
    // if (containerRef && ud?.mapStates[ud.currentMap]) {
    //   console.log('oh yeah im doin it')
    //   // width - padding
    //   let containerWidth = containerRef.current.clientWidth,
    //       w = parseInt(ud.mapStates[ud.currentMap].size.width),
    //       cellW = containerWidth/(w+1)
    //   console.log(containerWidth, cellW)
    //   setCellWidth(cellW)
    // }
  }, [containerWidth])
  
  return (
    <div
      className='play-grid'
      ref={containerRef}
      style={ 
        ud?.mapStates[ud.currentMap] ? {
          rowGap: `${(100/(parseInt(ud.mapStates[ud.currentMap].size.height)+1))/(ud.mapStates[ud.currentMap].size.height - 1)}%`,
          columnGap: `${(100/(parseInt(ud.mapStates[ud.currentMap].size.width)+1))/(ud.mapStates[ud.currentMap].size.width - 1)}%`,
          gridTemplateColumns: `repeat(${ud.mapStates[ud.currentMap].size.width}, ${cellWidth}px`,
          gridTemplateRows: `repeat(${ud.mapStates[ud.currentMap].size.width}, ${cellWidth}px)`
        } : null }
      >
      {ud ? generateCells(ud.icon, ud.mapStates[ud.currentMap], handleCellClick) : null}
    </div>
  )
}