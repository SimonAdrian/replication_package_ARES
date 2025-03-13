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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const crypto = __importStar(require("crypto"));
const util_1 = __importDefault(require("util"));
const ws_1 = __importDefault(require("ws"));
const Endpoints_1 = require("../Endpoints");
const ProtectApiUpdates_1 = require("../lib/ProtectApiUpdates");
const DEFAULT_RECONNECT_TIMEOUT = 90000;
module.exports = (RED) => {
    const validateInputPayload = (self, payload) => {
        var _a;
        if (!((_a = self.config) === null || _a === void 0 ? void 0 : _a.endpoint) && !(payload === null || payload === void 0 ? void 0 : payload.endpoint)) {
            self.status({
                fill: 'red',
                shape: 'dot',
                text: 'Missing endpoint',
            });
            throw new Error('Missing endpoint in either payload or node config');
        }
        return payload;
    };
    const stopWebsocket = (self, log, action, callback) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (self.ws) {
            self.ws.removeAllListeners();
            self.ws.close(1000, `Node ${action}`);
            self.ws.terminate();
            log.debug(`ws ${(_a = self.ws) === null || _a === void 0 ? void 0 : _a['id']} closed`);
            self.ws = undefined;
        }
        else {
            log.debug('ws already closed');
        }
        callback();
    });
    const setupWebsocket = (self) => __awaiter(void 0, void 0, void 0, function* () {
        const connectWebSocket = () => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const wsPort = self.accessControllerNode.config.wsPort ||
                Endpoints_1.endpoints[self.accessControllerNode.controllerType].wsport;
            const url = `${Endpoints_1.endpoints.protocol.webSocket}${self.accessControllerNode.config.controllerIp}:${wsPort}${self.endpoint}`;
            const id = crypto.randomBytes(16).toString('hex');
            const wsLogger = (0, logger_1.logger)('UniFi', `WebSocket:${id}`, self.name, self);
            self.ws = new ws_1.default(url, {
                rejectUnauthorized: false,
                headers: {
                    Cookie: yield self.accessControllerNode
                        .getAuthCookie()
                        .then((value) => value),
                },
            });
            self.ws.id = id;
            if (!self.ws ||
                self.ws.readyState === ws_1.default.CLOSING ||
                self.ws.readyState === ws_1.default.CLOSED) {
                wsLogger.trace(`Unable to connect to UniFi on ${url}. Will retry again later.`);
                self.status({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'Connecting...',
                });
                setTimeout(connectWebSocket, (_b = self.config.reconnectTimeout) !== null && _b !== void 0 ? _b : DEFAULT_RECONNECT_TIMEOUT);
            }
            else {
                self.ws.on('open', function open() {
                    wsLogger.debug(`Connection to ${url} open`);
                    self.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'Connection open',
                    });
                });
                let tick = false;
                self.ws.on('message', (data) => {
                    wsLogger.trace('Received data');
                    try {
                        const parsedData = JSON.parse(data.toString());
                        self.send({
                            payload: parsedData,
                        });
                    }
                    catch (_) {
                        try {
                            const protectApiUpdate = ProtectApiUpdates_1.ProtectApiUpdates.decodeUpdatePacket(wsLogger, data);
                            self.send({
                                payload: protectApiUpdate,
                            });
                        }
                        catch (error) {
                            wsLogger.error(error);
                        }
                    }
                    if (tick) {
                        self.status({
                            fill: 'blue',
                            shape: 'ring',
                            text: 'Receiving data',
                        });
                    }
                    else {
                        self.status({
                            fill: 'grey',
                            shape: 'ring',
                            text: 'Receiving data',
                        });
                    }
                    tick = !tick;
                });
                self.ws.on('error', (error) => {
                    wsLogger.error(`${error}`);
                    self.status({
                        fill: 'red',
                        shape: 'dot',
                        text: 'Error occurred',
                    });
                });
                self.ws.on('close', (code, reason) => {
                    var _a;
                    wsLogger.debug(`Connection to ${url} closed. Code:${code}${reason ? `, reason: ${reason}` : ''}`);
                    self.send([
                        {},
                        {
                            payload: {
                                code,
                                reason,
                                url,
                            },
                        },
                    ]);
                    self.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: `Connection closed. Code:${code}`,
                    });
                    if (code === 1000) {
                        wsLogger.trace('Connection possibly closed by node itself');
                    }
                    else {
                        if (code === 1006) {
                            wsLogger.error('Is UniFi server down?', false);
                        }
                        setTimeout(connectWebSocket, (_a = self.config.reconnectTimeout) !== null && _a !== void 0 ? _a : DEFAULT_RECONNECT_TIMEOUT);
                    }
                });
                self.ws.on('unexpected-response', (request, response) => {
                    wsLogger.error('unexpected-response from the server');
                    try {
                        wsLogger.error(util_1.default.inspect(request));
                        wsLogger.error(util_1.default.inspect(response));
                    }
                    catch (error) {
                        wsLogger.error(error);
                    }
                });
            }
        });
        yield connectWebSocket();
    });
    const init = function (config) {
        const self = this;
        RED.nodes.createNode(self, config);
        self.config = config;
        self.accessControllerNode = RED.nodes.getNode(self.config.accessControllerNodeId);
        if (!self.accessControllerNode) {
            self.status({
                fill: 'red',
                shape: 'dot',
                text: 'Access Controller not found',
            });
            return;
        }
        self.name =
            self.config.name || self.accessControllerNode.name + ':' + self.id;
        new Promise((resolve) => {
            const checkAndWait = () => {
                if (self.accessControllerNode.initialized) {
                    resolve(true);
                }
                else {
                    self.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'Initializing...',
                    });
                    setTimeout(checkAndWait, 1500);
                }
            };
            checkAndWait();
        }).then(() => __awaiter(this, void 0, void 0, function* () {
            yield body.call(self);
        }));
    };
    const body = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const log = (0, logger_1.logger)('UniFi', 'WebSocket', self.name, self);
            self.endpoint = self.config.endpoint;
            yield setupWebsocket(self);
            self.on('input', (msg) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                log.debug('Received input message: ' + util_1.default.inspect(msg));
                const inputPayload = validateInputPayload(self, msg.payload);
                const newEndpoint = (_b = inputPayload.endpoint) !== null && _b !== void 0 ? _b : self.config.endpoint;
                if (newEndpoint === null || newEndpoint === void 0 ? void 0 : newEndpoint.trim().length) {
                    if (self.endpoint != newEndpoint) {
                        self.endpoint = newEndpoint;
                        yield stopWebsocket(self, log, 'reconfigured', () => setupWebsocket(self));
                    }
                    else {
                        log.debug(`Input ignored, endpoint did not change: ${self.endpoint}, ${inputPayload.endpoint}, ${self.config.endpoint}`);
                    }
                }
                else {
                    log.debug(`Input ignored, new endpoint is empty: ${self.endpoint}, ${inputPayload.endpoint}, ${self.config.endpoint}`);
                }
            }));
            self.on('close', (removed, done) => {
                const cleanup = () => __awaiter(this, void 0, void 0, function* () {
                    self.status({
                        fill: 'grey',
                        shape: 'dot',
                        text: 'Disconnecting',
                    });
                    log.debug(`Disconnecting - node ${removed ? 'removed' : 'restarted'}`);
                    yield stopWebsocket(self, log, `${removed ? 'removed' : 'restarted'}`, done);
                });
                cleanup();
            });
            if (((_a = self.endpoint) === null || _a === void 0 ? void 0 : _a.trim().length) && !!self.ws) {
                yield setupWebsocket(self);
            }
            self.status({
                fill: 'green',
                shape: 'dot',
                text: 'Initialized',
            });
            log.debug('Initialized');
        });
    };
    RED.nodes.registerType('unifi-web-socket', init);
    (0, logger_1.logger)('UniFi', 'WebSocket').debug('Type registered');
};
