
module.exports = function(RED) {
'use strict'
    function PressacNode(config) {
      // Create the node
        RED.nodes.createNode(this,config);
        var node = this;
        var connectedNode = {fill:"green",shape:"dot",text:"Connected"}
        var disconnectedNode = {fill:"red",shape:"dot",text:"Disconnected"}
        node.status(disconnectedNode);

        // Retrieve the config node
        let url = "mqtt://"
        this.gateway = RED.nodes.getNode(config.gateway);
         if (this.gateway) {
          if(this.gateway.ip == "127.0.0.1")
            url += "172.17.0.1"  //for Docker
            //url += this.gateway.ip
          else
             url += this.gateway.ip
        } else {
          console.log("Invalid gateway settings")
          return
        }
        
        this.sensors = RED.nodes.getNode(config.sensors);
        if(!config.sensors || config.sensors == -1) {
          console.log("Invalid sensor name")
          return
        }

  let options = {
    port: 51966,
    protocolId: 'MQTT', // MQTT 3.1
    protocolVersion: 4, // MQTT 3.1
    reconnectPeriod: 2000,
  }

  var mqtt = require('mqtt').connect(url, options);
  console.log("subscribe to /nodered/" + config.sensors)

  mqtt.subscribe("/nodered/" + config.sensors)

  mqtt.on("message", function (topic, payload) {
    console.log(`MQTT INFO: Message ` + payload + " topic: " + topic)
    var message = {payload : JSON.parse(payload.toString())}
    if(topic == ("/nodered/" + config.sensors)){
     node.send(message); 
    }
  })

    mqtt.on('connect', () => {
      console.log(`MQTT INFO: connect`)
      node.status(connectedNode);
    })
    
     mqtt.on('reconnect', () => {
      console.log(`MQTT INFO: reconnect`)
      node.status(connectedNode);
    })

    mqtt.on('error', () => {
      console.log(`MQTT INFO: error`)
      node.status(disconnectedNode);
    })

    mqtt.on('close', () => {
      console.log(`MQTT INFO: close`)
      node.status(disconnectedNode);
    })
   
    mqtt.on('offline', () => {
      console.log(`MQTT INFO: offline`)
      node.status(disconnectedNode);
    })

    mqtt.on('end', () => {
      console.log(`MQTT INFO: end`)
      node.status(disconnectedNode);
    })

        this.on('close', function(removed, done) {
          console.log("pressac node is closed");
          mqtt.end(true,() => { 
          if(!removed)
            mqtt.reconnect()
          done();
          })
      });
    }
    RED.nodes.registerType("pressac-sensor",PressacNode);
}
 