"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structuredJsonValueToRawJson = exports.structuredJsonStringify = exports.jsonStringify = exports.rawJsonToStructuredJsonValue = exports.structuredJsonParse = exports.jsonParse = void 0;
const coreType_js_1 = require("./definyRpc/core/coreType.js");
const jsonParse = (value) => {
    try {
        return JSON.parse(value);
    }
    catch (e) {
        console.error("json のパースエラー", e);
        return undefined;
    }
};
exports.jsonParse = jsonParse;
const structuredJsonParse = (value) => {
    const rawJson = (0, exports.jsonParse)(value);
    if (rawJson === undefined) {
        return undefined;
    }
    return (0, exports.rawJsonToStructuredJsonValue)(rawJson);
};
exports.structuredJsonParse = structuredJsonParse;
const rawJsonToStructuredJsonValue = (rawJson) => {
    if (rawJson === null) {
        return coreType_js_1.StructuredJsonValue.null;
    }
    if (typeof rawJson === "boolean") {
        return coreType_js_1.StructuredJsonValue.boolean(rawJson);
    }
    if (typeof rawJson === "string") {
        return coreType_js_1.StructuredJsonValue.string(rawJson);
    }
    if (typeof rawJson === "number") {
        return coreType_js_1.StructuredJsonValue.number(rawJson);
    }
    if (rawJson instanceof Array) {
        return coreType_js_1.StructuredJsonValue.array(rawJson.map(exports.rawJsonToStructuredJsonValue));
    }
    return coreType_js_1.StructuredJsonValue.object(new Map(Object.entries(rawJson).map(([k, v]) => [
        k,
        (0, exports.rawJsonToStructuredJsonValue)(v),
    ])));
};
exports.rawJsonToStructuredJsonValue = rawJsonToStructuredJsonValue;
const jsonStringify = (jsonValue, indent = false) => {
    if (indent) {
        return JSON.stringify(jsonValue, undefined, 2);
    }
    return JSON.stringify(jsonValue);
};
exports.jsonStringify = jsonStringify;
const structuredJsonStringify = (structuredJsonValue, indent = false) => {
    return (0, exports.jsonStringify)((0, exports.structuredJsonValueToRawJson)(structuredJsonValue), indent);
};
exports.structuredJsonStringify = structuredJsonStringify;
const structuredJsonValueToRawJson = (structuredJsonValue) => {
    switch (structuredJsonValue.type) {
        case "null":
            return null;
        case "string":
            return structuredJsonValue.value;
        case "number":
            return structuredJsonValue.value;
        case "boolean":
            return structuredJsonValue.value;
        case "array":
            return structuredJsonValue.value.map(exports.structuredJsonValueToRawJson);
        case "object":
            return Object.fromEntries([...structuredJsonValue.value.entries()].map(([k, v]) => [k, (0, exports.structuredJsonValueToRawJson)(v)]));
    }
};
exports.structuredJsonValueToRawJson = structuredJsonValueToRawJson;
