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
const axios_1 = __importDefault(require("axios"));
const https = __importStar(require("https"));
const Endpoints_1 = require("../Endpoints");
const SharedProtectWebSocket_1 = require("../SharedProtectWebSocket");
const HttpError_1 = require("../types/HttpError");
const { AbortController, } = require('abortcontroller-polyfill/dist/cjs-ponyfill');
const bootstrapURI = '/proxy/protect/api/bootstrap';
let hasProtect = true;
const urlBuilder = (self, endpoint) => {
    var _a;
    return (Endpoints_1.endpoints.protocol.base +
        self.config.controllerIp +
        (((_a = self.config.controllerPort) === null || _a === void 0 ? void 0 : _a.trim().length)
            ? `:${self.config.controllerPort}`
            : '') +
        endpoint);
};
module.exports = (RED) => {
    const body = function (config) {
        var _a;
        const self = this;
        const log = (0, logger_1.logger)('UniFi', 'AccessController', self.name, self);
        RED.nodes.createNode(self, config);
        self.config = config;
        self.initialized = false;
        self.authenticated = false;
        self.stopped = false;
        self.controllerType = (_a = self.config.controllerType) !== null && _a !== void 0 ? _a : 'UniFiOSConsole';
        self.abortController = new AbortController();
        RED.httpAdmin.get(`/nrchkb/unifi/bootsrap/${self.id}/`, RED.auth.needsPermission('flows.write'), (_req, res) => {
            if (self.bootstrapObject) {
                res.status(200).json(self.bootstrapObject);
            }
            else {
                res.status(501).end();
            }
        });
        const removeBootstrapHTTPEndpoint = () => {
            const Check = (Route) => {
                if (Route.route === undefined) {
                    return true;
                }
                if (!Route.route.path.startsWith(`/nrchkb/unifi/bootsrap/${self.id}`)) {
                    return true;
                }
                return false;
            };
            RED.httpAdmin._router.stack =
                RED.httpAdmin._router.stack.filter(Check);
        };
        const getBootstrap = (init) => __awaiter(this, void 0, void 0, function* () {
            if (hasProtect) {
                self.request(self.id, bootstrapURI, 'GET', undefined, 'json')
                    .then((res) => {
                    var _a;
                    self.bootstrapObject = res;
                    if (init) {
                        self.protectSharedWS = new SharedProtectWebSocket_1.SharedProtectWebSocket(self, self.config, self.bootstrapObject);
                    }
                    else {
                        (_a = self.protectSharedWS) === null || _a === void 0 ? void 0 : _a.updateLastUpdateId(self.bootstrapObject);
                    }
                })
                    .catch((error) => {
                    hasProtect = false;
                    log.debug(`Received error when obtaining bootstrap: ${error}, assuming this is to be expected, i.e no protect instance.`);
                });
            }
        });
        const refresh = (init) => {
            self.getAuthCookie(true)
                .catch((error) => {
                console.error(error);
                log.error('Failed to pre authenticate');
            })
                .then(() => {
                if (init) {
                    log.debug('Initialized');
                    self.initialized = true;
                    log.debug('Successfully pre authenticated');
                }
                else {
                    log.debug('Cookies refreshed');
                }
                getBootstrap(init);
            });
        };
        const refreshTimeout = setInterval(() => {
            refresh();
        }, 2700000);
        self.getAuthCookie = (regenerate) => {
            if (self.authCookie && regenerate !== true) {
                log.debug('Returning stored auth cookie');
                return Promise.resolve(self.authCookie);
            }
            const url = urlBuilder(self, Endpoints_1.endpoints[self.controllerType].login.url);
            return new Promise((resolve) => {
                const authenticateWithRetry = () => {
                    axios_1.default.post(url, {
                        username: self.credentials.username,
                        password: self.credentials.password,
                    }, {
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false,
                            keepAlive: true,
                        }),
                        signal: self.abortController.signal,
                    })
                        .then((response) => {
                        var _a;
                        if (response.status === 200) {
                            self.authCookie =
                                (_a = response.headers['set-cookie']) === null || _a === void 0 ? void 0 : _a[0];
                            log.trace(`Cookie received: ${self.authCookie}`);
                            self.authenticated = true;
                            resolve(self.authCookie);
                        }
                    })
                        .catch((reason) => {
                        if ((reason === null || reason === void 0 ? void 0 : reason.name) === 'AbortError') {
                            log.error('Request Aborted');
                        }
                        self.authenticated = false;
                        self.authCookie = undefined;
                        if (!self.stopped) {
                            setTimeout(authenticateWithRetry, Endpoints_1.endpoints[self.controllerType].login.retry);
                        }
                    });
                };
                authenticateWithRetry();
            });
        };
        self.request = (nodeId, endpoint, method, data, responseType) => __awaiter(this, void 0, void 0, function* () {
            if (!endpoint) {
                Promise.reject(new Error('endpoint cannot be empty!'));
            }
            if (!method) {
                Promise.reject(new Error('method cannot be empty!'));
            }
            const url = urlBuilder(self, endpoint);
            return new Promise((resolve, reject) => {
                const axiosRequest = () => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const Config = {
                        url,
                        method,
                        data,
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false,
                            keepAlive: true,
                        }),
                        headers: {
                            cookie: (_a = (yield self.getAuthCookie())) !== null && _a !== void 0 ? _a : '',
                            'Content-Type': 'application/json',
                            'Accept-Encoding': 'gzip, deflate, br',
                            Accept: 'application/json',
                            'X-Request-ID': nodeId,
                        },
                        withCredentials: true,
                        responseType,
                    };
                    axios_1.default.request(Config)
                        .catch((error) => {
                        if (error instanceof HttpError_1.HttpError) {
                            if (error.status === 401) {
                                self.authenticated = false;
                                self.authCookie = undefined;
                                setTimeout(axiosRequest, Endpoints_1.endpoints[self.controllerType].login
                                    .retry);
                            }
                        }
                        reject(error);
                    })
                        .then((response) => {
                        if (response) {
                            resolve(response.data);
                        }
                    });
                });
                axiosRequest();
            });
        });
        self.on('close', (_, done) => {
            var _a;
            self.stopped = true;
            clearTimeout(refreshTimeout);
            removeBootstrapHTTPEndpoint();
            (_a = self.protectSharedWS) === null || _a === void 0 ? void 0 : _a.shutdown();
            self.abortController.abort();
            const logout = () => __awaiter(this, void 0, void 0, function* () {
                var _b;
                const url = urlBuilder(self, Endpoints_1.endpoints[self.controllerType].logout.url);
                axios_1.default.post(url, {}, {
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false,
                        keepAlive: true,
                    }),
                    headers: {
                        cookie: (_b = (yield self.getAuthCookie())) !== null && _b !== void 0 ? _b : '',
                    },
                })
                    .catch((error) => {
                    console.error(error);
                    log.error('Failed to log out');
                    done();
                })
                    .then(() => {
                    log.trace('Successfully logged out');
                    done();
                });
            });
            logout();
        });
        refresh(true);
    };
    RED.nodes.registerType('unifi-access-controller', body, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' },
        },
    });
    (0, logger_1.logger)('UniFi', 'AccessController').debug('Type registered');
};
