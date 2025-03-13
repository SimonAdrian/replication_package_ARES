module.exports = function(RED) {
  "use strict";

  var io = require('socket.io-client');

  /***
  EVENT Config Node
  ***/

  function socketIoEvent(config) {
      RED.nodes.createNode(this, config);
      this.addr = config.addr;
  }

  /***
  SOCKET SERVER Config Node
  ***/

  function socketIoServer(config) {
      RED.nodes.createNode(this, config);
      this.port = config.port;
  }

  /***
  OUTPUT Node
  ***/

  function socketIoOut(config) {
    RED.nodes.createNode(this, config);

    this.port = RED.nodes.getNode(config.server).port;

    var sockerServer;

    var needNewSocketServer = false;
    if (!RED._socketServers) {
      RED._socketServers = [];
    }

    for (var i=0; i < RED._socketServers.length; i++) {
      if (RED._socketServers[i].port === this.port) {
        sockerServer = RED._socketServers[i].server;
      }
    }

    if (!sockerServer) {
      sockerServer = require('socket.io').listen(this.port);
    }

    var index = RED._socketServers.push({port: this.port, server: sockerServer}) - 1;

    this.addr = RED.nodes.getNode(config.event).addr;

    var node = this;
    RED._socketServers[index].server.on('connection', function (socket) {
      node.on('input', function(msg) {
        socket.emit(this.addr, msg.payload);
      });
    });
  }

  /***
  INPUT Node
  ***/

  function socketIoIn(config) {
    RED.nodes.createNode(this, config);

    this.addr = RED.nodes.getNode(config.event).addr;

    var httpAddress = RED.server.address();

    var address = httpAddress.address;
    if (address == '::') {
      address = 'localhost';
    }

    this.port = RED.nodes.getNode(config.server).port;

    var path = `http://${address}:${this.port}`;
    var socket = io.connect(path);

    var node = this;
    socket.on(this.addr, function(message) {
      node.send({payload: message});
    });

    socket.on('error', function (err) {
      logSocketEvent(`Socket.io error: ${err}.`);
    });

    socket.on('disconnect', function () {
      logSocketEvent(`Socket.io disconnected.`);
    });

    socket.on('reconnect', function (num) {
      logSocketEvent(`Socket.io reconnected successfuly.`);
    });

    socket.on('reconnect_attempt', function () {
      logSocketEvent(`Socket.io attempt to reconnect.`);
    });

    socket.on('reconnecting', function (num) {
      logSocketEvent(`Socket.io reconnecting ${num} time.`);
    });

    socket.on('reconnect_error', function (err) {
      logSocketEvent(`Socket.io reconnect error: ${err}.`);
    });

    socket.on('reconnect_failed', function (err) {
      logSocketEvent(`Socket.io rreconnection failed.`);
    });
  }

  RED.nodes.registerType("socket-io-event", socketIoEvent);
  RED.nodes.registerType("socket-io-server", socketIoServer);
  RED.nodes.registerType("socket-io-out", socketIoOut);
  RED.nodes.registerType("socket-io-in", socketIoIn);
}

function logSocketEvent(event) {
  console.log(`SOCKET EVENT: ${event}`);
}
