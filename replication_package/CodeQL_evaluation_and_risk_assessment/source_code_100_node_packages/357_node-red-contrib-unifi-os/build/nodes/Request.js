"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const util_1 = __importDefault(require("util"));
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
        }).then(() => {
            body.call(self);
        });
    };
    const body = function () {
        const self = this;
        const log = (0, logger_1.logger)('UniFi', 'Request', self.name, self);
        self.on('input', (msg) => {
            log.debug('Received input message: ' + util_1.default.inspect(msg));
            self.status({
                fill: 'grey',
                shape: 'dot',
                text: 'Sending',
            });
            const inputPayload = validateInputPayload(self, msg.payload);
            const endpoint = (inputPayload === null || inputPayload === void 0 ? void 0 : inputPayload.endpoint) || self.config.endpoint;
            const method = (inputPayload === null || inputPayload === void 0 ? void 0 : inputPayload.method) || self.config.method || 'GET';
            const responseType = (inputPayload === null || inputPayload === void 0 ? void 0 : inputPayload.responseType) || self.config.responseType || 'json';
            let data = undefined;
            if (method != 'GET') {
                data = (inputPayload === null || inputPayload === void 0 ? void 0 : inputPayload.data) || self.config.data;
            }
            self.accessControllerNode
                .request(self.id, endpoint, method, data, responseType)
                .then((data) => {
                self.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'Sent',
                });
                log.debug('Result:');
                log.trace(util_1.default.inspect(data));
                console.log(typeof data);
                const _send = (Result) => {
                    self.send({
                        payload: Result,
                        inputMsg: msg,
                    });
                };
                if (!Buffer.isBuffer(data) && typeof data !== 'string') {
                    _send(data);
                }
            })
                .catch((error) => {
                log.error(error);
                self.status({
                    fill: 'red',
                    shape: 'dot',
                    text: error.message,
                });
            });
        });
        self.status({
            fill: 'green',
            shape: 'dot',
            text: 'Initialized',
        });
        log.debug('Initialized');
    };
    RED.nodes.registerType('unifi-request', init);
    (0, logger_1.logger)('UniFi', 'Request').debug('Type registered');
};
