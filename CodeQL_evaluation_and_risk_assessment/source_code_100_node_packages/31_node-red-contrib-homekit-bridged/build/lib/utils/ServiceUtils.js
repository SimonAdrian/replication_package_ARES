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
const util = __importStar(require("node:util"));
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const NRCHKBError_1 = __importDefault(require("../NRCHKBError"));
module.exports = function (node) {
    const log = (0, logger_1.logger)('NRCHKB', 'ServiceUtils', node.config.name, node);
    const HapNodeJS = require('hap-nodejs');
    const Service = HapNodeJS.Service;
    const Characteristic = HapNodeJS.Characteristic;
    const CameraSource = require('../cameraSource').Camera;
    const NO_RESPONSE_MSG = 'NO_RESPONSE';
    const prepareHapData = (context, connection) => {
        const hap = {};
        if (connection) {
            hap.session = {
                sessionID: connection.sessionID,
                username: connection.username,
                remoteAddress: connection.remoteAddress,
                localAddress: connection.localAddress,
                httpPort: connection.remotePort,
            };
            hap.context = {};
        }
        if (context) {
            hap.context = context;
        }
        return hap;
    };
    const onCharacteristicGet = function (callback, context, connection) {
        var _a, _b;
        log.debug(`onCharacteristicGet with status: ${this.statusCode}, value: ${this.value}, reachability is ${((_a = node.parentNode) !== null && _a !== void 0 ? _a : node).reachable} with context ${util.inspect(context)} on connection ${connection === null || connection === void 0 ? void 0 : connection.sessionID}`);
        if (callback) {
            try {
                callback(((_b = node.parentNode) !== null && _b !== void 0 ? _b : node).reachable
                    ? null
                    : new hap_nodejs_1.HapStatusError(-70402), this.value);
            }
            catch (_) { }
        }
    };
    const onValueChange = function (allCharacteristics, outputNumber, { oldValue, newValue, context }, connection) {
        var _a, _b, _c, _d, _e;
        const topic = node.config.topic ? node.config.topic : node.topic_in;
        const msg = { payload: {}, hap: {}, name: node.name, topic: topic };
        const key = this.constructor.name;
        msg.payload[key] = newValue;
        msg.hap = prepareHapData(context, connection);
        msg.hap.allChars = allCharacteristics.reduce((allChars, singleChar) => {
            const cKey = singleChar.constructor.name;
            allChars[cKey] = singleChar.value;
            return allChars;
        }, {});
        if (oldValue !== undefined) {
            msg.hap.oldValue = oldValue;
        }
        msg.hap.reachable = (_a = node.reachable) !== null && _a !== void 0 ? _a : (_b = node.parentNode) === null || _b === void 0 ? void 0 : _b.reachable;
        if (msg.hap.reachable === false) {
            ;
            [node, ...((_c = node.childNodes) !== null && _c !== void 0 ? _c : [])].forEach((n) => n.nodeStatusUtils.setStatus({
                fill: 'red',
                shape: 'ring',
                text: 'Not reachable',
                type: 'NO_RESPONSE',
            }));
        }
        else {
            msg.hap.newValue = newValue;
            node.nodeStatusUtils.setStatus({
                fill: 'yellow',
                shape: 'dot',
                text: key + ': ' + newValue,
            }, 3000);
            (_d = node.childNodes) === null || _d === void 0 ? void 0 : _d.forEach((n) => n.nodeStatusUtils.clearStatusByType('NO_RESPONSE'));
            (_e = node.parentNode) === null || _e === void 0 ? void 0 : _e.nodeStatusUtils.clearStatusByType('NO_RESPONSE');
        }
        log.debug(`${node.name} received ${key} : ${newValue}`);
        if (connection ||
            context ||
            node.hostNode.config.allowMessagePassthrough) {
            if (outputNumber === 0) {
                node.send(msg);
            }
            else if (outputNumber === 1) {
                node.send([null, msg]);
            }
        }
    };
    const onCharacteristicSet = (allCharacteristics) => function (newValue, callback, context, connection) {
        var _a, _b;
        log.debug(`onCharacteristicSet with status: ${this.statusCode}, value: ${this.value}, reachability is ${((_a = node.parentNode) !== null && _a !== void 0 ? _a : node).reachable} 
            with context ${util.inspect(context)} on connection ${connection === null || connection === void 0 ? void 0 : connection.sessionID}`);
        try {
            if (callback) {
                callback(((_b = node.parentNode) !== null && _b !== void 0 ? _b : node).reachable
                    ? null
                    : new hap_nodejs_1.HapStatusError(-70402));
            }
        }
        catch (_) { }
        onValueChange.call(this, allCharacteristics, 1, {
            newValue,
            context,
        }, connection);
    };
    const onCharacteristicChange = (allCharacteristics) => function (change) {
        var _a;
        const { oldValue, newValue, context, originator, reason } = change;
        log.debug(`onCharacteristicChange with reason: ${reason}, oldValue: ${oldValue}, newValue: ${newValue}, reachability is ${((_a = node.parentNode) !== null && _a !== void 0 ? _a : node).reachable} 
            with context ${util.inspect(context)} on connection ${originator === null || originator === void 0 ? void 0 : originator.sessionID}`);
        if (oldValue != newValue) {
            onValueChange.call(this, allCharacteristics, 0, {
                oldValue,
                newValue,
                context,
            }, originator);
        }
    };
    const onInput = function (msg) {
        var _a, _b;
        if (msg.payload) {
            const type = typeof msg.payload;
            if (type !== 'object') {
                log.error(`Invalid payload type: ${type}`);
                return;
            }
        }
        else {
            log.error('Invalid message (payload missing)');
            return;
        }
        const topic = (_a = node.config.topic) !== null && _a !== void 0 ? _a : node.name;
        if (node.config.filter && msg.topic !== topic) {
            log.debug("msg.topic doesn't match configured value and filter is enabled. Dropping message.");
            return;
        }
        let context = null;
        if (msg.payload.Context) {
            context = msg.payload.Context;
            delete msg.payload.Context;
        }
        node.topic_in = (_b = msg.topic) !== null && _b !== void 0 ? _b : '';
        Object.keys(msg.payload).map((key) => {
            var _a, _b, _c, _d;
            if (node.supported.indexOf(key) < 0) {
                if (key === 'AdaptiveLightingController' &&
                    node.adaptiveLightingController) {
                    const value = (_a = msg.payload) === null || _a === void 0 ? void 0 : _a[key];
                    const event = value === null || value === void 0 ? void 0 : value.event;
                    if (event === 'disable') {
                        (_b = node.adaptiveLightingController) === null || _b === void 0 ? void 0 : _b.disableAdaptiveLighting();
                    }
                }
                else {
                    log.error(`Instead of '${key}' try one of these characteristics: '${node.supported.join("', '")}'`);
                }
            }
            else {
                const value = (_c = msg.payload) === null || _c === void 0 ? void 0 : _c[key];
                const parentNode = (_d = node.parentNode) !== null && _d !== void 0 ? _d : node;
                parentNode.reachable = value !== NO_RESPONSE_MSG;
                const characteristic = node.service.getCharacteristic(Characteristic[key]);
                if (context !== null) {
                    characteristic.setValue(value, undefined, context);
                }
                else {
                    characteristic.setValue(value);
                }
            }
        });
    };
    const onClose = function (removed, done) {
        const characteristics = node.service.characteristics.concat(node.service.optionalCharacteristics);
        characteristics.forEach(function (characteristic) {
            characteristic.removeListener('get', node.onCharacteristicGet);
            characteristic.removeListener('set', node.onCharacteristicSet);
            characteristic.removeListener('change', node.onCharacteristicChange);
        });
        if (node.config.isParent) {
            node.accessory.removeListener('identify', node.onIdentify);
        }
        if (removed) {
            if (node.config.isParent) {
                node.hostNode.host.removeBridgedAccessories([node.accessory]);
                node.accessory.destroy();
            }
            else {
                node.accessory.removeService(node.service);
                node.parentService.removeLinkedService(node.service);
            }
        }
        done();
    };
    const getOrCreate = function (accessory, serviceInformation, parentService) {
        const newService = new Service[serviceInformation.serviceName](serviceInformation.name, serviceInformation.UUID);
        log.debug(`Looking for service with UUID ${serviceInformation.UUID} ...`);
        let service = accessory.services.find((service) => {
            return newService.subtype === service.subtype;
        });
        if (service && newService.UUID !== service.UUID) {
            log.debug('... service type changed! Removing the old service.');
            accessory.removeService(service);
            service = undefined;
        }
        if (!service) {
            log.debug(`... didn't find it. Adding new ${serviceInformation.serviceName} service.`);
            if (serviceInformation.serviceName === 'CameraControl') {
                configureCameraSource(accessory, newService, serviceInformation.config);
                service = newService;
            }
            else {
                service = accessory.addService(newService);
            }
        }
        else {
            log.debug('... found it! Updating it.');
            service
                .getCharacteristic(Characteristic.Name)
                .setValue(serviceInformation.name);
        }
        if (parentService) {
            if (serviceInformation.serviceName === 'CameraControl') {
                log.debug('... and adding service to accessory.');
            }
            else if (service) {
                log.debug('... and linking service to parent.');
                parentService.addLinkedService(service);
            }
        }
        return service;
    };
    const configureCameraSource = function (accessory, service, config) {
        if (config.cameraConfigSource) {
            log.debug('Configuring Camera Source');
            if (!config.cameraConfigVideoProcessor) {
                log.error('Missing configuration for CameraControl: videoProcessor cannot be empty!');
            }
            else {
                accessory.configureCameraSource(new CameraSource(service, config, node));
            }
        }
        else {
            log.error('Missing configuration for CameraControl.');
        }
    };
    const waitForParent = () => {
        log.debug('Waiting for Parent Service');
        return new Promise((resolve) => {
            node.nodeStatusUtils.setStatus({
                fill: 'blue',
                shape: 'dot',
                text: 'Waiting for Parent Service',
            });
            const checkAndWait = () => {
                const parentNode = node.RED.nodes.getNode(node.config.parentService);
                if (parentNode && parentNode.configured) {
                    resolve(parentNode);
                }
                else {
                    setTimeout(checkAndWait, 1000);
                }
            };
            checkAndWait();
        }).catch((error) => {
            log.error(`Waiting for Parent Service failed due to: ${error}`);
            throw new NRCHKBError_1.default(error);
        });
    };
    const handleWaitForSetup = (config, msg, resolve) => {
        if (node.setupDone) {
            return;
        }
        if (msg.hasOwnProperty('payload') &&
            msg.payload.hasOwnProperty('nrchkb') &&
            msg.payload.nrchkb.hasOwnProperty('setup')) {
            node.setupDone = true;
            const newConfig = Object.assign(Object.assign({}, config), msg.payload.nrchkb.setup);
            node.removeListener('input', node.handleWaitForSetup);
            resolve(newConfig);
        }
        else {
            log.error('Invalid message (required {"payload":{"nrchkb":{"setup":{}}}})');
        }
    };
    const configureAdaptiveLightning = () => {
        if (node.service.UUID === Service.Lightbulb.UUID &&
            node.config.adaptiveLightingOptionsEnable) {
            try {
                node.service.getCharacteristic(Characteristic.Brightness);
                node.service.getCharacteristic(Characteristic.ColorTemperature);
                const options = {
                    controllerMode: node.config.adaptiveLightingOptionsMode
                        ? +node.config.adaptiveLightingOptionsMode
                        : 1,
                    customTemperatureAdjustment: node.config
                        .adaptiveLightingOptionsCustomTemperatureAdjustment
                        ? +node.config
                            .adaptiveLightingOptionsCustomTemperatureAdjustment
                        : undefined,
                };
                log.trace(`Configuring Adaptive Lighting with options: ${options}`);
                const adaptiveLightingController = new hap_nodejs_1.AdaptiveLightingController(node.service, options);
                adaptiveLightingController.on('update', () => {
                    const activeAdaptiveLightingTransition = {
                        transitionStartMillis: adaptiveLightingController.getAdaptiveLightingStartTimeOfTransition(),
                        timeMillisOffset: adaptiveLightingController.getAdaptiveLightingTimeOffset(),
                        transitionCurve: adaptiveLightingController.getAdaptiveLightingTransitionCurve(),
                        brightnessAdjustmentRange: adaptiveLightingController.getAdaptiveLightingBrightnessMultiplierRange(),
                        updateInterval: adaptiveLightingController.getAdaptiveLightingUpdateInterval(),
                        notifyIntervalThreshold: adaptiveLightingController.getAdaptiveLightingNotifyIntervalThreshold(),
                    };
                    node.send({
                        payload: {
                            AdaptiveLightingController: {
                                event: 'update',
                                data: activeAdaptiveLightingTransition,
                            },
                        },
                    });
                });
                adaptiveLightingController.on('disable', () => {
                    node.send({
                        payload: {
                            AdaptiveLightingController: {
                                event: 'disable',
                            },
                        },
                    });
                });
                node.accessory.configureController(adaptiveLightingController);
                node.adaptiveLightingController = adaptiveLightingController;
            }
            catch (error) {
                log.error(`Failed to configure Adaptive Lightning due to ${error}`);
            }
        }
    };
    return {
        getOrCreate,
        onCharacteristicGet,
        onCharacteristicSet,
        onCharacteristicChange,
        onInput,
        onClose,
        waitForParent,
        handleWaitForSetup,
        configureAdaptiveLightning,
    };
};
