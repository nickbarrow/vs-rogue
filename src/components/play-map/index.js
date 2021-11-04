import { useEffect, useState } from 'react'
import { getMap, setUserData } from '../../utils/firebase'
import { CL, Comment, AFN, FN, Var, Ctrl, Const, Tb } from '../code-text'
import { generateCells, isAdjacent, moveTo, rollD } from '../../utils/utils'

export default function PlayMap(props) {
  // Manage user data locally so we only have to fetch on load, set whenever needed.
  const [showMap, toggleMap] = useState(false)
  const [showInventory, toggleInventory] = useState(false)
  const [ud, setUd] = useState(null)

  // Update shorthand version of localUserData.
  useEffect(() => { setUd(props.localUserData) }, [props.localUserData])
  
  const loadMap = async (mapName) => {
    let tmpUD = {...ud}

    if (ud.mapStates[mapName]) {
      consolelog(`📌 Entering ${mapName}.`)
    } else {
      consolelog('🗺️ Entering new area...')
      let loadingMap = await getMap(mapName)
      loadingMap = await moveTo(loadingMap.tiles.findIndex(tile => tile.icon === '🚩'), loadingMap, null, ud.icon)
      tmpUD.mapStates[mapName] = {...loadingMap}
    }
    tmpUD.currentMap = mapName
    await setUserData(props.user.uid, tmpUD)
    props.setLocalUserData(tmpUD)
  }
  
  // Init game using user data or begin from test map.
  const start = async () => {
    // let ud = props.localUserData
    if (ud?.mapStates && ud.mapStates[ud.currentMap])
      consolelog('Loading from user progress...')
    else {
      // Create & set new user data if none found.
      consolelog('No user data. Creating new save...')
      // Utilize moveTo function to replace starting pin with player icon.
      let newMap = await getMap('map001')
      newMap = await moveTo(newMap.tiles.findIndex(tile => tile.icon === '📍'), newMap, null, '🧍‍♀️')
      let newUd = {
        icon: '🧍‍♀️',
        xp: 0,
        inventory: [],
        currentMap: 'map001',
        mapStates: { 'map001': newMap }
      }
      await setUserData(props.user.uid, newUd)
      // Update local user data
      props.setLocalUserData(newUd)
    }
    toggleMap(true)
  }

  const handleInventoryItemClick = (i) => {
    let clickedItem = props.itemData.find(item => item.icon === ud.inventory[i])

    if (!clickedItem?.action) { consolelog('Item undefined'); return false }
    
    switch (clickedItem.action) {
      case 'consume':
        if (!clickedItem.consumeEffect) return false
        let effect = clickedItem.consumeEffect,
            effectType = effect[0],
            effectValue = effect.substr(1, effect.length-1)
        consolelog(`type: ${effectType} | val: ${parseInt(effectValue, 10)}`)
        break
      default: break
    }
  }

  const handleCellClick = async (i) => {
    let mapClone = {...ud.mapStates[ud.currentMap]},
        pi = ud.icon,
        pl = mapClone.tiles.findIndex(e => e.icon === pi || e.icon === '📍'),
        tmpUD = {...ud}

    // Validate action regardless of tile.
    if (!isAdjacent(i, pl, mapClone.size.width)) {
      consolelog("That's too far!")
      return false }
    
    let cItem = {...mapClone.tiles[i]}
    
    // consolelog(cItem)
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
        if (cItem.harvestingDisabled === true) {
          consolelog('Already harvested!')
          return false }
          
        let changed = false
        cItem.harvestItems.forEach((harvestItem, index) => {
          if (rollD(100, harvestItem.harvestCheck, index)) {
            mapClone.tiles[i].harvestingDisabled = true
            tmpUD.inventory.push(props.itemData.find(item => item.icon === harvestItem.item))
            if (!changed) changed = true
          }
        })
        if (changed) consolelog(tmpUD.inventory)
        break;

      case 'teleport':
        await loadMap(cItem.teleportTo)
        return
        break
        
      default: break
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
  //         consolelog('💾 Autosaved @ ', new Date())
  //       } else consolelog('autosave failed')
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
              className="map-grid"
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
                            className='cell'
                            onClick={() => { handleInventoryItemClick(index) }}
                            key={index}>
                            {item.icon}
                          </div>})}
              </CL>
              <CL>{']'}</CL>
            </div>
          ) : ''}
          <CL><Comment val='// Reset user data.' /></CL>
          <CL>
            <AFN name='reset' f={async () => { await setUserData(props.user.uid, {}) }}></AFN>{'}'}
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