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
    function CasetaQueryNode(config) {


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

                let resetConnection = false;
                if(msg && msg.force_reconnect && msg.force_reconnect === true){
                    resetConnection = true;
                }
                bridge.connect(resetConnection).then(function(){
                    bridge.eventStat.emit(node.id, "sending");
                    bridge.sendCommand(node.id, "?OUTPUT", node.config.action).then(function (data) {

                        bridge.eventStat.emit(node.id, "sent","ready");
                        done();
                    }).catch(function (error) {
                        bridge.eventStat.emit(node.id, "error");
                        done(error);
                    });
                }).catch(function (error) {
                    bridge.eventStat.emit(node.id, "error");
                    done(error);
                });
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

    RED.nodes.registerType('caseta-query', CasetaQueryNode);

}
;



