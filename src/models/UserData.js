

export default class UserData {
  /**
   * @param {string} config - Config optionally takes a icon, xp, inventory, and mapStates.
   */
  constructor(config) {
    this.icon = '🧍‍♀️'
    this.xp = 0
    this.inventory = []
    this.mapStates = {}
    Object.assign(this, config)
  }

  /**
   * Returns Item class as Object for storing in Firebase.
   */
  toObject() { return JSON.parse(JSON.stringify(this)) }
}