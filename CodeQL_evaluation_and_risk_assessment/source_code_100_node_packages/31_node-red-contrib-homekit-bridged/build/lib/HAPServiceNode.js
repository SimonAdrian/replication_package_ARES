"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const NRCHKBError_1 = __importDefault(require("./NRCHKBError"));
const HostType_1 = __importDefault(require("./types/HostType"));
const NodeStatusUtils_1 = require("./utils/NodeStatusUtils");
module.exports = (RED) => {
    const nrchkbConfigCompatibilityOverride = function () {
        const self = this;
        const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode', self.config.name, self);
        if (self.config.isParent === undefined) {
            log.trace(`nrchkbConfigCompatibilityOverride => self.config.isParent=${self.config.isParent} value changed to true`);
            self.config.isParent = true;
        }
        if (self.config.hostType === undefined) {
            log.trace(`nrchkbConfigCompatibilityOverride => self.config.hostType=${self.config.hostType} value changed to HostType.BRIDGE`);
            self.config.hostType = HostType_1.default.BRIDGE;
        }
    };
    const preInit = function (config) {
        const self = this;
        self.nodeStatusUtils = new NodeStatusUtils_1.NodeStatusUtils(self);
        self.config = config;
        self.name = self.config.name;
        const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode', self.config.name, self);
        self.RED = RED;
        self.publishTimers = {};
        nrchkbConfigCompatibilityOverride.call(self);
        RED.nodes.createNode(self, self.config);
        const ServiceUtils = require('./utils/ServiceUtils')(self);
        new Promise((resolve) => {
            if (self.config.waitForSetupMsg) {
                log.debug('Waiting for Setup message. It should be of format {"payload":{"nrchkb":{"setup":{}}}}');
                self.setupDone = false;
                self.nodeStatusUtils.setStatus({
                    fill: 'blue',
                    shape: 'dot',
                    text: 'Waiting for Setup',
                });
                self.handleWaitForSetup = (msg) => ServiceUtils.handleWaitForSetup(self.config, msg, resolve);
                self.on('input', self.handleWaitForSetup);
            }
            else {
                resolve(self.config);
            }
        })
            .then((newConfig) => {
            init.call(self, newConfig);
        })
            .catch((error) => {
            log.error(`Error while starting Service due to ${error}`);
        });
    };
    const init = function (config) {
        const self = this;
        self.config = config;
        const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode', self.config.name, self);
        const ServiceUtils = require('./utils/ServiceUtils')(self);
        if (self.config.isParent) {
            log.debug('Starting Parent Service');
            configure.call(self);
            self.configured = true;
            self.reachable = true;
        }
        else {
            const serviceType = config.serviceName === 'CameraControl' ? 'Camera' : 'Linked';
            ServiceUtils.waitForParent()
                .then(() => {
                log.debug(`Starting  ${serviceType} Service`);
                configure.call(self);
                self.configured = true;
            })
                .catch((error) => {
                log.error(`Error while starting ${serviceType} Service due to ${error}`);
            });
        }
    };
    const configure = function () {
        var _a, _b;
        const self = this;
        const log = (0, logger_1.logger)('NRCHKB', 'HAPServiceNode', self.config.name, self);
        const Utils = require('./utils')(self);
        const AccessoryUtils = Utils.AccessoryUtils;
        const BridgeUtils = Utils.BridgeUtils;
        const CharacteristicUtils = Utils.CharacteristicUtils;
        const ServiceUtils = Utils.ServiceUtils;
        let parentNode;
        if (self.config.isParent) {
            const hostId = self.config.hostType == HostType_1.default.BRIDGE
                ? self.config.bridge
                : self.config.accessoryId;
            self.hostNode = RED.nodes.getNode(hostId);
            if (!self.hostNode) {
                const message = `Host node ${self.config.hostType == HostType_1.default.BRIDGE ? 'Bridge' : 'Standalone Accessory'} ${hostId} not found`;
                log.error(message, false);
                throw new NRCHKBError_1.default(message);
            }
            self.childNodes = [];
            self.childNodes.push(self);
        }
        else {
            parentNode = RED.nodes.getNode(self.config.parentService);
            if (!parentNode) {
                log.error('Parent Node not assigned', false);
                throw new NRCHKBError_1.default('Parent Node not assigned');
            }
            self.parentNode = parentNode;
            self.parentService = self.parentNode.service;
            if (!self.parentService) {
                log.error('Parent Service not assigned', false);
                throw new NRCHKBError_1.default('Parent Service not assigned');
            }
            self.hostNode = self.parentNode.hostNode;
            (_a = self.parentNode.childNodes) === null || _a === void 0 ? void 0 : _a.push(self);
            self.accessory = self.parentNode.accessory;
        }
        self.name = self.config.name;
        if (self.hasOwnProperty('_flow') &&
            self.hasOwnProperty('_alias') &&
            ((_b = self._flow) === null || _b === void 0 ? void 0 : _b.hasOwnProperty('TYPE')) &&
            self._flow.TYPE === 'subflow') {
            self.uniqueIdentifier = self._alias + '/' + self._flow.path;
        }
        else {
            self.uniqueIdentifier = self.id;
        }
        const subtypeUUID = hap_nodejs_1.uuid.generate(self.uniqueIdentifier);
        if (self.config.hostType == HostType_1.default.BRIDGE) {
            if (self.config.isParent) {
                const accessoryUUID = hap_nodejs_1.uuid.generate('A' +
                    self.uniqueIdentifier +
                    self.name +
                    self.config.manufacturer +
                    self.config.serialNo +
                    self.config.model);
                self.accessory = AccessoryUtils.getOrCreate(self.hostNode.host, {
                    name: self.name,
                    UUID: accessoryUUID,
                    manufacturer: self.config.manufacturer,
                    serialNo: self.config.serialNo,
                    model: self.config.model,
                    firmwareRev: self.config.firmwareRev,
                    hardwareRev: self.config.hardwareRev,
                    softwareRev: self.config.softwareRev,
                }, subtypeUUID);
                self.onIdentify = AccessoryUtils.onIdentify;
                self.accessory.on('identify', self.onIdentify);
            }
        }
        else {
            log.debug('Binding Service accessory as Standalone Accessory');
            self.accessory = self.hostNode.host;
        }
        self.service = ServiceUtils.getOrCreate(self.accessory, {
            name: self.name,
            UUID: subtypeUUID,
            serviceName: self.config.serviceName,
            config: self.config,
        }, self.parentService);
        self.characteristicProperties = CharacteristicUtils.load(self.service, self.config);
        ServiceUtils.configureAdaptiveLightning();
        if (self.config.isParent) {
            BridgeUtils.delayedPublish(self);
        }
        self.nodeStatusUtils.setStatus({
            fill: 'yellow',
            shape: 'ring',
            text: self.hostNode.config.pinCode,
        });
        self.supported = CharacteristicUtils.subscribeAndGetSupported(self.service);
        self.on('input', ServiceUtils.onInput);
        self.on('close', ServiceUtils.onClose);
    };
    return {
        preInit,
        init,
    };
};
