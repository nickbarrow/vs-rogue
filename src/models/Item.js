export default class Item {
    /**
     * 
     * @param {*} config - Config optionally takes a title, icon, and action.
     */
    constructor(config) {
        this.title = null
        this.icon = null
        this.action = null
        Object.assign(this, config)
    }

    performAction() {
        console.log(this.action)
    }
}