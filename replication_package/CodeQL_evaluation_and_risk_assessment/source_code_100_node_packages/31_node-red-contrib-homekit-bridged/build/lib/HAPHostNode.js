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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
const semver_1 = require("semver");
const preload_1 = __importDefault(require("semver/preload"));
const NRCHKBError_1 = __importDefault(require("./NRCHKBError"));
const HapCategories_1 = __importDefault(require("./types/hap-nodejs/HapCategories"));
const HostType_1 = __importDefault(require("./types/HostType"));
module.exports = (RED, hostType) => {
    const MdnsUtils = require('./utils/MdnsUtils')();
    const init = function (config) {
        var _a, _b, _c, _d, _e, _f;
        const self = this;
        const log = (0, logger_1.logger)('NRCHKB', 'HAPHostNode', config.bridgeName, self);
        self.hostType = hostType;
        RED.nodes.createNode(self, config);
        self.config = config;
        self.name = config.bridgeName;
        if (!hostNameValidator(config.bridgeName)) {
            log.error('Host name is incorrect', false);
            return new NRCHKBError_1.default('Host name is incorrect');
        }
        if (preload_1.default.parse(config.firmwareRev) == null) {
            config.firmwareRev = new semver_1.SemVer('0.0.0');
        }
        if (!((_a = config.bind) === null || _a === void 0 ? void 0 : _a.length) && config.customMdnsConfig) {
            log.error('Custom mdns config is deprecated, use bind instead!');
            self.mdnsConfig = {};
            if (MdnsUtils.checkMulticast(config.mdnsMulticast)) {
                self.mdnsConfig.multicast = config.mdnsMulticast;
            }
            if (MdnsUtils.checkInterface(config.mdnsInterface)) {
                self.mdnsConfig.interface = config.mdnsInterface;
            }
            if (MdnsUtils.checkPort(config.mdnsPort)) {
                self.mdnsConfig.port = parseInt((_b = config.mdnsPort) === null || _b === void 0 ? void 0 : _b.toString());
            }
            if (MdnsUtils.checkIp(config.mdnsIp)) {
                self.mdnsConfig.ip = config.mdnsIp;
            }
            if (MdnsUtils.checkTtl(config.mdnsTtl)) {
                self.mdnsConfig.ttl = parseInt((_c = config.mdnsTtl) === null || _c === void 0 ? void 0 : _c.toString());
            }
            if (MdnsUtils.checkLoopback(config.mdnsLoopback)) {
                self.mdnsConfig.loopback = config.mdnsLoopback;
            }
            if (MdnsUtils.checkReuseAddr(config.mdnsReuseAddr)) {
                self.mdnsConfig.reuseAddr = config.mdnsReuseAddr;
            }
        }
        self.accessoryCategory = (self.hostType == HostType_1.default.BRIDGE
            ? HapCategories_1.default.BRIDGE
            : self.config.accessoryCategory);
        self.published = false;
        try {
            self.bridgeUsername = macify(self.id);
        }
        catch (error) {
            log.error(error);
            return error;
        }
        const hostUUID = hap_nodejs_1.uuid.generate(self.id);
        const hostTypeName = self.hostType == HostType_1.default.BRIDGE ? 'Bridge' : 'Standalone Accessory';
        log.debug(`Creating ${hostTypeName} with UUID ${hostUUID}`);
        if (self.hostType == HostType_1.default.BRIDGE) {
            self.host = new hap_nodejs_1.Bridge(self.name, hostUUID);
        }
        else {
            self.host = new hap_nodejs_1.Accessory(self.name, hostUUID);
        }
        self.publish = function () {
            var _a, _b, _c, _d;
            if (self.hostType == HostType_1.default.BRIDGE) {
                log.debug(`Publishing ${hostTypeName} with pin code ${self.config.pinCode} and ${self.host.bridgedAccessories.length} accessories`);
            }
            else {
                log.debug(`Publishing ${hostTypeName} with pin code ${self.config.pinCode}`);
            }
            if ((self.config.port && self.config.port == 1880) ||
                (((_a = self.mdnsConfig) === null || _a === void 0 ? void 0 : _a.port) && ((_b = self.mdnsConfig) === null || _b === void 0 ? void 0 : _b.port) == 1880)) {
                log.error(`Cannot publish on ${hostTypeName} port 1880 as it is reserved for node-red`);
                self.published = false;
                return false;
            }
            let oldPinCode = self.config.pinCode;
            if ((oldPinCode.match(/-/g) || []).length == 1) {
                oldPinCode = oldPinCode.replace(/-/g, '');
                oldPinCode = `${oldPinCode.slice(0, 3)}-${oldPinCode.slice(3, 5)}-${oldPinCode.slice(5, 8)}`;
            }
            let bind;
            if (((_c = self.config.bind) === null || _c === void 0 ? void 0 : _c.length) && self.config.bindType) {
                if (self.config.bindType == 'str') {
                    bind = self.config.bind;
                }
                else if (self.config.bindType == 'json') {
                    bind = JSON.parse(self.config.bind);
                }
            }
            self.host.publish({
                username: self.bridgeUsername,
                port: self.config.port && !isNaN(self.config.port)
                    ? self.config.port
                    : 0,
                pincode: oldPinCode,
                category: self.accessoryCategory,
                mdns: self.mdnsConfig,
                bind: bind,
                advertiser: (_d = self.config.advertiser) !== null && _d !== void 0 ? _d : "bonjour-hap",
            }, self.config.allowInsecureRequest);
            self.published = true;
            return true;
        };
        self.on('close', function (removed, done) {
            return __awaiter(this, void 0, void 0, function* () {
                if (removed) {
                    log.debug('This node has been deleted');
                    yield self.host.destroy();
                }
                else {
                    log.debug('This node is being restarted');
                    yield self.host.unpublish();
                }
                self.published = false;
                done();
            });
        });
        self.host.on('identify', function (paired, callback) {
            if (paired) {
                log.debug(`Identify called on paired ${hostTypeName}`);
            }
            else {
                log.debug(`Identify called on unpaired ${hostTypeName}`);
            }
            callback();
        });
        const accessoryInformationService = self.host.getService(hap_nodejs_1.Service.AccessoryInformation) ||
            self.host.addService(hap_nodejs_1.Service.AccessoryInformation);
        accessoryInformationService
            .setCharacteristic(hap_nodejs_1.Characteristic.Manufacturer, self.config.manufacturer)
            .setCharacteristic(hap_nodejs_1.Characteristic.SerialNumber, self.config.serialNo)
            .setCharacteristic(hap_nodejs_1.Characteristic.Model, self.config.model)
            .setCharacteristic(hap_nodejs_1.Characteristic.FirmwareRevision, (_d = self.config.firmwareRev) === null || _d === void 0 ? void 0 : _d.toString())
            .setCharacteristic(hap_nodejs_1.Characteristic.HardwareRevision, (_e = self.config.hardwareRev) === null || _e === void 0 ? void 0 : _e.toString())
            .setCharacteristic(hap_nodejs_1.Characteristic.SoftwareRevision, (_f = self.config.softwareRev) === null || _f === void 0 ? void 0 : _f.toString());
    };
    const macify = (nodeId) => {
        if (nodeId) {
            const noDecimalStr = nodeId.replace('.', '');
            const paddedStr = noDecimalStr.padEnd(12, '0');
            const match = paddedStr.match(/.{1,2}/g);
            if (match) {
                return match.join(':').substr(0, 17).toUpperCase();
            }
            else {
                throw new NRCHKBError_1.default(`match failed in macify process for padded string ${paddedStr}`);
            }
        }
        else {
            throw new NRCHKBError_1.default('nodeId cannot be empty in macify process');
        }
    };
    const hostNameValidator = function (hostName) {
        return hostName ? /^[^.]{1,64}$/.test(hostName) : false;
    };
    return {
        init,
        macify,
    };
};
