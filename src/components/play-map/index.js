import { useState } from 'react'
import { loadMap, getUserData, setUserData } from '../../utils/firebase'
import { CL, Comment, AFN, FN, Var, Ctrl, Const, Tb } from '../code-text'
import { generateCells, isAdjacent, moveTo, rollD } from '../../utils/utils'
import Twemoji from 'react-twemoji'

export default function PlayMap(props) {
  // Manage user data locally so we only have to fetch on load, set whenever needed.
  const [localUserData, setLocalUserData] = useState(null)
  const [showInventory, toggleInventory] = useState(false)
  
  // Init game using user data or begin from test map.
  const start = async () => {
    let ud = await getUserData(props.user.uid)
    if (ud?.mapStates[ud.currentMap])
      console.log('Loading from user progress...')
    else {
      // Create & set new user data if none found.
      console.log('No user data. Creating new save...')
      let newMap = await loadMap('test'), icon = '🧍‍♀️'
      newMap.tiles.splice(newMap.tiles.indexOf('📍'), 1, icon)
      ud = {
        icon,
        xp: 0,
        inventory: [],
        currentMap: 'test',
        mapStates: {
          'test': newMap
        }
      }
      await setUserData(props.user.uid, ud)
    }
    // Update local user data
    setLocalUserData(ud)
  }

  const handleInventoryItemClick = (i) => {
    let clickedItem = props.itemData.find(item => item.icon === localUserData.inventory[i])

    if (!clickedItem?.action) { console.log('Item undefined'); return false }
    
    switch (clickedItem.action) {
      case 'consume':
        if (!clickedItem.consumeEffect) return false
        let effect = clickedItem.consumeEffect,
            effectType = effect[0],
            effectValue = effect.substr(1, effect.length-1)
        console.log(`type: ${effectType} | val: ${parseInt(effectValue, 10)}`)
        break
      default: break
    }
  }

  const handleCellClick = (i) => {
    let mapClone = {...localUserData.mapStates[localUserData.currentMap]},
        pi = localUserData.icon,
        pl = mapClone.tiles.findIndex(e => e.icon === pi || e.icon === '📍'),
        tmpUD = {...localUserData}

    // Validate action regardless of tile.
    if (!isAdjacent(i, pl, mapClone.size.width)) {
      console.log("That's too far!")
      return false }
    
    let cItem = {...mapClone.tiles[i]}
    switch (mapClone.tiles[i].action) {
      case null:
        // Available to move
        mapClone = moveTo(i, mapClone, pl, pi)
        break;

      case 'inventory':
        toggleInventory(!showInventory)
        break
        
      case 'harvest':
        if (!cItem.harvestItems) return false
        let changed = false
        cItem.harvestItems.forEach((harvestItem, index) => {
          if (rollD(100, harvestItem.harvestCheck, index)) {
            tmpUD.inventory.push(props.itemData.find(item => item.icon === harvestItem.item))
            if (!changed) changed = true
          }
        })
        if (changed) console.log(tmpUD.inventory)
        break;

      // case '':
      //   mapClone = moveTo(i, mapClone, pl, pi)
      //   break;

      // case pi:
      //   toggleInventory(!showInventory)
      //   break

      // case '🚪':
      //   console.log(mapClone.teleportNodes[i])
      //   break

      // default:
      //   console.log('Not movable tile!')
      //   console.log(typeof mapClone.tiles[i], mapClone.tiles[i])
        
      //   let clickedItem = props.itemData.find(item => item.icon === mapClone.tiles[i])
      //   if (!clickedItem?.action) { console.log('Item undefined'); return false }
      //   // else console.log(clickedItem.action)
        
      //   switch (clickedItem.action) {
      //     case 'collect':
      //       // add item to localUserData inventory
      //       tmpUD.inventory.push(mapClone.tiles[i])
      //       console.log(tmpUD.inventory)
      //       // mapClone.tiles.splice(i, 1, '')
      //       break;
      //     case 'harvest':
      //       if (!clickedItem.harvestItems) return false
      //       let changed = false
      //       clickedItem.harvestItems.forEach((harvestItem, index) => {
      //         if (rollD(100, harvestItem.harvestCheck, index)) {
      //           tmpUD.inventory.push(harvestItem.item)
      //           if (!changed) changed = true
      //         }
      //       })
      //       if (changed) console.log(tmpUD.inventory)
      //       break;
      //     default:
      //       break;
      //   }
      //   break;
    }
    
    // Update user mapstate regardless of action
    tmpUD.mapStates[localUserData.currentMap] = mapClone
    setUserData(props.user.uid, tmpUD)
    setLocalUserData(tmpUD)
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
      <CL><Comment val="Click a function name to run." /></CL>
      {localUserData?.mapStates[localUserData.currentMap] ? (
        // <Twemoji options={{ folder: 'svg', ext: '.svg'}}>
        // </Twemoji>
        <>
        <CL>{`var title = '${localUserData.currentMap}', emoji`}</CL>
          <CL>
            <div
              className="map-grid"
              style={{
                gridTemplateColumns: `repeat(${localUserData.mapStates[localUserData.currentMap].size.width}, var(--line-height))`,
                gridTemplateRows: `repeat(${localUserData.mapStates[localUserData.currentMap].size.height}, var(--line-height))`
              }}>
              {generateCells(localUserData.icon, localUserData.mapStates[localUserData.currentMap], handleCellClick)}
            </div>
          </CL>
          <CL></CL>
          {showInventory ? (
            <div className='inventory'>
              <CL><Const />{' items = ['}</CL>
              <CL className='inventory'>
                {localUserData?.inventory?.map((item, index) => {
                  return <div
                            className='cell'
                            onClick={() => { handleInventoryItemClick(index) }}
                            key={index}>
                            {item.icon}
                          </div>})}
              </CL>
              <CL>{']'}</CL>
            </div>
          ) : ''}
        </>
      ) : (
        // Start game
        <>
          <CL><Comment val='Continue from data or start new.' /></CL>
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