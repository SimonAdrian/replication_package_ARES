"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const NodeStatusUtils_1 = require("../lib/utils/NodeStatusUtils");
const log = (0, logger_1.logger)('NRCHKB', 'HAPStatusNode');
module.exports = (RED) => {
    log.debug('Registering homekit-status type');
    RED.nodes.registerType('homekit-status', function (config) {
        const self = this;
        self.config = config;
        RED.nodes.createNode(self, config);
        self.nodeStatusUtils = new NodeStatusUtils_1.NodeStatusUtils(self);
        try {
            self.serviceNode = RED.nodes.getNode(self.config.serviceNodeId);
        }
        catch (error) {
            log.error(error);
        }
        self.on('input', (_) => {
            if (self.serviceNode) {
                self.nodeStatusUtils.setStatus({
                    fill: 'green',
                    shape: 'dot',
                    text: 'Done',
                }, 3000);
                const serializedService = hap_nodejs_1.Service.serialize(self.serviceNode.service);
                self.send({
                    payload: serializedService,
                });
            }
            else {
                self.nodeStatusUtils.setStatus({
                    fill: 'red',
                    shape: 'dot',
                    text: 'Check your config',
                });
            }
        });
        self.on('close', (_, done) => {
            self.serviceNode = undefined;
            done();
        });
    });
};
