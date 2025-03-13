"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
const hap_nodejs_1 = require("hap-nodejs");
module.exports = function (node) {
    const log = (0, logger_1.logger)('NRCHKB', 'CharacteristicUtils', node.config.name, node);
    const ServiceUtils = require('./ServiceUtils')(node);
    const load = function (service, config) {
        let characteristicProperties = {};
        if (config.characteristicProperties &&
            config.characteristicProperties.length > 0) {
            characteristicProperties = JSON.parse(config.characteristicProperties.replace(/\${(.*?)}/g, (_, envName) => node.RED.util.evaluateNodeProperty(envName, 'env', node, {})));
            log.trace('Evaluating value:');
            log.trace(config.characteristicProperties);
            log.trace('Evaluated as:');
            log.trace(JSON.stringify(characteristicProperties));
            for (const key in characteristicProperties) {
                if (!characteristicProperties.hasOwnProperty(key))
                    continue;
                const characteristic = service.getCharacteristic(hap_nodejs_1.Characteristic[key]);
                if (characteristic && characteristicProperties[key]) {
                    log.debug(`Found Characteristic Properties for ${key}`);
                    characteristic.setProps(characteristicProperties[key]);
                }
            }
        }
        return characteristicProperties;
    };
    const subscribeAndGetSupported = function (service) {
        const supported = [];
        const allCharacteristics = service.characteristics.concat(service.optionalCharacteristics);
        node.onCharacteristicGet = ServiceUtils.onCharacteristicGet;
        node.onCharacteristicSet = ServiceUtils.onCharacteristicSet(service.characteristics);
        node.onCharacteristicChange = ServiceUtils.onCharacteristicChange(service.characteristics);
        allCharacteristics.map((characteristic) => {
            const cKey = characteristic.constructor.name;
            supported.push(cKey);
            characteristic.on('get', node.onCharacteristicGet);
            characteristic.on('set', node.onCharacteristicSet);
            characteristic.on('change', node.onCharacteristicChange);
            if (characteristic.displayName === 'Current Temperature') {
                characteristic.props.minValue = -100;
            }
        });
        return [...new Set(supported)];
    };
    return {
        load: load,
        subscribeAndGetSupported: subscribeAndGetSupported,
    };
};
