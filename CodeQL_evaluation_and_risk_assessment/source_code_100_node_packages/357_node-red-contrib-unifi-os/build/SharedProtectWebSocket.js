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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedProtectWebSocket = exports.SocketStatus = void 0;
const logger_1 = require("@nrchkb/logger");
const async_mutex_1 = require("async-mutex");
const ws_1 = __importStar(require("ws"));
const Endpoints_1 = require("./Endpoints");
const ProtectApiUpdates_1 = require("./lib/ProtectApiUpdates");
var SocketStatus;
(function (SocketStatus) {
    SocketStatus[SocketStatus["UNKNOWN"] = 0] = "UNKNOWN";
    SocketStatus[SocketStatus["CONNECTING"] = 1] = "CONNECTING";
    SocketStatus[SocketStatus["CONNECTED"] = 2] = "CONNECTED";
    SocketStatus[SocketStatus["RECOVERING_CONNECTION"] = 3] = "RECOVERING_CONNECTION";
    SocketStatus[SocketStatus["CONNECTION_ERROR"] = 4] = "CONNECTION_ERROR";
    SocketStatus[SocketStatus["HEARTBEAT"] = 5] = "HEARTBEAT";
})(SocketStatus = exports.SocketStatus || (exports.SocketStatus = {}));
class SharedProtectWebSocket {
    constructor(AccessController, config, initialBootstrap) {
        this.RECONNECT_TIMEOUT = 15000;
        this.HEARTBEAT_INTERVAL = 30000;
        this.INITIAL_CONNECT_ERROR_THRESHOLD = 1000;
        this.reconnectAttempts = 0;
        this.currentStatus = SocketStatus.UNKNOWN;
        this.updateStatusForNodes = (Status) => {
            this.currentStatus = Status;
            return new Promise((resolve) => {
                Object.keys(this.callbacks).forEach((ID) => {
                    this.callbacks[ID].statusCallback(Status);
                });
                resolve();
            });
        };
        this.mutex = new async_mutex_1.Mutex();
        this.connectMutex = new async_mutex_1.Mutex();
        this.bootstrap = initialBootstrap;
        this.callbacks = {};
        this.accessControllerConfig = config;
        this.accessController = AccessController;
        if (this.accessControllerConfig.protectSocketHeartbeatInterval) {
            this.HEARTBEAT_INTERVAL = parseInt(this.accessControllerConfig.protectSocketHeartbeatInterval);
        }
        if (this.accessControllerConfig.protectSocketReconnectTimeout) {
            this.RECONNECT_TIMEOUT = parseInt(this.accessControllerConfig.protectSocketReconnectTimeout);
        }
        this.wsLogger = (0, logger_1.logger)('UniFi', 'SharedProtectWebSocket');
        this.connect();
    }
    shutdown() {
        var _a;
        (_a = this.wsLogger) === null || _a === void 0 ? void 0 : _a.debug('shutdown()');
        this.disconnect();
        this.callbacks = {};
    }
    disconnect() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.wsLogger) === null || _a === void 0 ? void 0 : _a.debug('Disconnecting websocket');
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = undefined;
            }
            try {
                (_b = this.ws) === null || _b === void 0 ? void 0 : _b.removeAllListeners();
                if (((_c = this.ws) === null || _c === void 0 ? void 0 : _c.readyState) === ws_1.OPEN) {
                }
                (_d = this.ws) === null || _d === void 0 ? void 0 : _d.terminate();
                this.ws = undefined;
            }
            catch (error) {
                (_e = this.wsLogger) === null || _e === void 0 ? void 0 : _e.debug('Disconnecting websocket error ' + error.stack);
            }
        });
    }
    reset() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.wsLogger) === null || _a === void 0 ? void 0 : _a.debug('PONG received');
            yield this.mutex.runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                var _b;
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = undefined;
                    yield this.updateStatusForNodes(SocketStatus.CONNECTED);
                    try {
                        this.watchDog();
                    }
                    catch (error) {
                        (_b = this.wsLogger) === null || _b === void 0 ? void 0 : _b.error('reset watchdog error: ' + error.stack);
                    }
                }
            }));
        });
    }
    watchDog() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.heartBeatTimer !== undefined)
                clearTimeout(this.heartBeatTimer);
            this.heartBeatTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                (_a = this.wsLogger) === null || _a === void 0 ? void 0 : _a.debug('heartBeatTimer kicked in');
                yield this.updateStatusForNodes(SocketStatus.HEARTBEAT);
                if (!this.ws || ((_b = this.ws) === null || _b === void 0 ? void 0 : _b.readyState) !== ws_1.default.OPEN) {
                    return;
                }
                try {
                    (_c = this.wsLogger) === null || _c === void 0 ? void 0 : _c.debug('gonna PING the server...');
                    (_d = this.ws) === null || _d === void 0 ? void 0 : _d.ping();
                }
                catch (error) {
                    (_e = this.wsLogger) === null || _e === void 0 ? void 0 : _e.error('PING error: ' + error.stack);
                }
                if (this.reconnectTimer !== undefined)
                    clearTimeout(this.reconnectTimer);
                this.reconnectTimer = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    var _f;
                    (_f = this.wsLogger) === null || _f === void 0 ? void 0 : _f.debug('reconnectTimer kicked in');
                    yield this.mutex.runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                        var _g;
                        yield this.disconnect();
                        yield this.updateStatusForNodes(SocketStatus.RECOVERING_CONNECTION);
                        try {
                            yield this.connect();
                        }
                        catch (error) {
                            (_g = this.wsLogger) === null || _g === void 0 ? void 0 : _g.error('connect into reconnectTimer error: ' + error.stack);
                        }
                    }));
                }), this.RECONNECT_TIMEOUT);
            }), this.HEARTBEAT_INTERVAL);
        });
    }
    processData(Data) {
        let objectToSend;
        try {
            objectToSend = JSON.parse(Data.toString());
        }
        catch (_) {
            objectToSend = ProtectApiUpdates_1.ProtectApiUpdates.decodeUpdatePacket(this.wsLogger, Data);
        }
        Object.keys(this.callbacks).forEach((Node) => {
            const Interest = this.callbacks[Node];
            Interest.dataCallback(objectToSend);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutex.runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                if (this.currentStatus !== SocketStatus.RECOVERING_CONNECTION) {
                    yield this.updateStatusForNodes(SocketStatus.CONNECTING);
                }
                const wsPort = this.accessControllerConfig.wsPort ||
                    Endpoints_1.endpoints[this.accessController.controllerType].wsport;
                const url = `${Endpoints_1.endpoints.protocol.webSocket}${this.accessControllerConfig.controllerIp}:${wsPort}/proxy/protect/ws/updates?lastUpdateId=${this.bootstrap.lastUpdateId}`;
                this.disconnect();
                try {
                    this.ws = new ws_1.default(url, {
                        rejectUnauthorized: false,
                        headers: {
                            Cookie: yield this.accessController.getAuthCookie(),
                        },
                    });
                    this.ws.on('error', (error) => {
                        var _a;
                        (_a = this.wsLogger) === null || _a === void 0 ? void 0 : _a.error('connect(): this.ws.on(error: ' + error.stack);
                    });
                    this.ws.on('pong', this.reset.bind(this));
                    this.ws.on('message', this.processData.bind(this));
                }
                catch (error) {
                    this.wsLogger.error('Error instantiating websocket ' + error.stack);
                    clearInterval(this.connectCheckInterval);
                    this.connectCheckInterval = undefined;
                    this.reconnectAttempts = 0;
                    this.watchDog();
                }
                this.connectCheckInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.connectMutex.runExclusive(() => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        switch ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) {
                            case ws_1.default.OPEN:
                                clearInterval(this.connectCheckInterval);
                                this.connectCheckInterval = undefined;
                                yield this.updateStatusForNodes(SocketStatus.CONNECTED);
                                this.reconnectAttempts = 0;
                                this.watchDog();
                                break;
                            case ws_1.default.CONNECTING:
                                break;
                            case ws_1.default.CLOSED:
                            case ws_1.default.CLOSING:
                                if (this.reconnectAttempts >
                                    this.INITIAL_CONNECT_ERROR_THRESHOLD) {
                                    clearInterval(this.connectCheckInterval);
                                    this.connectCheckInterval = undefined;
                                    yield this.updateStatusForNodes(SocketStatus.CONNECTION_ERROR);
                                }
                                else {
                                    clearInterval(this.connectCheckInterval);
                                    this.connectCheckInterval = undefined;
                                    this.reconnectAttempts++;
                                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                        var _b;
                                        try {
                                            yield this.disconnect();
                                            yield this.connect();
                                        }
                                        catch (error) {
                                            (_b = this.wsLogger) === null || _b === void 0 ? void 0 : _b.error('Websocket disconnecting error ' + error.stack);
                                        }
                                    }), this.RECONNECT_TIMEOUT);
                                }
                                break;
                        }
                    }));
                }), 5000);
            }));
        });
    }
    deregisterInterest(nodeId) {
        delete this.callbacks[nodeId];
    }
    registerInterest(nodeId, interest) {
        this.callbacks[nodeId] = interest;
        return this.currentStatus;
    }
    updateLastUpdateId(newBootstrap) {
        if (newBootstrap.lastUpdateId !== this.bootstrap.lastUpdateId) {
            this.disconnect();
            this.bootstrap = newBootstrap;
            this.connect();
        }
        else {
            this.bootstrap = newBootstrap;
        }
    }
}
exports.SharedProtectWebSocket = SharedProtectWebSocket;
