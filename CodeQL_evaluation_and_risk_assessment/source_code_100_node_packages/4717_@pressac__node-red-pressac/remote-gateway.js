module.exports = function(RED) {
    function RemoteGatewayNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.ip = config.ip;
        this.password = config.password;
    }
    RED.nodes.registerType("remote-gateway",RemoteGatewayNode);
}
