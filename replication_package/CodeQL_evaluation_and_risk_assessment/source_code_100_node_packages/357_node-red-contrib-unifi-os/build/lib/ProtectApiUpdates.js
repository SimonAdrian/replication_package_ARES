"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectApiUpdates = void 0;
const zlib_1 = __importDefault(require("zlib"));
const UPDATE_PACKET_HEADER_SIZE = 8;
var UpdatePacketType;
(function (UpdatePacketType) {
    UpdatePacketType[UpdatePacketType["ACTION"] = 1] = "ACTION";
    UpdatePacketType[UpdatePacketType["PAYLOAD"] = 2] = "PAYLOAD";
})(UpdatePacketType || (UpdatePacketType = {}));
var UpdatePayloadType;
(function (UpdatePayloadType) {
    UpdatePayloadType[UpdatePayloadType["JSON"] = 1] = "JSON";
    UpdatePayloadType[UpdatePayloadType["STRING"] = 2] = "STRING";
    UpdatePayloadType[UpdatePayloadType["BUFFER"] = 3] = "BUFFER";
})(UpdatePayloadType || (UpdatePayloadType = {}));
var UpdatePacketHeader;
(function (UpdatePacketHeader) {
    UpdatePacketHeader[UpdatePacketHeader["TYPE"] = 0] = "TYPE";
    UpdatePacketHeader[UpdatePacketHeader["PAYLOAD_FORMAT"] = 1] = "PAYLOAD_FORMAT";
    UpdatePacketHeader[UpdatePacketHeader["DEFLATED"] = 2] = "DEFLATED";
    UpdatePacketHeader[UpdatePacketHeader["UNKNOWN"] = 3] = "UNKNOWN";
    UpdatePacketHeader[UpdatePacketHeader["PAYLOAD_SIZE"] = 4] = "PAYLOAD_SIZE";
})(UpdatePacketHeader || (UpdatePacketHeader = {}));
class ProtectApiUpdates {
    static decodeUpdatePacket(log, packet) {
        let dataOffset;
        try {
            dataOffset =
                packet.readUInt32BE(UpdatePacketHeader.PAYLOAD_SIZE) +
                    UPDATE_PACKET_HEADER_SIZE;
            if (packet.length !==
                dataOffset +
                    UPDATE_PACKET_HEADER_SIZE +
                    packet.readUInt32BE(dataOffset + UpdatePacketHeader.PAYLOAD_SIZE)) {
                throw new Error("Packet length doesn't match header information.");
            }
        }
        catch (error) {
            log.error('Realtime update API: error decoding update packet: %s.', error);
            return null;
        }
        const actionFrame = this.decodeUpdateFrame(log, packet.slice(0, dataOffset), UpdatePacketType.ACTION);
        const payloadFrame = this.decodeUpdateFrame(log, packet.slice(dataOffset), UpdatePacketType.PAYLOAD);
        if (!actionFrame || !payloadFrame) {
            return null;
        }
        return { action: actionFrame, payload: payloadFrame };
    }
    static decodeUpdateFrame(log, packet, packetType) {
        const frameType = packet.readUInt8(UpdatePacketHeader.TYPE);
        if (packetType !== frameType) {
            return null;
        }
        const payloadFormat = packet.readUInt8(UpdatePacketHeader.PAYLOAD_FORMAT);
        const payload = packet.readUInt8(UpdatePacketHeader.DEFLATED)
            ? zlib_1.default.inflateSync(packet.slice(UPDATE_PACKET_HEADER_SIZE))
            : packet.slice(UPDATE_PACKET_HEADER_SIZE);
        if (frameType === UpdatePacketType.ACTION) {
            return payloadFormat === UpdatePayloadType.JSON
                ? JSON.parse(payload.toString())
                : null;
        }
        switch (payloadFormat) {
            case UpdatePayloadType.JSON:
                return JSON.parse(payload.toString());
            case UpdatePayloadType.STRING:
                return payload.toString('utf8');
            case UpdatePayloadType.BUFFER:
                return payload;
            default:
                log.error(`Unknown payload packet type received in the realtime update events API: ${payloadFormat}.`);
                return null;
        }
    }
}
exports.ProtectApiUpdates = ProtectApiUpdates;
