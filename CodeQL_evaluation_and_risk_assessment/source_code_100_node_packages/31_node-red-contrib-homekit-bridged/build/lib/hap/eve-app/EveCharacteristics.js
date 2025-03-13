"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveS2W2 = exports.EveS2W1 = exports.EveS2R2 = exports.EveS2R1 = void 0;
const HAPCharacteristic_1 = __importDefault(require("../HAPCharacteristic"));
const EveCharacteristics = [
    {
        UUID: 'E863F10A-079E-48FF-8F27-9C2605A29F52',
        name: 'Eve-Volt',
        format: "float",
        perms: ["pr"],
        description: 'Volt (V) value. Used by Eve.app.',
    },
    {
        UUID: 'E863F126-079E-48FF-8F27-9C2605A29F52',
        name: 'Eve-Ampere',
        format: "float",
        perms: ["pr"],
        description: 'Ampere (A) value. Used by Eve.app.',
    },
    {
        UUID: 'E863F10D-079E-48FF-8F27-9C2605A29F52',
        name: 'Eve-Watt',
        format: "float",
        perms: ["pr"],
        description: 'Watt (W) value. Used by Eve.app, reported as "Consumption".',
    },
    {
        UUID: 'E863F10C-079E-48FF-8F27-9C2605A29F52',
        name: 'Eve-Kilowatt-hour',
        format: "float",
        perms: ["pr"],
        description: 'Kilowatt-hour (kWh) value. Used by Eve.app, reported as Total Consumption.',
    },
    {
        UUID: 'E863F110-079E-48FF-8F27-9C2605A29F52',
        name: 'Eve-Volt-Ampere',
        format: "uint16",
        perms: ["pr"],
        description: 'Volt-Ampere (VA) value. Used by Eve.app.',
    },
];
class EveS2R1 extends HAPCharacteristic_1.default {
    constructor() {
        super('Eve-S2R1', EveS2R1.UUID, {
            format: "data",
            perms: ["pr", "ev", "hd"],
        });
    }
}
exports.EveS2R1 = EveS2R1;
EveS2R1.UUID = 'E863F116-079E-48FF-8F27-9C2605A29F52';
HAPCharacteristic_1.default.EveS2R1 = EveS2R1;
class EveS2R2 extends HAPCharacteristic_1.default {
    constructor() {
        super('Eve-S2R2', EveS2R2.UUID, {
            format: "data",
            perms: ["pr", "ev", "hd"],
        });
    }
}
exports.EveS2R2 = EveS2R2;
EveS2R2.UUID = 'E863F117-079E-48FF-8F27-9C2605A29F52';
HAPCharacteristic_1.default.EveS2R2 = EveS2R2;
class EveS2W1 extends HAPCharacteristic_1.default {
    constructor() {
        super('Eve-S2W1', EveS2W1.UUID, {
            format: "data",
            perms: ["pw", "hd"],
        });
    }
}
exports.EveS2W1 = EveS2W1;
EveS2W1.UUID = 'E863F11C-079E-48FF-8F27-9C2605A29F52';
HAPCharacteristic_1.default.EveS2W1 = EveS2W1;
class EveS2W2 extends HAPCharacteristic_1.default {
    constructor() {
        super('Eve-S2W2', EveS2W2.UUID, {
            format: "data",
            perms: ["pw", "hd"],
        });
    }
}
exports.EveS2W2 = EveS2W2;
EveS2W2.UUID = 'E863F121-079E-48FF-8F27-9C2605A29F52';
HAPCharacteristic_1.default.EveS2W2 = EveS2W2;
exports.default = EveCharacteristics;
