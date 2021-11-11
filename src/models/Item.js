export default class Item {
  /**
   * @param {string} config - Config optionally takes a title, icon, and action.
   */
  constructor(config) {
    this.title = null
    this.icon = null
    this.action = null
    Object.assign(this, config)
  }

  /**
   * Returns Item class as Object for storing in Firebase.
   */
  toObject() { return JSON.parse(JSON.stringify(this)) }
}