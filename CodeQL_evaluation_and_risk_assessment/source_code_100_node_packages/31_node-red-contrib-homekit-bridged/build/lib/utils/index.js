"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (node) {
    const ServiceUtils = require('./ServiceUtils')(node);
    const BridgeUtils = require('./BridgeUtils')();
    const AccessoryUtils = require('./AccessoryUtils')(node);
    const CharacteristicUtils = require('./CharacteristicUtils')(node);
    const MdnsUtils = require('./MdnsUtils')();
    return {
        ServiceUtils,
        BridgeUtils,
        AccessoryUtils,
        CharacteristicUtils,
        MdnsUtils,
    };
};
