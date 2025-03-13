"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode');
module.exports = (RED) => {
    const HAPServiceNode = require('../lib/HAPServiceNode')(RED);
    log.debug('Registering homekit-service type');
    RED.nodes.registerType('homekit-service', HAPServiceNode.preInit);
};
