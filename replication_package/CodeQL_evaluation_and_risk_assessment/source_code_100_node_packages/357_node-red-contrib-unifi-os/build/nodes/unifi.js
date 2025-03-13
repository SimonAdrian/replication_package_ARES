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
const logger_1 = require("@nrchkb/logger");
const axios_1 = __importDefault(require("axios"));
const util = __importStar(require("util"));
const cookieHelper_1 = require("../lib/cookieHelper");
const HttpError_1 = require("../types/HttpError");
const UnifiResponse_1 = require("../types/UnifiResponse");
(0, logger_1.loggerSetup)({ timestampEnabled: 'UniFi' });
module.exports = (RED) => {
    const log = (0, logger_1.logger)('UniFi');
    axios_1.default.interceptors.request.use((config) => {
        var _a;
        log.debug(`Sending request to: ${config.url}`);
        if (config.headers) {
            const headers = config.headers;
            if (headers.get('cookie') &&
                ((_a = config.method) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'get') {
                const composedCookie = (0, cookieHelper_1.cookieToObject)(headers.get('cookie'));
                if ('TOKEN' in composedCookie) {
                    const [, jwtEncodedBody] = composedCookie['TOKEN'].split('.');
                    if (jwtEncodedBody) {
                        const buffer = Buffer.from(jwtEncodedBody, 'base64');
                        const { csrfToken } = JSON.parse(buffer.toString('ascii'));
                        if (csrfToken) {
                            headers.set('x-csrf-token', csrfToken);
                        }
                    }
                }
            }
        }
        log.trace(util.inspect(config));
        return config;
    }, function (error) {
        log.error(`Failed to send request due to: ${error}`);
        return Promise.reject(error);
    });
    axios_1.default.interceptors.response.use((response) => {
        log.debug(`Successful response from: ${response.config.url}`);
        log.trace(util.inspect(response));
        return response;
    }, function (error) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (axios_1.default.isCancel(error)) {
            log.trace(`Request cancelled: ${error.message}`);
            return Promise.reject(error);
        }
        const nodeId = (_c = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c['X-Request-ID'];
        const relatedNode = RED.nodes.getNode(nodeId);
        const unifiResponse = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data;
        log.error(`Bad response from: ${(_g = (_f = (_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.config) === null || _f === void 0 ? void 0 : _f.url) !== null && _g !== void 0 ? _g : (_h = error === null || error === void 0 ? void 0 : error.config) === null || _h === void 0 ? void 0 : _h.url}`, true, relatedNode);
        log.trace(util.inspect(error === null || error === void 0 ? void 0 : error.response));
        if ((error === null || error === void 0 ? void 0 : error.code) === 'ETIMEDOUT') {
            const msg = 'Connect ETIMEDOUT';
            return Promise.reject(new Error(msg));
        }
        switch ((_j = error === null || error === void 0 ? void 0 : error.response) === null || _j === void 0 ? void 0 : _j.status) {
            case 400:
                if (((_k = unifiResponse === null || unifiResponse === void 0 ? void 0 : unifiResponse.meta) === null || _k === void 0 ? void 0 : _k.msg) ==
                    UnifiResponse_1.UnifiResponseMetaMsg.INVALID_PAYLOAD) {
                    const msg = `Invalid Payload ${(_m = (_l = unifiResponse === null || unifiResponse === void 0 ? void 0 : unifiResponse.meta) === null || _l === void 0 ? void 0 : _l.validationError) === null || _m === void 0 ? void 0 : _m.field} ${(_p = (_o = unifiResponse === null || unifiResponse === void 0 ? void 0 : unifiResponse.meta) === null || _o === void 0 ? void 0 : _o.validationError) === null || _p === void 0 ? void 0 : _p.pattern}`;
                    log.error(msg);
                    return Promise.reject(new Error(msg));
                }
                log.error('Invalid Payload: ' + error, true, relatedNode);
                throw new HttpError_1.HttpError('Invalid Payload', 403);
            case 401:
                if (((_q = unifiResponse === null || unifiResponse === void 0 ? void 0 : unifiResponse.meta) === null || _q === void 0 ? void 0 : _q.msg) ==
                    UnifiResponse_1.UnifiResponseMetaMsg.NO_SITE_CONTEXT) {
                    log.error('No Site Context');
                    return Promise.reject(new Error('No Site Context'));
                }
                log.error('Unauthorized: ' + error, true, relatedNode);
                return Promise.reject(new HttpError_1.HttpError('Unauthorized', 401));
            case 403:
                log.error('Forbidden access: ' + error, true, relatedNode);
                return Promise.reject(new HttpError_1.HttpError('Forbidden access', 403));
            case 404:
                log.error('Endpoint not found: ' + error, true, relatedNode);
                return Promise.reject(new HttpError_1.HttpError('Endpoint not found', 404));
        }
        log.trace(util.inspect(error));
        return Promise.reject(error);
    });
    log.debug('Initialized');
};
