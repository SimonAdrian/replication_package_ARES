"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const HostType_1 = __importDefault(require("../lib/types/HostType"));
const log = (0, logger_1.logger)('NRCHKB', 'HAPHostNode');
module.exports = (RED) => {
    const HAPHostNode = require('../lib/HAPHostNode')(RED, HostType_1.default.STANDALONE);
    log.debug('Registering homekit-standalone type');
    RED.nodes.registerType('homekit-standalone', HAPHostNode.init);
};
