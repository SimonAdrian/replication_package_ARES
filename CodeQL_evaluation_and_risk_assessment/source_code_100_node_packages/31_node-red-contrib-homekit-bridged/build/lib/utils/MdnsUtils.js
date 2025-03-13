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
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
const os = __importStar(require("os"));
const MdnsUtils = () => {
    let availableInterfaces;
    const checkIp = function (value) {
        return value.length > 0 && net.isIP(value);
    };
    const checkInterface = function (value) {
        if (value.length < 1) {
            return false;
        }
        if (!availableInterfaces) {
            availableInterfaces = [];
            const networkInterfaces = os.networkInterfaces();
            Object.keys(networkInterfaces).forEach((key) => {
                var _a;
                return (_a = networkInterfaces[key]) === null || _a === void 0 ? void 0 : _a.forEach((networkInterface) => availableInterfaces.push(networkInterface.address));
            });
        }
        return availableInterfaces.indexOf(value) > -1;
    };
    const checkMulticast = function (value) {
        return checkBoolean(value);
    };
    const checkPort = function (value) {
        return value.length > 0 && checkNumber(value);
    };
    const checkLoopback = function (value) {
        return checkBoolean(value);
    };
    const checkReuseAddr = function (value) {
        return checkBoolean(value);
    };
    const checkTtl = function (value) {
        if (value.length > 0 && checkNumber(value)) {
            const ttlInt = parseInt(value);
            return ttlInt >= 0 && ttlInt <= 255;
        }
        else
            return false;
    };
    const checkBoolean = function (value) {
        return typeof value === 'boolean';
    };
    const checkNumber = function (value) {
        return !isNaN(value);
    };
    return {
        checkInterface,
        checkIp,
        checkMulticast,
        checkPort,
        checkLoopback,
        checkReuseAddr,
        checkTtl,
    };
};
module.exports = MdnsUtils;
