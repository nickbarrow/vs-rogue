import { useEffect, useState } from 'react'
import { getMap, setUserData } from '../../utils/firebase'
import { CL, Comment, AFN, FN, Var, Ctrl, Const, Tb } from '../code-text'
import { generateCells, isAdjacent, moveTo, harvest, toolEquipped, toolable } from '../../utils/utils'

export default function PlayMap(props) {
  // Manage user data locally so we only have to fetch on load, set whenever needed.
  const [showMap, toggleMap] = useState(false)
  const [showInventory, toggleInventory] = useState(false)
  const [ud, setUd] = useState(null)
  const [fading, toggleFading] = useState(false)

  // Update shorthand version of localUserData.
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
      // Find player start location (1st map pin or teleport arrival).
      startIdx = loadingMap.tiles.findIndex(tile => tile.icon === '📍') >= 0 ? loadingMap.tiles.findIndex(tile => tile.icon === '📍') : loadingMap.tiles.findIndex(tile => tile.icon === '🚩')
      // Load arrivalPoints of each map 1st time loaded before arrival pt is
      // overwritten with player.
      loadingMap.arrivalPoints = loadingMap.tiles.reduce((prev, curr, index) => {
        if (curr.icon === '🚩') prev.push({...curr, index}); return prev }, [])
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
    if (ud.mapStates?.[ud.currentMap]) 
      await loadMap(ud.mapStates[ud.currentMap].title)
    else {
      console.log('🚩 Loading starting area...')
      await loadMap('map001')
    }
    toggleMap(true)
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

  const handleCellClick = async (i) => {
    let mapClone = {...ud.mapStates[ud.currentMap]},
        pi = ud.icon,
        pl = mapClone.tiles.findIndex(e => e.icon === pi || e.icon === '📍'),
        tmpUD = {...ud},
        cItem = {...mapClone.tiles[i]},
        cItemData = props.itemData.find(item => item.icon === cItem.icon)

    // Validate action regardless of tile.
    if (!isAdjacent(i, pl, mapClone.size.width, 2)) {
      console.log("That's too far!")
      return false }

    // If we have a tool equipped, see if we can do anything
    if (toolEquipped(ud) && toolable(cItem)) {
      let cTool = ud.inventory[ud.equippedItem]
      if (cItem.toolActions?.[cTool.icon])
        switch (cItem.toolActions[cTool.icon].action) {
          case 'harvest':
            let hi = cItem.toolActions[cTool.icon].harvestItems
            await harvest(cItem.toolActions[cTool.icon].harvestItems, (idx) => {
              mapClone.tiles[i].harvestingDisabled = true
              tmpUD.inventory.push(props.itemData.find(item => item.icon === hi[idx].item))
              console.log(`Used ${cTool.icon} to harvest ${hi[idx].item}`)
            })
            break
          default:
            break
        }
    } else {

      switch (cItem.action) {
        case null:
          // Available to move
          mapClone = moveTo(i, mapClone, pl, pi)
          break;
  
        case 'inventory':
          toggleInventory(!showInventory)
          break
  
        case 'pickup':
          console.log(`Picked up ${cItem.icon}`)
          tmpUD.inventory.push(cItemData)
          mapClone = moveTo(null, mapClone, i, null)
          break
          
        case 'harvest':
          if (cItem.harvestingDisabled === true) {
            console.log('Already harvested!')
            return false }
  
          let hi = cItem.harvestItems
          if (!hi) return false
          else await harvest(hi, (idx) => {
            cItem.harvestingDisabled = true
            tmpUD.inventory.push(props.itemData.find(item => item.icon === hi[idx].item))
            console.log(`Picked up ${cItem.harvestItems[idx].item}`)
          })
          break;
  
        case 'teleport':
          if (isAdjacent(i, pl, mapClone.size.width, 1)) {
            toggleFading(true)
            await loadMap(cItem.teleportTo) }
          else console.log("I can't reach the door handle from here!")
          return
          break
          
        default:
          console.log(cItem)
          break
      }
    }
    
    
    // Update user mapstate regardless of action
    tmpUD.mapStates[ud.currentMap] = mapClone
    props.setLocalUserData(tmpUD)
    setUserData(props.user.uid, tmpUD)
  }

  // Autosave hook.
  // useEffect(() => {
  //   const AUTOSAVE_INTERVAL = 1
  //   const interval = setInterval(() => {
  //     if (map) {
  //       if (props.user && localUserData){
  //         setUserData(props.user.uid, localUserData)
  //         console.log('💾 Autosaved @ ', new Date())
  //       } else console.log('autosave failed')
  //     }
  //   }, (AUTOSAVE_INTERVAL * 60000))

  //   // Clear interval on unmount
  //   return () => clearInterval(interval)
  // }, [localUserData])

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