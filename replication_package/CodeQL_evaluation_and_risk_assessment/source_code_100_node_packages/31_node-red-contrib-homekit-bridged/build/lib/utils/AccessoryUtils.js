"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@nrchkb/logger");
module.exports = function (node) {
    const HapNodeJS = require('hap-nodejs');
    const Accessory = HapNodeJS.Accessory;
    const Service = HapNodeJS.Service;
    const Characteristic = HapNodeJS.Characteristic;
    const log = (0, logger_1.logger)('NRCHKB', 'AccessoryUtils', node.config.name, node);
    const getOrCreate = function (host, accessoryInformation, subtypeUUID) {
        let accessory;
        const services = [];
        log.debug(`Looking for accessory with service subtype ${subtypeUUID} ...`);
        accessory = host.bridgedAccessories.find((a) => {
            const service = a.services.find((s) => {
                return s.subtype === subtypeUUID;
            });
            return service !== undefined;
        });
        if (accessory) {
            const accessoryInformationService = accessory.getService(Service.AccessoryInformation) ||
                accessory.addService(Service.AccessoryInformation);
            if (accessoryInformationService.getCharacteristic(Characteristic.Manufacturer).value !== accessoryInformation.manufacturer ||
                accessoryInformationService.getCharacteristic(Characteristic.Model).value !== accessoryInformation.model ||
                accessoryInformationService.getCharacteristic(Characteristic.Name).value !== accessoryInformation.name ||
                accessoryInformationService.getCharacteristic(Characteristic.SerialNumber).value !== accessoryInformation.serialNo) {
                log.debug('... Manufacturer, Model, Name or Serial Number changed! Replacing it.');
                accessory.services
                    .filter((service) => service.UUID !== Service.AccessoryInformation.UUID)
                    .forEach((service) => {
                    accessory === null || accessory === void 0 ? void 0 : accessory.removeService(service);
                    services.push(service);
                });
                host.removeBridgedAccessory(accessory, false);
                accessory.destroy();
                accessory = undefined;
            }
            else {
                log.debug('... found it! Updating it.');
            }
        }
        else {
            log.debug(`... didn't find it. Adding new accessory with name ${accessoryInformation.name} and UUID ${accessoryInformation.UUID}`);
        }
        let accessoryInformationService;
        if (!accessory) {
            accessory = new Accessory(accessoryInformation.name, accessoryInformation.UUID);
            services.forEach((service) => {
                accessory === null || accessory === void 0 ? void 0 : accessory.addService(service);
            });
            accessoryInformationService =
                (accessory === null || accessory === void 0 ? void 0 : accessory.getService(Service.AccessoryInformation)) ||
                    (accessory === null || accessory === void 0 ? void 0 : accessory.addService(Service.AccessoryInformation));
            accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(Characteristic.Name, accessoryInformation.name).setCharacteristic(Characteristic.Manufacturer, accessoryInformation.manufacturer).setCharacteristic(Characteristic.SerialNumber, accessoryInformation.serialNo).setCharacteristic(Characteristic.Model, accessoryInformation.model);
            const revisionRegex = /\d+\.\d+\.\d+/;
            if (accessoryInformation.firmwareRev &&
                accessoryInformation.firmwareRev.match(revisionRegex)) {
                accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(Characteristic.FirmwareRevision, accessoryInformation.firmwareRev);
            }
            if (accessoryInformation.hardwareRev &&
                accessoryInformation.hardwareRev.match(revisionRegex)) {
                accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(Characteristic.HardwareRevision, accessoryInformation.hardwareRev);
            }
            if (accessoryInformation.softwareRev &&
                accessoryInformation.softwareRev.match(revisionRegex)) {
                accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(Characteristic.SoftwareRevision, accessoryInformation.softwareRev);
            }
            host.addBridgedAccessories([accessory]);
        }
        else {
            accessoryInformationService =
                (accessory === null || accessory === void 0 ? void 0 : accessory.getService(Service.AccessoryInformation)) ||
                    (accessory === null || accessory === void 0 ? void 0 : accessory.addService(Service.AccessoryInformation));
        }
        accessoryInformationService === null || accessoryInformationService === void 0 ? void 0 : accessoryInformationService.setCharacteristic(Characteristic.Identify, true);
        log.debug(`Bridge now has ${host.bridgedAccessories.length} accessories.`);
        return accessory;
    };
    const onIdentify = function (paired, callback) {
        var _a;
        if (paired) {
            log.debug(`Identify called on paired Accessory ${node.accessory.displayName}`);
        }
        else {
            log.debug(`Identify called on unpaired Accessory ${node.accessory.displayName}`);
        }
        const nodes = (_a = node.childNodes) !== null && _a !== void 0 ? _a : [];
        for (let i = 0, len = nodes.length; i < len; i++) {
            const topic = nodes[i].config.topic
                ? nodes[i].config.topic
                : nodes[i].topic_in;
            const msg = {
                payload: { Identify: 1 },
                name: nodes[i].name,
                topic: topic,
            };
            const statusId = nodes[i].nodeStatusUtils.setStatus({
                fill: 'yellow',
                shape: 'dot',
                text: 'Identify : 1',
            });
            setTimeout(function () {
                nodes[i].nodeStatusUtils.clearStatus(statusId);
            }, 3000);
            nodes[i].send([msg, msg]);
        }
        callback();
    };
    return {
        getOrCreate,
        onIdentify,
    };
};
