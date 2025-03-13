"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const EveCharacteristics_1 = __importDefault(require("./hap/eve-app/EveCharacteristics"));
const Storage_1 = require("./Storage");
const HapCategories_1 = __importDefault(require("./types/hap-nodejs/HapCategories"));
const version = require('../../package.json').version.trim();
module.exports = function (RED) {
    const log = (0, logger_1.logger)('NRCHKB', 'API');
    const _initServiceAPI = () => {
        log.debug('Initialize Service API');
        const serviceData = {
            BatteryService: {
                nrchkbDisabledText: 'BatteryService (deprecated, replaced by Battery)',
            },
            BridgeConfiguration: {
                nrchkbDisabledText: 'BridgeConfiguration (deprecated, unused)',
            },
            BridgingState: {
                nrchkbDisabledText: 'BridgingState (deprecated, unused)',
            },
            CameraEventRecordingManagement: {
                nrchkbDisabledText: 'CameraEventRecordingManagement (deprecated, replaced by CameraRecordingManagement)',
            },
            Relay: {
                nrchkbDisabledText: 'Relay (deprecated, replaced by CloudRelay)',
            },
            Slat: {
                nrchkbDisabledText: 'Slat (deprecated, replaced by Slats)',
            },
            TimeInformation: {
                nrchkbDisabledText: 'TimeInformation (deprecated, unused)',
            },
            TunneledBTLEAccessoryService: {
                nrchkbDisabledText: 'TunneledBTLEAccessoryService (deprecated, replaced by Tunnel)',
            },
        };
        Object.values(hap_nodejs_1.Service)
            .filter((service) => service.prototype instanceof hap_nodejs_1.Service)
            .map((service) => {
            const newService = hap_nodejs_1.Service.serialize(new service());
            newService.displayName = service.name;
            return newService;
        })
            .forEach((serialized) => {
            serviceData[serialized.displayName] = Object.assign(Object.assign({}, serviceData === null || serviceData === void 0 ? void 0 : serviceData[serialized.displayName]), serialized);
        });
        RED.httpAdmin.get('/nrchkb/service/types', RED.auth.needsPermission('nrchkb.read'), (_req, res) => {
            res.json(serviceData);
        });
    };
    const stringifyVersion = (version) => {
        const releaseVersionRegex = /(\d+)\.(\d+)\.(\d+)/;
        const devVersionRegex = /(\d+)\.(\d+)\.(\d+)-dev\.(\d+)/;
        const releaseVersionFound = releaseVersionRegex.test(version);
        const devVersionFound = devVersionRegex.test(version);
        let xyzVersion = '0.0.0';
        if (devVersionFound) {
            try {
                const match = devVersionRegex.exec(version);
                if (match) {
                    xyzVersion = `0.${match[1]}${match[2]}${match[3]}.${match[4]}`;
                }
                else {
                    log.debug('Could not match dev version');
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        else if (releaseVersionFound) {
            try {
                const match = releaseVersionRegex.exec(version);
                if (match) {
                    xyzVersion = match[0];
                }
                else {
                    log.debug('Could not match release version');
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            log.debug('Bad version format');
            xyzVersion = '0.0.0';
        }
        return xyzVersion;
    };
    const _initNRCHKBInfoAPI = () => {
        log.debug('Initialize NRCHKB Info API');
        log.debug(`Running version: ${version}`);
        const xyzVersion = stringifyVersion(version);
        log.debug(`Evaluated as: ${xyzVersion}`);
        const experimental = process.env.NRCHKB_EXPERIMENTAL === 'true';
        log.debug(`Running experimental: ${experimental}`);
        RED.httpAdmin.get('/nrchkb/info', RED.auth.needsPermission('nrchkb.read'), (_req, res) => {
            res.json({
                version: xyzVersion,
                experimental,
            });
        });
    };
    const _initNRCHKBCustomCharacteristicsAPI = () => __awaiter(this, void 0, void 0, function* () {
        const getCustomCharacteristics = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield Storage_1.Storage.loadCustomCharacteristics();
                log.trace('loadCustomCharacteristics()');
                log.trace(value);
                if (Array.isArray(value)) {
                    return value;
                }
                else {
                    log.debug('customCharacteristics is not Array, returning empty value');
                    return EveCharacteristics_1.default;
                }
            }
            catch (error) {
                log.error(`Failed to get customCharacteristics in nrchkbStorage due to ${error}`);
                return EveCharacteristics_1.default;
            }
        });
        const characteristicNameToKey = (name) => {
            return name.replace(' ', '');
        };
        const toNumber = (value, optional = undefined) => {
            const num = Number(value);
            if (isNaN(num)) {
                return optional;
            }
            else
                return num;
        };
        const refreshCustomCharacteristics = (customCharacteristics) => {
            log.debug('Refreshing Custom Characteristics');
            const customCharacteristicKeys = [];
            customCharacteristics.forEach((_a) => {
                var _b, _c, _d, _e;
                var { name, UUID } = _a, props = __rest(_a, ["name", "UUID"]);
                if (!!UUID && !!name) {
                    const key = characteristicNameToKey(name);
                    log.debug(`Adding Custom Characteristic ${name} using key ${key}`);
                    if (customCharacteristicKeys.includes(key)) {
                        log.error(`Cannot add ${name}. Another Custom Characteristic already defined using key ${key}`);
                        return;
                    }
                    const validatedProps = props;
                    if (((_b = validatedProps.validValues) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                        validatedProps.validValues = undefined;
                    }
                    if (!((_c = validatedProps.validValueRanges) === null || _c === void 0 ? void 0 : _c[0]) ||
                        !((_d = validatedProps.validValueRanges) === null || _d === void 0 ? void 0 : _d[1])) {
                        validatedProps.validValueRanges = undefined;
                    }
                    if (((_e = validatedProps.adminOnlyAccess) === null || _e === void 0 ? void 0 : _e.length) === 0) {
                        validatedProps.adminOnlyAccess = undefined;
                    }
                    if (validatedProps.minValue) {
                        validatedProps.minValue = toNumber(validatedProps.minValue);
                    }
                    if (validatedProps.maxValue) {
                        validatedProps.maxValue = toNumber(validatedProps.maxValue);
                    }
                    if (validatedProps.minStep) {
                        validatedProps.minStep = toNumber(validatedProps.minStep);
                    }
                    class CustomCharacteristic extends hap_nodejs_1.Characteristic {
                        constructor() {
                            var _a;
                            super(name, CustomCharacteristic.UUID, Object.assign(Object.assign({}, validatedProps), { perms: (_a = validatedProps.perms) !== null && _a !== void 0 ? _a : [
                                    "pr",
                                    "pw",
                                    "ev",
                                ] }));
                            this.value = this.getDefaultValue();
                        }
                    }
                    CustomCharacteristic.UUID = UUID;
                    Object.defineProperty(CustomCharacteristic, 'name', {
                        value: key,
                        configurable: true,
                    });
                    Object.defineProperty(hap_nodejs_1.Characteristic, key, {
                        value: CustomCharacteristic,
                        configurable: true,
                    });
                    customCharacteristicKeys.push(key);
                }
            });
            new Promise((resolve) => {
                const isRedInitialized = () => {
                    try {
                        RED.nodes.eachNode(() => {
                            return;
                        });
                        resolve(true);
                    }
                    catch (_) {
                        log.debug('Waiting for RED to be initialized');
                        setTimeout(isRedInitialized, 1000);
                    }
                };
                isRedInitialized();
            }).then(() => {
                RED.nodes.eachNode((node) => {
                    if (node.type === 'homekit-service' ||
                        node.type === 'homekit-service2') {
                        const serviceNodeConfig = node;
                        const serviceNode = RED.nodes.getNode(serviceNodeConfig.id);
                        if (serviceNode &&
                            serviceNode.characteristicProperties &&
                            serviceNode.service) {
                            for (const key in serviceNode.characteristicProperties) {
                                if (customCharacteristicKeys.includes(key)) {
                                    const characteristic = serviceNode.service
                                        .getCharacteristic(hap_nodejs_1.Characteristic[key])
                                        .setProps(serviceNode
                                        .characteristicProperties[key]);
                                    serviceNode.supported.push(key);
                                    characteristic.on('get', serviceNode.onCharacteristicGet);
                                    characteristic.on('set', serviceNode.onCharacteristicSet);
                                    characteristic.on('change', serviceNode.onCharacteristicChange);
                                }
                            }
                        }
                    }
                });
            });
        };
        log.debug('Initialize NRCHKBCustomCharacteristicsAPI');
        getCustomCharacteristics().then((value) => refreshCustomCharacteristics(value));
        RED.httpAdmin.get('/nrchkb/config', RED.auth.needsPermission('nrchkb.read'), (_req, res) => __awaiter(this, void 0, void 0, function* () {
            res.json({
                customCharacteristics: yield getCustomCharacteristics(),
            });
        }));
        RED.httpAdmin.post('/nrchkb/config', RED.auth.needsPermission('nrchkb.write'), (req, res) => __awaiter(this, void 0, void 0, function* () {
            const customCharacteristics = req.body.customCharacteristics || EveCharacteristics_1.default;
            Storage_1.Storage.saveCustomCharacteristics(customCharacteristics)
                .then(() => {
                res.sendStatus(200);
                refreshCustomCharacteristics(customCharacteristics);
            })
                .catch((error) => {
                log.error(error);
                res.sendStatus(500);
            });
        }));
    });
    const _initAccessoryAPI = function () {
        log.debug('Initialize Accessory API');
        const accessoryCategoriesData = {};
        Object.keys(HapCategories_1.default)
            .sort()
            .filter((x) => parseInt(x) >= 0)
            .forEach((key) => {
            const keyNumber = key;
            accessoryCategoriesData[keyNumber] = HapCategories_1.default[keyNumber];
        });
        RED.httpAdmin.get('/nrchkb/accessory/categories', RED.auth.needsPermission('nrchkb.read'), (_req, res) => {
            res.json(accessoryCategoriesData);
        });
    };
    const init = () => {
        _initServiceAPI();
        _initNRCHKBInfoAPI();
        _initAccessoryAPI();
        if (process.env.NRCHKB_EXPERIMENTAL === 'true') {
            _initNRCHKBCustomCharacteristicsAPI().then();
        }
    };
    return {
        init,
        stringifyVersion,
    };
};
