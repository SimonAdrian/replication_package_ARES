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
const lodash_1 = require("lodash");
const util_1 = __importDefault(require("util"));
const EventModels_1 = __importStar(require("../EventModels"));
const SharedProtectWebSocket_1 = require("../SharedProtectWebSocket");
module.exports = (RED) => {
    const reqRootPath = '/proxy/protect/api';
    const getReqPath = (Type, ID) => {
        return `${reqRootPath}/${Type}/${ID}`;
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
                text: 'Access Controller not found / or configured',
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
                        fill: 'grey',
                        shape: 'dot',
                        text: 'Initializing...',
                    });
                    setTimeout(checkAndWait, 1500);
                }
            };
            checkAndWait();
        }).then(() => {
            self.status({
                fill: 'green',
                shape: 'dot',
                text: 'Connected',
            });
            body.call(self);
        });
    };
    const body = function () {
        var _a;
        const self = this;
        const log = (0, logger_1.logger)('UniFi', 'Protect', self.name, self);
        const startEvents = {};
        self.on('close', (_, done) => {
            var _a;
            (_a = self.accessControllerNode.protectSharedWS) === null || _a === void 0 ? void 0 : _a.deregisterInterest(self.id);
            done();
        });
        self.on('input', (msg) => {
            log.debug('Received input message: ' + util_1.default.inspect(msg));
            if (msg.topic) {
                const Path = getReqPath('cameras', msg.topic);
                self.status({
                    fill: 'grey',
                    shape: 'dot',
                    text: 'Sending...',
                });
                self.accessControllerNode
                    .request(self.id, Path, 'PATCH', msg.payload, 'json')
                    .then((data) => {
                    self.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'Sent',
                    });
                    log.debug('Result:');
                    log.trace(util_1.default.inspect(data));
                    self.send([{ payload: data, inputMsg: msg }, undefined]);
                })
                    .catch((error) => {
                    log.error(error);
                    self.status({
                        fill: 'red',
                        shape: 'dot',
                        text: error.message,
                    });
                });
            }
        });
        self.status({
            fill: 'green',
            shape: 'dot',
            text: 'Initialized',
        });
        let _AwaiterResolver;
        const Awaiter = () => {
            return new Promise((Resolve) => {
                _AwaiterResolver = Resolve;
            });
        };
        const handleUpdate = (data) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d, _e, _f, _g, _h, _j;
            if (self.config.debug) {
                self.send([undefined, { payload: data }]);
            }
            const eventId = data.action.id;
            const Now = new Date().getTime();
            const startEvent = startEvents[eventId];
            if (startEvent) {
                const onEnd = startEvent.payload._profile.startMetadata.sendOnEnd === true;
                if (!onEnd) {
                    startEvent.payload.timestamps.endDate =
                        data.payload.end || Now;
                    startEvent.payload.eventStatus = 'EndOfEvent';
                }
                else {
                    startEvent.payload.timestamps = {
                        eventDate: data.payload.end || Now,
                    };
                }
                const hasMeta = startEvent.payload._profile.endMetadata !== undefined;
                if (hasMeta) {
                    if (startEvent.payload._profile.endMetadata
                        .valueExpression !== undefined) {
                        const Waiter = Awaiter();
                        const EXP = RED.util.prepareJSONataExpression(startEvent.payload._profile.endMetadata
                            .valueExpression, self);
                        RED.util.evaluateJSONataExpression(EXP, Object.assign({ _startData: startEvent }, data), (_err, res) => {
                            startEvent.payload.value = res;
                            _AwaiterResolver();
                        });
                        yield Promise.all([Waiter]);
                    }
                    if (startEvent.payload._profile.endMetadata.label !==
                        undefined) {
                        startEvent.payload.event =
                            startEvent.payload._profile.endMetadata.label;
                    }
                }
                const EventThumbnailSupport = startEvent.payload._profile.startMetadata.thumbnailSupport;
                switch (EventThumbnailSupport) {
                    case EventModels_1.ThumbnailSupport.START_END:
                        startEvent.payload.snapshot = {
                            availability: 'NOW',
                            uri: `/proxy/protect/api/events/${eventId}/thumbnail`,
                        };
                        break;
                    case EventModels_1.ThumbnailSupport.START_WITH_DELAYED_END:
                        startEvent.payload.snapshot = {
                            availability: 'WITH_DELAY',
                            uri: `/proxy/protect/api/events/${eventId}/thumbnail`,
                        };
                        break;
                }
                delete startEvent.payload._profile;
                delete startEvent.payload.expectEndEvent;
                self.send([RED.util.cloneMessage(startEvent), undefined]);
                delete startEvents[eventId];
            }
            else {
                let Camera;
                const Cams = ((_b = self.config.cameraIds) === null || _b === void 0 ? void 0 : _b.split(',')) || [];
                const identifiedEvent = EventModels_1.default.find((eventModel) => (0, lodash_1.isMatch)(data, eventModel.shapeProfile));
                if (!identifiedEvent || !identifiedEvent.startMetadata.id) {
                    return;
                }
                switch (identifiedEvent.startMetadata.idLocation) {
                    case EventModels_1.CameraIDLocation.ACTION_ID:
                        if (!Cams.includes(data.action.id)) {
                            return;
                        }
                        Camera =
                            (_d = (_c = self.accessControllerNode.bootstrapObject) === null || _c === void 0 ? void 0 : _c.cameras) === null || _d === void 0 ? void 0 : _d.find((c) => c.id === data.action.id);
                        break;
                    case EventModels_1.CameraIDLocation.PAYLOAD_CAMERA:
                        if (!Cams.includes(data.payload.camera)) {
                            return;
                        }
                        Camera =
                            (_f = (_e = self.accessControllerNode.bootstrapObject) === null || _e === void 0 ? void 0 : _e.cameras) === null || _f === void 0 ? void 0 : _f.find((c) => c.id === data.payload.camera);
                        break;
                    case EventModels_1.CameraIDLocation.ACTION_RECORDID:
                        if (!Cams.includes(data.action.recordId)) {
                            return;
                        }
                        Camera =
                            (_h = (_g = self.accessControllerNode.bootstrapObject) === null || _g === void 0 ? void 0 : _g.cameras) === null || _h === void 0 ? void 0 : _h.find((c) => c.id === data.action.recordId);
                        break;
                }
                if (!Camera) {
                    return;
                }
                const hasEnd = identifiedEvent.startMetadata.hasMultiple === true;
                const onEnd = identifiedEvent.startMetadata.sendOnEnd === true;
                const EVIDsArray = ((_j = self.config.eventIds) === null || _j === void 0 ? void 0 : _j.split(',')) || [];
                const matchedEvent = EVIDsArray.includes(identifiedEvent.startMetadata.id);
                if (!matchedEvent) {
                    return;
                }
                const UserPL = {
                    payload: {
                        event: identifiedEvent.startMetadata.label,
                        eventId: eventId,
                        cameraName: Camera.name,
                        cameraType: Camera.type,
                        cameraId: Camera.id,
                        expectEndEvent: hasEnd && !onEnd,
                    },
                };
                const EventThumbnailSupport = identifiedEvent.startMetadata.thumbnailSupport;
                switch (EventThumbnailSupport) {
                    case EventModels_1.ThumbnailSupport.SINGLE:
                    case EventModels_1.ThumbnailSupport.START_END:
                    case EventModels_1.ThumbnailSupport.START_WITH_DELAYED_END:
                        UserPL.payload.snapshot = {
                            availability: 'NOW',
                            uri: `/proxy/protect/api/events/${eventId}/thumbnail`,
                        };
                        break;
                    case EventModels_1.ThumbnailSupport.SINGLE_DELAYED:
                        UserPL.payload.snapshot = {
                            availability: 'WITH_DELAY',
                            uri: `/proxy/protect/api/events/${eventId}/thumbnail`,
                        };
                        break;
                }
                if (identifiedEvent.startMetadata.valueExpression) {
                    const Waiter = Awaiter();
                    const EXP = RED.util.prepareJSONataExpression(identifiedEvent.startMetadata.valueExpression, self);
                    RED.util.evaluateJSONataExpression(EXP, data, (_err, res) => {
                        UserPL.payload.value = res;
                        _AwaiterResolver();
                    });
                    yield Promise.all([Waiter]);
                }
                UserPL.payload.originalEventData = data;
                UserPL.topic = UserPL.payload.cameraName;
                if (hasEnd && !onEnd) {
                    UserPL.payload.eventStatus = 'StartOfEvent';
                    UserPL.payload.timestamps = {
                        startDate: data.payload.start || Now,
                    };
                    self.send([UserPL, undefined]);
                    startEvents[eventId] = RED.util.cloneMessage(UserPL);
                    startEvents[eventId].payload._profile = identifiedEvent;
                }
                if (hasEnd && onEnd) {
                    UserPL.payload._profile = identifiedEvent;
                    startEvents[eventId] = UserPL;
                }
                if (!hasEnd) {
                    UserPL.payload.timestamps = {
                        eventDate: data.payload.start || Now,
                    };
                    self.send([UserPL, undefined]);
                }
            }
        });
        const statusCallback = (Status) => {
            switch (Status) {
                case SharedProtectWebSocket_1.SocketStatus.UNKNOWN:
                    self.status({
                        fill: 'grey',
                        shape: 'dot',
                        text: 'Unknown',
                    });
                    break;
                case SharedProtectWebSocket_1.SocketStatus.CONNECTION_ERROR:
                    self.status({
                        fill: 'red',
                        shape: 'dot',
                        text: 'Connection error',
                    });
                    break;
                case SharedProtectWebSocket_1.SocketStatus.CONNECTED:
                    self.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'Connected',
                    });
                    break;
                case SharedProtectWebSocket_1.SocketStatus.RECOVERING_CONNECTION:
                    self.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'Recovering connection...',
                    });
                    break;
                case SharedProtectWebSocket_1.SocketStatus.HEARTBEAT:
                    self.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'Sending heartbeat...',
                    });
                    break;
            }
        };
        const I = {
            dataCallback: handleUpdate,
            statusCallback: statusCallback,
        };
        const Status = (_a = self.accessControllerNode.protectSharedWS) === null || _a === void 0 ? void 0 : _a.registerInterest(self.id, I);
        if (Status !== undefined) {
            statusCallback(Status);
        }
        log.debug('Initialized');
    };
    RED.nodes.registerType('unifi-protect', init);
    (0, logger_1.logger)('UniFi', 'Protect').debug('Type registered');
};
