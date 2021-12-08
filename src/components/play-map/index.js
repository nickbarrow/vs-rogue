import { useEffect, useState } from 'react'
import { getMap, setUserData } from '../../utils/firebase'
import { CL, Comment, AFN, Var, Ctrl, Const, Tb } from '../code-text'
import { generateCells, isAdjacent, moveTo, harvest, toolEquipped } from '../../utils/utils'

export default function PlayMap(props) {
  // Manage user data locally so we only have to fetch on load, set whenever needed.
  const [showMap, toggleMap] = useState(false)
  const [showInventory, toggleInventory] = useState(false)
  const [ud, setUd] = useState(null)
  const [fading, toggleFading] = useState(false)

  // Hook to update shorthand version of localUserData.
  useEffect(() => { setUd(props.localUserData) }, [props.localUserData])
  
  const loadMap = async (mapName) => {
    let tmpUD = {...ud}, loadingMap, startIdx

    if (ud.mapStates?.[mapName]) {
      console.log(`📌 Entering ${mapName}.`)
      // If we've visited this map and we are teleporting, get and move to arrival pt.
      if (ud.currentMap != mapName) {
        let pt = ud.mapStates[mapName].arrivalPoints.find(point => point.origin === ud.currentMap)
        if (pt) {
          loadingMap = {...ud.mapStates[mapName]}
          startIdx = pt.index
          loadingMap = await moveTo(startIdx, loadingMap, loadingMap.tiles.findIndex(tile => tile.icon === ud.icon), ud.icon)
        }
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
    props.setLocalUserData(tmpUD)
    toggleFading(false)
  }
  
  // Init game using user data or begin from test map.
  const start = async () => {
    if (ud.mapStates?.[ud.currentMap]) await loadMap(ud.mapStates[ud.currentMap].title)
    else await loadMap('map001')  // Load map001 as starting map.
    toggleMap(true)
  }

  // Updates local and server user data.
  const updateData = (data) => {
    props.setLocalUserData(data)
    setUserData(props.user.uid, data)
  }

  const handleInventoryItemClick = (i) => {
    let clickedItem = props.itemData.find(item => item.icon === ud.inventory[i].icon),
        tmpUD = {...ud}

    if (!clickedItem?.action) { console.log('Item undefined'); return false }
    
    switch (clickedItem.type) {
      case 'tool':
        if (tmpUD.equippedItem === i) tmpUD.equippedItem = null
        else tmpUD.equippedItem = i
        break
      // case 'consume':
      //   if (!clickedItem.consumeEffect) return false
      //   let effect = clickedItem.consumeEffect,
      //       effectType = effect[0],
      //       effectValue = effect.substr(1, effect.length-1)
      //   console.log(`type: ${effectType} | val: ${parseInt(effectValue, 10)}`)
      //   break
      default:
        console.log(clickedItem)
        break
    }
    
    props.setLocalUserData(tmpUD)
    setUserData(props.user.uid, tmpUD)
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
      updateData(tmpUD)
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
          updateData(tmpUD)
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
          updateData(tmpUD)
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
            updateData(tmpUD)
          } 
          break;
  
        case 'teleport':
          // Force teleport requirements to 1 unit of adjacency.
          if (!isAdjacent(i, pl, mapClone.size.width, 1))
            console.log("I can't reach the door handle from here!")
          else {
            toggleFading(true)
            await loadMap(mapClone.tiles[i].teleportTo) }
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

  return (
    <>
      {showMap ? (
        <>
        <CL>{`var title = '${ud.currentMap}', arr`}</CL>
          <CL>
            <div
              className={`map-grid ${fading ? 'faded' : ''}`}
              style={{
                gridTemplateColumns: `repeat(${ud.mapStates[ud.currentMap].size.width}, var(--line-height))`,
                gridTemplateRows: `repeat(${ud.mapStates[ud.currentMap].size.height}, var(--line-height))`
              }}>
              {generateCells(ud.icon, ud.mapStates[ud.currentMap], handleCellClick)}
            </div>
          </CL>
          {showInventory ? (
            <div className='inventory'>
              <CL><Const />{' items = ['}</CL>
              <CL className='inventory'>
                {ud?.inventory?.map((item, index) => {
                  return <div
                            className={`cell ${ud.equippedItem == index ? 'equipped' : ''}`}
                            onClick={() => { handleInventoryItemClick(index) }}
                            key={index}>
                            {item.icon}
                          </div>})}
              </CL>
              <CL>{']'}</CL>
            </div>
          ) : ''}
          <CL>
            <AFN name='close' f={async () => { toggleMap(false) }}></AFN>{'}'}
          </CL>
          <CL><Comment val='// Reset user data.' /></CL>
          <CL>
            <AFN name='reset' f={async () => {
              await setUserData(props.user.uid, {})
              props.setLocalUserData({})
              toggleMap(false)
              }}></AFN>{'}'}
          </CL>
          <CL></CL>
        </>
      ) : (
        // Start game
        <>
          <CL><Comment val='// Continue from data or start new.' /></CL>
          <CL>
            <AFN name='start' f={start}></AFN>
          </CL>
          <CL><Tb/><Var/>data = loadData(user)</CL>
          <CL><Tb/><Ctrl val='if'/>{'(data) resume(save)'}</CL>
          <CL><Tb/><Ctrl val='else'/>start('new')</CL>
          <CL>{'}'}</CL>
          <CL></CL>
        </>
      )}
    </>
  )
}