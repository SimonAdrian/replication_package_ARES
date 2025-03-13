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
'use strict'
module.exports = function (RED) {
    function CasetaControlNode(config) {

        function str_pad_left(string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }

        RED.nodes.createNode(this, config);
        let bridge = RED.nodes.getNode(config.bridge);
        this.config = config;
        let node = this;
        node.status({});
        if (bridge) {

            bridge.register(node,
                function (statusData) {
                    if (statusData && (node.config.f_pal_status === true || statusData.fill === "red")) {
                        node.status(statusData)
                    }
                },
                function (err, registered) {
                    if (registered) {
                        bridge.eventStat.emit(node.id, "ready");
                    }
                    if (err) {
                        node.error(RED._("caseta.errors.registration"));
                    }
                });

            node.on('input', function (msg, send, done) {

                let cmd = {
                    action: node.config.action,
                    param_1: 1,
                    param_2: 1,
                };
                let resetConnection = false;
                if(msg && msg.force_reconnect && msg.force_reconnect === true){
                    resetConnection = true;
                }
                if (node.config.device_class === "pico" || node.config.device_class === "smartbridge") {

                    let holdTime = 0;
                    if (node.config.type_hold_time === "num") {
                        holdTime = parseInt(node.config.hold_time) || 0;
                    } else if (node.config.type_hold_time === "flow") {
                        holdTime = node.context().flow.get("caseta_hold_time") || 0;
                    } else if (node.config.type_hold_time === "global") {
                        holdTime = node.context().global.get("caseta_hold_time") || 0;
                    } else if (node.config.type_hold_time === "msg") {
                        holdTime = msg.hold_time || 0
                    }

                    bridge.connect(resetConnection).then(function(){
                        node.d("Button press. Holding for " + (holdTime || 0) + " second(s).");
                        bridge.eventStat.emit(node.id, "sending");
                        bridge.sendCommand(node.id, "#DEVICE", node.config.action, 3).then(function (pushed) {
                            setTimeout(
                                function () {
                                    node.d("Button release.");
                                    bridge.sendCommand(node.id, "#DEVICE", node.config.action, 4).then(function (released) {

                                        bridge.eventStat.emit(node.id, "sent", "ready");
                                        done();
                                    }).catch(function (error) {
                                        bridge.eventStat.emit(node.id, "error");
                                        done(error);
                                    })
                                },
                                (holdTime * 1000));

                        }).catch(function (error) {
                            bridge.eventStat.emit(node.id, "error");
                            done(error);
                        });
                    }).catch(function (error) {
                        bridge.eventStat.emit(node.id, "error");
                        done(error);
                    });

                } else {
                    if (node.config.type_param_1 === "num") {
                        cmd.param_1 = parseInt(node.config.param_1);
                    } else if (node.config.type_param_1 === "flow") {
                        cmd.param_1 = node.context().flow.get("caseta_level");
                    } else if (node.config.type_param_1 === "global") {
                        cmd.param_1 = node.context().global.get("caseta_level");
                    } else if (node.config.type_param_1 === "msg") {
                        cmd.param_1 = msg.level || 0
                    }
                    if (node.config.type_param_2 === "num") {
                        cmd.param_2 = parseInt(node.config.param_2);
                    } else if (node.config.type_param_2 === "flow") {
                        cmd.param_2 = node.context().flow.get("caseta_fade_time");
                    } else if (node.config.type_param_2 === "global") {
                        cmd.param_2 = node.context().global.get("caseta_fade_time");
                    } else if (node.config.type_param_2 === "msg") {
                        cmd.param_2 = msg.fade_time || 1
                    }

                    if (typeof cmd.param_1 !== "number" || (cmd.param_1 < 0 || cmd.param_1 > 100)) {
                        done("Invalid value for level.");
                    } else if (typeof cmd.param_2 !== 'number' || (cmd.param_2 < 1 || cmd.param_2 > 90)) {
                        done("Invalid value for fade_time.");
                    } else {
                        try {
                            let date = new Date(null);
                            date.setSeconds(cmd.param_2);
                            const minutes = Math.floor(cmd.param_2  / 60);
                            const seconds = cmd.param_2 - minutes * 60;
                            cmd.param_2  = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
                        } catch (err) {
                            console.warn(err)
                            cmd.param_2 = "0:01";
                        }

                        bridge.connect(resetConnection).then(function(){

                            bridge.eventStat.emit(node.id, "sending");
                            bridge.sendCommand(node.id, "#OUTPUT", cmd.action, cmd.param_1, cmd.param_2).then(function (data) {
                                bridge.eventStat.emit(node.id, "sent", "ready");
                                done();
                            }).catch(function (error) {
                                bridge.eventStat.emit(node.id, "error");
                                done(error);
                            });
                        }).catch(function (error) {
                            bridge.eventStat.emit(node.id, "error");
                            done(error);
                        });


                    }
                }


            });
            node.on('close', function (done) {
                bridge.unregister(node, function (err, res) {
                    node.status({});
                    done();
                });


            });
        } else {
            node.status({fill: "red", shape: "dot", text: "configuration"});
            this.error(RED._("caseta.errors.missing-config"));
        }

        /**
         * Log to console
         * @param {string} msg - Text message
         * @param {object} obj - Optional object to be sent to console
         */
        node.d = function (msg, obj = null) {
            try {
                if (node.config.f_debug === true) node.log(msg);
                if (node.config.f_debug && obj) node.log(obj);
            } catch (err) {
                node.warn(new Error(err));
            }
        }

    }

    RED.nodes.registerType('caseta-control', CasetaControlNode);

}
;



