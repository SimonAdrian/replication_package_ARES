module.exports = (RED) => {
  RED.nodes.registerType('web-config', class {
    constructor (config) {
      RED.nodes.createNode(this, config)
      Object.assign(this, config)      
    }
  })
}