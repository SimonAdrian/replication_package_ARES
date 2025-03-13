"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const path = __importStar(require("path"));
const semver_1 = __importDefault(require("semver"));
const Storage_1 = require("../lib/Storage");
(0, logger_1.loggerSetup)({ timestampEnabled: 'NRCHKB' });
const log = (0, logger_1.logger)('NRCHKB');
if (process.env.NRCHKB_EXPERIMENTAL === 'true') {
    log.error('Experimental features enabled');
}
module.exports = (RED) => {
    const deprecatedMinimalNodeVersion = '10.22.1';
    const minimalNodeVersion = '12.0.0';
    const nodeVersion = process.version;
    if (semver_1.default.gte(nodeVersion, deprecatedMinimalNodeVersion)) {
        log.debug(`Node.js version requirement met. Required >=${deprecatedMinimalNodeVersion}. Installed ${nodeVersion}`);
        if (semver_1.default.lt(nodeVersion, minimalNodeVersion)) {
            log.error('Node.js version requirement met but will be deprecated in Node-RED 2.0.0');
            log.error(`Recommended >=${minimalNodeVersion}. Installed ${nodeVersion}. Consider upgrading.`);
        }
    }
    else {
        throw RangeError(`Node.js version requirement not met. Required >=${deprecatedMinimalNodeVersion}. Installed ${nodeVersion}`);
    }
    const API = require('../lib/api')(RED);
    let rootFolder;
    if (RED.settings.available() && RED.settings.userDir) {
        log.debug('RED settings available');
        rootFolder = RED.settings.userDir;
    }
    else {
        log.error('RED settings not available');
        rootFolder = path.join(require('os').homedir(), '.node-red');
    }
    Storage_1.Storage.init(rootFolder, 'nrchkb').then(() => {
        log.debug(`nrchkb storage path set to ${Storage_1.Storage.storagePath()}`);
        API.init();
        const hapStoragePath = path.resolve(rootFolder, 'homekit-persist');
        try {
            hap_nodejs_1.HAPStorage.setCustomStoragePath(hapStoragePath);
            log.debug(`HAPStorage path set to ${hapStoragePath}`);
        }
        catch (error) {
            log.debug('HAPStorage already initialized');
            log.error('node-red restart highly recommended');
            log.trace(error);
        }
        if (process.env.NRCHKB_EXPERIMENTAL === 'true') {
            log.debug('Registering nrchkb type');
            RED.nodes.registerType('nrchkb', function (config) {
                RED.nodes.createNode(this, config);
            });
        }
    });
};
