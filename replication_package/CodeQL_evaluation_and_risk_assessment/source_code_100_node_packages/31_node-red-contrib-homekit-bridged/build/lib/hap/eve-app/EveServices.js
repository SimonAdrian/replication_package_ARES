"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveHistoryData = void 0;
const HAPCharacteristic_1 = __importDefault(require("../HAPCharacteristic"));
const HAPService_1 = __importDefault(require("../HAPService"));
class EveHistoryData extends HAPService_1.default {
    constructor() {
        super('EveHistoryData', EveHistoryData.UUID);
        this.addCharacteristic(HAPCharacteristic_1.default.EveS2R1);
        this.addCharacteristic(HAPCharacteristic_1.default.EveS2R2);
        this.addCharacteristic(HAPCharacteristic_1.default.EveS2W1);
        this.addCharacteristic(HAPCharacteristic_1.default.EveS2W2);
    }
}
exports.EveHistoryData = EveHistoryData;
EveHistoryData.UUID = 'E863F007-079E-48FF-8F27-9C2605A29F52';
HAPService_1.default.EveHistoryData = EveHistoryData;
