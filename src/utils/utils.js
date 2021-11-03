import Item from "../models/Item"

/**
 * Determines if a tile is within 2 squares of player location.
 * @param {*} i - Index of tile to test.
 * @param {*} pl - Index of current player location.
 * @param {*} w - Width of grid.
 * @param {*} h - Width of grid.
 */
const isAdjacent = (i, pl, w) => {
  // I hate that math is cool 🤓
  let pla = pl+1,               // player location adjusted (non-0-indexed)
      px = pla % w || w,        // player x coord (origin top-left)
      py = Math.ceil(pla / w),  // player y coord
      ia = i+1,                 // current cell index adjusted
      ix = ia % w || w,         // cell x coord
      iy = Math.ceil(ia / w)    // cell y coord
      
  // Prevent left overflow
  if (ix >= (w-1) && px <= 2) return false
  // Prevent right overflow
  if (ix <= 2 && px >= (w-1)) return false

  let yDiff = Math.abs(py - iy),
      xDiff = Math.abs(px - ix)

  if (yDiff <= 2 && xDiff <= 2) return true
  else return false
}

/**
 * 
 * @param {*} i - Index of cell to move to.
 * @param {*} m - Map to update.
 */
const moveTo = (i, m, pl, pi) => {
  if (!m.tiles) return null
  let mapClone = {...m}
  if (pl !== null && pl >= 0 && pl <= m.tiles.length-1) mapClone.tiles[pl] = new Item()
  mapClone.tiles[i] = new Item({ title: 'Player', icon: pi, action: 'inventory' });
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
          imAdjacent = isEditingGrid ? false : isAdjacent(index, pl, w)

      g.push(
        <div
          className={`cell ${imAdjacent ? 'accessible' : ''}`}
          onClick={() => { clickHandler(index) }}
          key={index}>
          {isEditingGrid ? map.tiles[index].icon
            : index === pl ? pi 
              : map.tiles[index].icon === '🚩' ? ''
                : map.tiles[index].icon
          }
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

export { generateCells, isAdjacent, moveTo, rollD }