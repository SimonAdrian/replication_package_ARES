"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraIDLocation = exports.ThumbnailSupport = void 0;
var ThumbnailSupport;
(function (ThumbnailSupport) {
    ThumbnailSupport[ThumbnailSupport["START_END"] = 0] = "START_END";
    ThumbnailSupport[ThumbnailSupport["START_WITH_DELAYED_END"] = 1] = "START_WITH_DELAYED_END";
    ThumbnailSupport[ThumbnailSupport["SINGLE_DELAYED"] = 2] = "SINGLE_DELAYED";
    ThumbnailSupport[ThumbnailSupport["SINGLE"] = 3] = "SINGLE";
    ThumbnailSupport[ThumbnailSupport["NONE"] = 4] = "NONE";
})(ThumbnailSupport = exports.ThumbnailSupport || (exports.ThumbnailSupport = {}));
var CameraIDLocation;
(function (CameraIDLocation) {
    CameraIDLocation[CameraIDLocation["PAYLOAD_CAMERA"] = 0] = "PAYLOAD_CAMERA";
    CameraIDLocation[CameraIDLocation["ACTION_ID"] = 1] = "ACTION_ID";
    CameraIDLocation[CameraIDLocation["NONE"] = 2] = "NONE";
    CameraIDLocation[CameraIDLocation["ACTION_RECORDID"] = 3] = "ACTION_RECORDID";
})(CameraIDLocation = exports.CameraIDLocation || (exports.CameraIDLocation = {}));
const EventModels = [
    {
        shapeProfile: {
            action: {
                action: 'add',
                modelKey: 'event',
            },
            payload: {
                type: 'smartDetectLine',
            },
        },
        startMetadata: {
            label: 'Line Crossing Trigger',
            hasMultiple: true,
            sendOnEnd: true,
            id: 'LineCross',
            thumbnailSupport: ThumbnailSupport.NONE,
            idLocation: CameraIDLocation.ACTION_RECORDID,
        },
        endMetadata: {
            valueExpression: '{"detectedTypes":_startData.payload.originalEventData.payload.smartDetectTypes,"linesStatus":payload.metadata.linesStatus,"lineSettings":payload.metadata.linesSettings}',
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
                modelKey: 'event',
            },
            payload: {
                type: 'smartAudioDetect',
            },
        },
        startMetadata: {
            label: 'Audio Detection',
            hasMultiple: true,
            sendOnEnd: true,
            id: 'AudioDetection',
            thumbnailSupport: ThumbnailSupport.SINGLE_DELAYED,
            idLocation: CameraIDLocation.ACTION_RECORDID,
        },
        endMetadata: {
            valueExpression: 'payload.smartDetectTypes',
        },
    },
    {
        shapeProfile: {
            action: {
                modelKey: 'camera',
            },
            payload: {
                isMotionDetected: false,
            },
        },
        startMetadata: {
            label: 'Motion Detection',
            hasMultiple: false,
            id: 'MotionDetection',
            valueExpression: 'payload.isMotionDetected',
            thumbnailSupport: ThumbnailSupport.NONE,
            idLocation: CameraIDLocation.ACTION_ID,
        },
    },
    {
        shapeProfile: {
            action: {
                modelKey: 'camera',
            },
            payload: {
                isMotionDetected: true,
            },
        },
        startMetadata: {
            label: 'Motion Detection',
            hasMultiple: false,
            id: 'MotionDetection',
            valueExpression: 'payload.isMotionDetected',
            thumbnailSupport: ThumbnailSupport.NONE,
            idLocation: CameraIDLocation.ACTION_ID,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'motion',
            },
        },
        startMetadata: {
            label: 'Motion Event',
            hasMultiple: true,
            id: 'MotionEvent',
            thumbnailSupport: ThumbnailSupport.START_WITH_DELAYED_END,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'ring',
            },
        },
        startMetadata: {
            label: 'Door Bell Ring',
            hasMultiple: false,
            id: 'DoorBell',
            thumbnailSupport: ThumbnailSupport.SINGLE_DELAYED,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'smartDetectZone',
                smartDetectTypes: ['package'],
            },
        },
        startMetadata: {
            label: 'Package Detected',
            hasMultiple: false,
            id: 'Package',
            thumbnailSupport: ThumbnailSupport.SINGLE_DELAYED,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'smartDetectZone',
                smartDetectTypes: ['vehicle'],
            },
        },
        startMetadata: {
            label: 'Vehicle Detected',
            hasMultiple: true,
            id: 'Vehicle',
            thumbnailSupport: ThumbnailSupport.START_WITH_DELAYED_END,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'smartDetectZone',
                smartDetectTypes: ['person'],
            },
        },
        startMetadata: {
            label: 'Person Detected',
            hasMultiple: true,
            id: 'Person',
            thumbnailSupport: ThumbnailSupport.START_WITH_DELAYED_END,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'smartDetectZone',
                smartDetectTypes: ['animal'],
            },
        },
        startMetadata: {
            label: 'Animal Detected',
            hasMultiple: true,
            id: 'Animal',
            thumbnailSupport: ThumbnailSupport.START_WITH_DELAYED_END,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
    {
        shapeProfile: {
            action: {
                action: 'add',
            },
            payload: {
                type: 'smartDetectZone',
                smartDetectTypes: ['licensePlate'],
            },
        },
        startMetadata: {
            label: 'License Plate Scan',
            hasMultiple: true,
            id: 'LicensePlate',
            thumbnailSupport: ThumbnailSupport.START_WITH_DELAYED_END,
            idLocation: CameraIDLocation.PAYLOAD_CAMERA,
        },
    },
];
exports.default = EventModels;
