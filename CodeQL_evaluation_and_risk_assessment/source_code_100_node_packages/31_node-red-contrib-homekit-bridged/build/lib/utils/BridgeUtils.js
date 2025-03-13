"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const HostType_1 = __importDefault(require("../types/HostType"));
module.exports = function () {
    const delayedPublish = function (node) {
        const log = (0, logger_1.logger)('NRCHKB', 'BridgeUtils', node.config.name, node);
        if (!node.hostNode.published) {
            if (node.publishTimers[node.hostNode.id] !== undefined) {
                clearTimeout(node.publishTimers[node.hostNode.id]);
            }
            const hostTypeName = node.hostNode.hostType == HostType_1.default.BRIDGE
                ? 'Bridge'
                : 'Standalone Accessory';
            node.publishTimers[node.hostNode.id] = setTimeout(function () {
                try {
                    if (!node.hostNode.published) {
                        const published = node.hostNode.publish();
                        if (published) {
                            log.debug(`${hostTypeName} published`);
                        }
                        else {
                            log.error(`${hostTypeName} not published`);
                        }
                    }
                }
                catch (error) {
                    log.error(`${hostTypeName} publish failed due to ${error}`);
                    node.nodeStatusUtils.setStatus({
                        fill: 'red',
                        shape: 'ring',
                        text: 'Error while publishing ' + hostTypeName,
                    });
                }
            }, 5000);
        }
    };
    return {
        delayedPublish: delayedPublish,
    };
};
