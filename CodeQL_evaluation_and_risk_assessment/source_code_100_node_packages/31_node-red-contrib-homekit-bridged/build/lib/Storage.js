"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const logger_1 = require("@nrchkb/logger");
const node_persist_1 = __importDefault(require("node-persist"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const NRCHKBError_1 = __importDefault(require("./NRCHKBError"));
const StorageType_1 = require("./types/storage/StorageType");
class Storage {
    static storagePath() {
        if (!Storage.storageInitialized) {
            throw new NRCHKBError_1.default('Storage path was not initialized!');
        }
        return Storage.customStoragePath;
    }
    static init(...storagePathSegments) {
        Storage.customStoragePath = path_1.default.resolve(...storagePathSegments);
        Storage.storageInitialized = true;
        Storage.log.trace('Initializing');
        return node_persist_1.default.init({ dir: Storage.storagePath() });
    }
    static save(type, key, value) {
        const itemName = key ? `${type}-${key}` : type;
        Storage.log.trace(`Saving ${itemName}:${value}`);
        return node_persist_1.default.set(itemName, value);
    }
    static saveCallback(eventCallback, ttl = 10000) {
        const callbackID = (0, uuid_1.v4)();
        Storage.memoryStorage[callbackID] = eventCallback;
        setTimeout(() => {
            if (callbackID in Storage.memoryStorage) {
                Storage.log.debug(`Callback ${callbackID} timeout`);
                eventCallback.callback();
                delete Storage.memoryStorage[callbackID];
            }
        }, ttl);
        return callbackID;
    }
    static saveCustomCharacteristics(value) {
        return Storage.save(StorageType_1.StorageType.CUSTOM_CHARACTERISTICS, undefined, value);
    }
    static saveService(key, value) {
        return Storage.save(StorageType_1.StorageType.SERVICE, key, value);
    }
    static saveAccessory(key, value) {
        return Storage.save(StorageType_1.StorageType.ACCESSORY, key, value);
    }
    static saveHost(key, serializedHost) {
        return Storage.save(StorageType_1.StorageType.HOST, key, serializedHost);
    }
    static load(type, key) {
        const itemName = key ? `${type}-${key}` : type;
        Storage.log.trace(`Loading ${itemName}`);
        return node_persist_1.default.get(itemName);
    }
    static loadCallback(key) {
        if (key in Storage.memoryStorage) {
            Storage.log.trace(`Returning callback ${key}`);
            const value = Storage.memoryStorage[key];
            delete Storage.memoryStorage[key];
            return value;
        }
        return undefined;
    }
    static loadCustomCharacteristics() {
        return Storage.load(StorageType_1.StorageType.CUSTOM_CHARACTERISTICS);
    }
    static loadService(key) {
        return new Promise((resolve, reject) => {
            Storage.load(StorageType_1.StorageType.SERVICE, key).then((value) => {
                if (value === undefined) {
                    reject('Service data not exists');
                }
                else if ('primaryService' in value) {
                    resolve(value);
                }
                else {
                    reject('Service data corrupted');
                }
            });
        });
    }
    static loadAccessory(key) {
        return Storage.load(StorageType_1.StorageType.ACCESSORY, key);
    }
    static loadHost(key) {
        return Storage.load(StorageType_1.StorageType.HOST, key);
    }
    static uuid4Validate(uuid) {
        return (0, uuid_1.validate)(uuid) && (0, uuid_1.version)(uuid) === 4;
    }
}
exports.Storage = Storage;
Storage.storageInitialized = false;
Storage.memoryStorage = {};
Storage.log = (0, logger_1.logger)('NRCHKB', 'Storage');
