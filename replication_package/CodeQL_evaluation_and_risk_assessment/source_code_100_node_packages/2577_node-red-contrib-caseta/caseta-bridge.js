/*
Apache-2.0

Copyright (c) 2024  Vahdettin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/
const {Telnet} = require('telnet-client');
const EventEmitter = require("events");

module.exports = function (RED) {
    let casData = require('./casBE.js');

    function CasetaBridgeNode(config) {

        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.connected = false;
        this.connecting = false;
        this.closing = false;
        this.f_debug = config.f_debug || true;
        this.f_dont_connect = config.f_dont_connect || false;
        this.device_list = config.device_list || {};
        this.scene_list = config.scene_list || {};
        this.eventData = new EventEmitter();
        this.eventStat = new EventEmitter();
        this.bridge = null;
        this.params = {
            host: config.bridge_ip_address || '192.168.1.1',
            port: 23,
            shellPrompt: 'GNET>',
            debug: this.f_debug,
            username: "lutron",
            password: "integration",
            timeout: config.timeout || 5000
        };

        this.library = require("./lib/library");
        this.registry = {};

        this.statusMap = {
            "clear": {fill: "", shape: "", text: ""},
            "ready": {fill: "green", shape: "dot", text: "ready"},
            "error": {fill: "red", shape: "dot", text: "error"},
            "timeout": {fill: "yellow", shape: "dot", text: "timeout"},
            "send": {fill: "blue", shape: "dot", text: "send"},
            "sent": {fill: "blue", shape: "dot", text: "sent"},
            "sending": {fill: "blue", shape: "ring", text: "sending"},
            "reconnecting": {fill: "blue", shape: "ring", text: "reconnecting"},
            "received": {fill: "blue", shape: "dot", text: "received"},
            "response_error": {fill: "yellow", shape: "dot", text: "response"},
        }
        for (const a in this.scene_list) {
            this.library.smartbridge.action_map[this.scene_list[a].sid] = "Set " + this.scene_list[a].label;
        }
        let node = this;

        /**
         * Log to console
         * @param {string} msg - Text message
         * @param {object} obj - Optional object to be sent to console
         * @param {boolean} override - Override the bridge debug setting
         */

        node.d = function (msg, obj = null, override) {
            try {
                if (node.f_debug === true || override) node.log(msg);
                if ((node.f_debug === true || override) && obj) node.log(obj);
            } catch (err) {
                node.warn(new Error(err));
            }
        }
        node.bridge = new Telnet();
        node.bridge.on('timeout', function (prompt) {
            node.d("Bridge timeout. Not unusual.")
        })
        node.bridge.on('data', function (data) {

            try {
                if (data) {

                    let ds = data.toString().trim();
                    let pa = ds.substring(1).split(',');
                    if (pa.length > 3) {
                        node.d('fromBridge: ' + ds);
                        if (node.getRegEntryBySID(pa[1])) {
                            node.eventData.emit(pa[1], pa[2], pa[3], pa[0]);
                        }
                    }
                }
            } catch (err) {
                node.warn(new Error(err), "onData");
            }
        })
        /**
         * Return a single device registry entry by the bridge system ID
         * @param {string} sid - The bridge system id
         */
        node.getRegEntryBySID = function (sid) {

            try {
                for (const entryId in node.registry) {
                    if (sid && node.registry[entryId].device.sid && node.registry[entryId].device.sid === sid) {
                        node.d("getRegEntryBySID: sid:" + sid + " entry:" + entryId);
                        return node.registry[entryId]
                    }
                }
            } catch (err) {
                node.warn(new Error(err), "getRegEntryBySID");
            }
        }
        /**
         * Send a single command to the bridge
         * @param {string} id - The calling node identifier
         * @param {string} type - The Lutron command output type
         * @param {string} command - The Lutron command integer (as string)
         * @param {int} param_1  - The Lutron action integer (as string)
         * @param {string} param_2 - The Lutron parameter integer (as string)
         */
        node.sendCommand = function (id, type, command, param_1, param_2) {

            let node = this;
            let bridge = node.bridge;
            let item = node.registry[id];
            let prom;
            let param = '';

            if (param_1 || (param_1 === 0)) {
                param = param + "," + param_1.toString()
            }
            if (param_2) {
                param = param + "," + param_2
            }
            let str = type + ',' + item.device.sid + ',' + command + param

            node.d('toBridge: ' + str);
            prom = bridge.send(str)
                .then(function (response) {
                    return Promise.resolve(response);
                })
                .catch(function (err) {
                    return Promise.reject(new Error(err));

                })
            return prom;
        };
        /**
         * Validate or reestablish the bridge connection
         @param {boolean} forceReconnect - Force a reconnect regardless of internal state
         */
        node.connect = function (forceReconnect = false) {

            return new Promise(function (resolve, reject) {
                if (node.f_dont_connect !== true) {
                    if ((!node.connecting && !node.connected) || forceReconnect) {
                        (async function () {
                            try {
                                if (forceReconnect) {
                                    node.d("Reconnection forced.");
                                    node.bridge = null;
                                    node.bridge = new Telnet();
                                    node.bridge.on('timeout', function (prompt) {
                                        node.d("Bridge timeout. Not unusual.")
                                    })
                                    node.bridge.on('data', function (data) {

                                        try {
                                            if (data) {
                                                let ds = data.toString().trim();
                                                let pa = ds.substring(1).split(',');
                                                if (pa.length > 3) {
                                                    node.d('fromBridge: ' + ds);
                                                    if (node.getRegEntryBySID(pa[1])) {
                                                        node.eventData.emit(pa[1], pa[2], pa[3], pa[0]);
                                                    }
                                                }
                                            }
                                        } catch (err) {
                                            node.warn(new Error(err), "onData");

                                        }

                                    })
                                }
                                node.connecting = true;
                                node.d("Connecting to hub...");
                                await node.bridge.connect(node.params);
                                node.connected = true;
                                node.connecting = false;
                                node.d("Bridge connected.");
                                resolve(true);
                            } catch (err) {
                                node.connected = false;
                                node.connecting = false;
                                reject(new Error(err))
                            }
                        })()
                    } else {
                        resolve(true);
                    }
                } else {
                    node.d("connect:Bridge connection disabled in configuration.");
                    resolve(true);

                }


            })

        }
        /**
         * Destroy the bridge connection
         */
        node.disconnect = function () {
            if (node.connected && !node.closing) {
                node.closing = true;
                let bridge = node.bridge;
                (async function () {

                    try {
                        node.d("Disconnecting from bridge...");
                        node.connecting = false;
                        node.closing = true;
                        await bridge.end();
                        node.closing = false;
                        node.connected = false;

                    } catch (err) {
                        node.warn(new Error(err), "disconnect");
                        await bridge.destroy();
                        node.closing = false;
                        node.connected = false;
                    }
                })()

            }
        }
        /**
         * Register a device and establish its listeners
         * @param {object} reference - The registering node
         * @param {function} fStatus - The return status call
         * @param {function} registered - The callback
         */
        node.register = function (reference, fStatus, registered) {

            if (!reference || !reference.id) {
                registered("register:invalid node reference.");
            } else {
                try {
                    let device = node.device_list[reference.config.device];
                    device.ref_name = device.label;
                    if (device.area) {
                        device.ref_name = device.ref_name + " - " + device.area
                    }

                    if (device.type === "system_smartbridge") {
                        device.sid = "1";
                    }
                    node.registry[reference.id] = {
                        device: (Object.assign(device, node.library[device.type])),
                        refId: reference.id,
                        config: reference.config
                    };
                    let newReg = node.registry[reference.id];
                    reference.status({})
                    device = newReg.device;

                    node.d("Create status listener for: " + newReg.refId)
                    node.eventStat.on(newReg.refId, function (map, revert_map) {

                        if (map && node.statusMap[map]) {
                            fStatus(node.statusMap[map])
                            if (revert_map && node.statusMap[revert_map]) {
                                setTimeout(() => {
                                    fStatus(node.statusMap[revert_map]);
                                }, "5000")
                            }
                        }

                    })
                    node.d("register-Registered:" + newReg.refId + " Device:" + device.ref_name + " BridgeId:" + device.sid + " Type:" + device.type_label);
                    if (Object.keys(node.registry).length === 1) {
                        try {
                            (async function () {
                                node.connect().then(function (response) {
                                }).catch(function (error) {
                                    console.warn(error);
                                });
                            })()

                        } catch (err) {
                           node.error(new Error(err));

                        }
                    }
                    registered(null, true);

                } catch (err) {
                    registered(new Error(err));
                }
            }


        }
        /**
         * Unregister a device and destroy status listener
         * @param {object} reference - The unregistering node
         * @param {function} unregistered - The callback
         */
        node.unregister = function (reference, unregistered) {

            if (!reference || !reference.id || !node.registry || !node.registry[reference.id]) {
                unregistered("unregister:invalid node reference.");
            } else {
                try {
                    let item = node.registry[reference.id];
                    let device = item.device;
                    node.eventStat.emit(item.refId);
                    node.eventStat.on(item.refId, function () {
                    });
                    delete node.registry[item.refId]
                    node.d("unregister-Unregistered:" + item.refId + " Device:" + device.ref_name + " BridgeId:" + device.sid + " Type:" + device.type_label);
                    if (Object.keys(node.registry).length === 0) {
                        node.disconnect();
                    }
                    unregistered(null, true)
                } catch (err) {
                    unregistered(new Error(err));
                }
            }


        }
        /**
         * Define and instantiate a registered device's bridge listener
         * @param {object} reference - - The attaching node
         * @param {function} fData - data return function
         * @param {function} attached - The callback
         */
        node.attach = function (reference, fData, attached) {

            if (!reference || !reference.id || !node.registry || !node.registry[reference.id]) {
                attached("attach:invalid node reference.");
            } else {
                try {
                    let item = node.registry[reference.id];
                    let device = item.device;
                    let config = reference.config;
                    let sid = device.sid || 1;
                    node.d("Create bridge listener for: " + sid)
                    node.eventData.on(sid, function (action, param, kind) {
                        if (config.action.indexOf(action) > -1) {
                            if ((config.event && (config.event.indexOf(param) > -1) || kind === "OUTPUT")) {

                                if (param && device.event_map && device.event_map[param]) {
                                    param = device.event_map[param];
                                }

                                if (reference.type === "caseta-query") {
                                    if (action && device.query_map && device.query_map[action]) {
                                        action = device.query_map[action];
                                    }
                                } else {
                                    if (action && device.action_map && device.action_map[action]) {
                                        action = device.action_map[action];
                                    }
                                }
                                fData({
                                    id: device.sid,
                                    name: device.ref_name,
                                    action: action,
                                    param: param
                                })
                            }
                        }
                    })


                    node.d("attached:" + item.refId + " Device:" + device.ref_name + " BridgeId:" + device.sid + " Type:" + device.type_label);
                    attached(null, true);

                } catch (err) {

                    attached(new Error(err));
                }
            }


        };
        /**
         * Destroy a device's bridge and status listener
         * @param {object} reference - - The detaching node
         * @param {function} detached - The callback
         */
        node.detach = function (reference, detached) {

            if (!reference || !reference.id || !node.registry || !node.registry[reference.id]) {
                detached("attach:invalid node reference.");
            } else {
                try {
                    let item = node.registry[reference.id];
                    node.eventStat.emit(item.ref);
                    node.eventData.on(item.device.sid, function () {
                    });
                    node.d("detached:" + item.refId + " Device:" + item.device.ref_name + " BridgeId:" + item.device.sid + " Type:" + item.device.type_label);
                    detached(null, true)
                } catch (err) {
                    detached(new Error(err))
                }
            }


        };

    }

    RED.nodes.registerType('caseta-bridge', CasetaBridgeNode);
    casData.casBE(RED);
};
