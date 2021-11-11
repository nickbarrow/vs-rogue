/**
 * Determines if a tile is within 2 squares of player location.
 * @param {*} i - Index of tile to test.
 * @param {*} pl - Index of current player location.
 * @param {*} w - Width of grid.
 * @param {*} r - Adjacency radius.
 */
const isAdjacent = (i, pl, w, r) => {
  // I hate that math is cool 🤓
  let pla = pl+1,               // player location adjusted (non-0-indexed)
      px = pla % w || w,        // player x coord (origin top-left)
      py = Math.ceil(pla / w),  // player y coord
      ia = i+1,                 // current cell index adjusted
      ix = ia % w || w,         // cell x coord
      iy = Math.ceil(ia / w)    // cell y coord
      
  // Prevent left overflow
  if (ix >= (w-(r-1)) && px <= r) return false
  // Prevent right overflow
  if (ix <= r && px >= (w-(r-1))) return false

  let yDiff = Math.abs(py - iy),
      xDiff = Math.abs(px - ix)

  if (yDiff <= r && xDiff <= r) return true
  else return false
}

/**
 * 
 * @param {*} i - Index of cell to move to.
 * @param {*} m - Map to update.
 * @param {*} pl - Optional player location. Use null if not moving anything.
 * @param {*} pi - Player icon to use.
 */
const moveTo = (i, m, pl, pi) => {
  if (!m.tiles) return null
  let mapClone = {...m}
  if (pl !== null && pl >= 0 && pl <= m.tiles.length-1) mapClone.tiles[pl] = { icon: null, action: null}
  if (i !== null) mapClone.tiles[i] = { title: 'Player', icon: pi, action: 'inventory' }
  return mapClone
}

/**
 * Returns an array of grid cells.
 * @param {*} map 
 * @param {*} clickHandler - Cell click handler function.
 * @param {*} isEditingGrid - Pass true to disable adjacent highlights.
 */
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

/**
 * Rolls a <sides> sided die and returns the value. Optionally takes a check parameter.
 * If check param is passed, it will log result and return if roll passed or not.
 * @param {*} sides 
 * @param {*} check - Min value required to pass a skill check.
 * @param {*} index - Index of roll, if sequential rolls.
 * @returns 
 */
const rollD = (sides, check, index) => {
  let roll = Math.floor(Math.random() * sides)
  if (check) {
    if (index !== undefined) console.log(`🎲[${index}]: ${roll} | Req: ${check} ${roll >= check ? '✔️' : '❌'}`)
    else console.log(`🎲: ${roll} | Req: ${check} ${roll >= check ? '✔️' : '❌'}`)
    return roll >= check
  } else return roll
}

/**
 * Function that harvests from a list of possible harvest items.
 * @param {*} harvestArray - List of harvestable items.
 * @param {*} successCallback - Function which will be called if harvest succeeded.
 */
const harvest = async (harvestArray, successCallback) => {
  if (harvestArray.length)
    harvestArray.forEach(async (harvestItem, idx) => {
      if (rollD(100, harvestItem.harvestCheck, idx)) await successCallback(idx)
    })
}

/**
 * Returns if user currently has a tool equipped as boolean.
 * @param {*} ud - User dataset to check against.
 */
const toolEquipped = (ud) => {
  if ('equippedItem' in ud
      && ud.equippedItem !== null
      && ud.inventory[ud.equippedItem].type === 'tool') return true
  else return false
}

// RIP "toolable" function, Nov 10, 2021 - Nov 10, 2021
// May this be a testament to my infinite stupidity.

export { generateCells, isAdjacent, moveTo, rollD, harvest, toolEquipped }