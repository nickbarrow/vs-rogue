import { saveMap } from '../utils/firebase'
import Item from './Item'

// Returns a random integer in range range as a string. idk i think its funny
var Meth = { random: range => { return `${Math.floor(Math.random() * range)}` } }

export default class Map {
  /**
   * @param {string} config - Config optionally takes a title, icon, and action.
   */
  constructor(config) {
    this.title = 'map' + Meth.random(100)
    this.size = {
      width: 5,
      height: 5
    }
    this.tiles = new Array(25).fill(new Item())
    Object.assign(this, config)
  }

  /**
   * Returns Item class as Object for storing in Firebase.
   */
  toObject() { return JSON.parse(JSON.stringify(this)) }

  /**
   * Returns a new map with updated dimensions.
   * This feels wrong but I can figure it out later.
   * @param {*} config - Config takes either a width or a height param. 
   * @returns 
   */
  updateSize({ width, height }) {
    let mapClone = {...this},
        tiles = [...this.tiles],
        oldW = this.size.width,
        oldH = this.size.height,
        newW = width || oldW,
        newH = height || oldH,
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

    this.size = {
      width: newW,
      height: newH
    }
    this.tiles = newTiles.flat(1)
    // mapClone.size = {
    //   width: newW,
    //   height: newH
    // }
    // mapClone.tiles = newTiles.flat(1)
    return this
  } 

  async save() {
    // Call firebase map save function.
    await saveMap(this.toObject())
  }
}