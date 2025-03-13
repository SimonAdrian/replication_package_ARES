"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode2');
module.exports = (RED) => {
    const HAPServiceNode2 = require('../lib/HAPServiceNode2')(RED);
    if (process.env.NRCHKB_EXPERIMENTAL === 'true') {
        log.debug('Registering homekit-service2 type');
        RED.nodes.registerType('homekit-service2', HAPServiceNode2.preInit);
    }
};
