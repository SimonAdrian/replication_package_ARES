"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStructuredJsonValue = void 0;
const typedJson_js_1 = require("../../typedJson.js");
const collectType_js_1 = require("./collectType.js");
const coreType_js_1 = require("./coreType.js");
const toStructuredJsonValue = (type, typeMap, value) => {
    const typeInfo = (0, collectType_js_1.collectedDefinyRpcTypeMapGet)(typeMap, type.namespace, type.name);
    switch (typeInfo.body.type) {
        case "string":
            if (typeof value !== "string") {
                throw new Error("expected string in toStructuredJsonValue");
            }
            return coreType_js_1.StructuredJsonValue.string(value);
        case "number":
            if (typeof value !== "number") {
                throw new Error("expected number in toStructuredJsonValue");
            }
            return coreType_js_1.StructuredJsonValue.number(value);
        case "boolean":
            if (typeof value !== "boolean") {
                throw new Error("expected boolean in toStructuredJsonValue");
            }
            return coreType_js_1.StructuredJsonValue.boolean(value);
        case "unit":
            return coreType_js_1.StructuredJsonValue.null;
        case "list": {
            if (!(value instanceof Array)) {
                throw new Error("expected Array in toStructuredJsonValue");
            }
            const [elementType] = type.parameters;
            if (elementType === undefined) {
                throw new Error(`expected type parameter in List type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return coreType_js_1.StructuredJsonValue.array(value.map((element) => toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, elementType, typeMap, element)));
        }
        case "set": {
            if (!(value instanceof Set)) {
                throw new Error("expected Set in toStructuredJsonValue");
            }
            const [elementType] = type.parameters;
            if (elementType === undefined) {
                throw new Error(`expected type parameter in Set type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return coreType_js_1.StructuredJsonValue.array([...value].map((element) => toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, elementType, typeMap, element)));
        }
        case "map": {
            if (!(value instanceof Map)) {
                throw new Error("expected Map in toStructuredJsonValue");
            }
            const [keyType, valueType] = type.parameters;
            if (keyType === undefined || valueType === undefined) {
                throw new Error(`expected 2 type parameter in Map type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            const keyTypeInfo = (0, collectType_js_1.collectedDefinyRpcTypeMapGet)(typeMap, keyType.namespace, keyType.name);
            if (keyTypeInfo.body.type === "string") {
                return coreType_js_1.StructuredJsonValue.object(new Map([...value].map(([key, value]) => [
                    key,
                    toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, valueType, typeMap, value),
                ])));
            }
            return coreType_js_1.StructuredJsonValue.object(new Map([...value].map(([key, value]) => [
                (0, typedJson_js_1.structuredJsonStringify)(toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, keyType, typeMap, key)),
                toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, valueType, typeMap, value),
            ])));
        }
        case "url": {
            if (!(value instanceof URL)) {
                throw new Error("expected Map in toStructuredJsonValue");
            }
            return coreType_js_1.StructuredJsonValue.string(value.toString());
        }
        case "product": {
            return coreType_js_1.StructuredJsonValue.object(new Map(typeInfo.body.value.map((field) => [
                field.name,
                toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, field.type, typeMap, value[field.name]),
            ])));
        }
        case "sum": {
            const valueObj = value;
            if (typeInfo.body.value.every((pattern) => pattern.parameter.type === "nothing")) {
                return coreType_js_1.StructuredJsonValue.string(valueObj.type);
            }
            for (const pattern of typeInfo.body.value) {
                if (pattern.name === valueObj.type) {
                    if (pattern.parameter.type === "just") {
                        return coreType_js_1.StructuredJsonValue.object(new Map([
                            ["type", coreType_js_1.StructuredJsonValue.string(pattern.name)],
                            [
                                "value",
                                toStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, pattern.parameter.value, typeMap, valueObj.value),
                            ],
                        ]));
                    }
                    return coreType_js_1.StructuredJsonValue.object(new Map([
                        ["type", coreType_js_1.StructuredJsonValue.string(pattern.name)],
                    ]));
                }
            }
            throw new Error(`unknown pattern name expected [${typeInfo.body.value.map((p) => p.name).join(",")}] but got ${valueObj.type} (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
        }
    }
};
exports.toStructuredJsonValue = toStructuredJsonValue;
const toStructuredJsonValueConsiderTypeParameter = (typeParameters, typeParameterInfoList, type, typeMap, value) => {
    if (typeParameters.length !== typeParameterInfoList.length) {
        throw new Error("型パラメータの数が合わない! expected:" + typeParameterInfoList.length + " but got:" +
            typeParameters.length);
    }
    for (const [index, typeParameter] of typeParameterInfoList.entries()) {
        if (typeParameter.name === type.name) {
            const matchedTypeParameter = typeParameters[index];
            if (matchedTypeParameter === undefined) {
                throw new Error("型パラメータの数が合わない?");
            }
            return (0, exports.toStructuredJsonValue)(matchedTypeParameter, typeMap, value);
        }
    }
    return (0, exports.toStructuredJsonValue)(type, typeMap, value);
};
