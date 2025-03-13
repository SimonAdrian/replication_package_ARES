"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const NRCHKBError_1 = __importDefault(require("../NRCHKBError"));
const Storage_1 = require("../Storage");
module.exports = function (node) {
    const log = (0, logger_1.logger)('NRCHKB', 'ServiceUtils2', node.config.name, node);
    const ServiceUtilsLegacy = require('./ServiceUtils')(node);
    const HapNodeJS = require('hap-nodejs');
    const Service = HapNodeJS.Service;
    const Characteristic = HapNodeJS.Characteristic;
    const CameraSource = require('../cameraSource').Camera;
    const NO_RESPONSE_MSG = 'NO_RESPONSE';
    const output = function (allCharacteristics, event, { oldValue, newValue }, connection) {
        var _a, _b, _c, _d, _e;
        const eventObject = typeof event === 'object' ? event : { name: event };
        log.debug(`${eventObject.name} event, oldValue: ${oldValue}, newValue: ${newValue}, connection ${connection === null || connection === void 0 ? void 0 : connection.sessionID}`);
        const msg = {
            name: node.name,
            topic: node.config.topic ? node.config.topic : node.topic_in,
        };
        msg.payload = {};
        msg.hap = {
            event: eventObject,
            allChars: allCharacteristics.reduce((allChars, singleChar) => {
                const cKey = singleChar.constructor.name;
                allChars[cKey] = singleChar.value;
                return allChars;
            }, {}),
            oldValue,
        };
        const key = this.constructor.name;
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
                text: `[${eventObject.name}] ${key}${newValue != undefined ? `: ${newValue}` : ''}`,
            }, 3000);
            (_d = node.childNodes) === null || _d === void 0 ? void 0 : _d.forEach((n) => n.nodeStatusUtils.clearStatusByType('NO_RESPONSE'));
            (_e = node.parentNode) === null || _e === void 0 ? void 0 : _e.nodeStatusUtils.clearStatusByType('NO_RESPONSE');
        }
        msg.payload[key] = newValue;
        if (connection) {
            msg.hap.session = {
                sessionID: connection.sessionID,
                username: connection.username,
                remoteAddress: connection.remoteAddress,
                localAddress: connection.localAddress,
                httpPort: connection.remotePort,
            };
        }
        log.debug(`${node.name} received ${eventObject.name} ${key}: ${newValue}`);
        if (connection || node.hostNode.config.allowMessagePassthrough) {
            node.send(msg);
        }
    };
    const onCharacteristicGet = (allCharacteristics) => function (callback, _context, connection) {
        const characteristic = this;
        const oldValue = characteristic.value;
        const delayedCallback = (value) => {
            var _a;
            const newValue = value !== null && value !== void 0 ? value : characteristic.value;
            if (callback) {
                try {
                    callback(((_a = node.parentNode) !== null && _a !== void 0 ? _a : node).reachable
                        ? null
                        : new hap_nodejs_1.HapStatusError(-70402), newValue);
                }
                catch (_) { }
            }
            output.call(characteristic, allCharacteristics, {
                name: "get",
                context: { key: this.displayName },
            }, { oldValue, newValue }, connection);
        };
        if (node.config.useEventCallback) {
            const callbackID = Storage_1.Storage.saveCallback({
                event: "get",
                callback: delayedCallback,
            });
            log.debug(`Registered callback ${callbackID} for Characteristic ${characteristic.displayName}`);
            output.call(this, allCharacteristics, {
                name: "get",
                context: { callbackID, key: this.displayName },
            }, { oldValue }, connection);
        }
        else {
            delayedCallback();
        }
    };
    const onCharacteristicSet = (allCharacteristics) => function (newValue, callback, _context, connection) {
        var _a;
        try {
            if (callback) {
                callback(((_a = node.parentNode) !== null && _a !== void 0 ? _a : node).reachable
                    ? null
                    : new hap_nodejs_1.HapStatusError(-70402));
            }
        }
        catch (_) { }
        output.call(this, allCharacteristics, {
            name: "set",
            context: { key: this.displayName },
        }, { newValue }, connection);
    };
    const onCharacteristicChange = (allCharacteristics) => function (change) {
        const { oldValue, newValue, context, originator, reason } = change;
        if (oldValue != newValue) {
            output.call(this, allCharacteristics, {
                name: "change",
                context: { reason, key: this.displayName },
            }, { oldValue, newValue, context }, originator);
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
            var _a, _b, _c, _d, _e;
            if (node.supported.indexOf(key) < 0) {
                if (node.config.useEventCallback &&
                    Storage_1.Storage.uuid4Validate(key)) {
                    const callbackID = key;
                    const callbackValue = (_a = msg.payload) === null || _a === void 0 ? void 0 : _a[key];
                    const eventCallback = Storage_1.Storage.loadCallback(callbackID);
                    if (eventCallback) {
                        log.debug(`Calling ${eventCallback.event} callback ${callbackID}`);
                        eventCallback.callback(callbackValue);
                    }
                    else {
                        log.error(`Callback ${callbackID} timeout`);
                    }
                }
                else if (key === 'AdaptiveLightingController' &&
                    node.adaptiveLightingController) {
                    const value = (_b = msg.payload) === null || _b === void 0 ? void 0 : _b[key];
                    const event = value === null || value === void 0 ? void 0 : value.event;
                    if (event === 'disable') {
                        (_c = node.adaptiveLightingController) === null || _c === void 0 ? void 0 : _c.disableAdaptiveLighting();
                    }
                }
                else {
                    log.error(`Instead of '${key}' try one of these characteristics: '${node.supported.join("', '")}'`);
                }
            }
            else {
                const value = (_d = msg.payload) === null || _d === void 0 ? void 0 : _d[key];
                const parentNode = (_e = node.parentNode) !== null && _e !== void 0 ? _e : node;
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
    return {
        getOrCreate,
        onCharacteristicGet,
        onCharacteristicSet,
        onCharacteristicChange,
        onInput,
        onClose,
        waitForParent,
        handleWaitForSetup,
        configureAdaptiveLightning: ServiceUtilsLegacy.configureAdaptiveLightning,
    };
};
