"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromStructuredJsonValue = void 0;
const typedJson_js_1 = require("../../typedJson.js");
const collectType_js_1 = require("./collectType.js");
const changeType = (type) => type;
const fromStructuredJsonValue = (type, typeMap, jsonValue) => {
    const typeInfo = (0, collectType_js_1.collectedDefinyRpcTypeMapGet)(typeMap, type.namespace, type.name);
    switch (typeInfo.body.type) {
        case "string": {
            if (jsonValue.type !== "string") {
                throw new Error(`expected json string in String type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return jsonValue.value;
        }
        case "number": {
            if (jsonValue.type !== "number") {
                throw new Error(`expected json number in Number type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return jsonValue.value;
        }
        case "boolean": {
            if (jsonValue.type !== "boolean") {
                throw new Error(`expected json boolean in Bool type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return jsonValue.value;
        }
        case "unit": {
            return undefined;
        }
        case "list": {
            const [elementType] = type.parameters;
            if (elementType === undefined) {
                throw new Error(`expected type parameter in List type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            if (jsonValue.type !== "array") {
                throw new Error(`expected json array in List type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return jsonValue.value.map((element) => fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, elementType, typeMap, element));
        }
        case "set": {
            const [elementType] = type.parameters;
            if (elementType === undefined) {
                throw new Error(`expected type parameter in Set type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            if (jsonValue.type !== "array") {
                throw new Error(`expected json array in List type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            // パラメータを受け取らないとな...
            return new Set(jsonValue.value.map((element) => fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, elementType, typeMap, element)));
        }
        case "map":
            return toMap(changeType(type), typeInfo, typeMap, jsonValue);
        case "url": {
            if (jsonValue.type !== "string") {
                throw new Error(`expected json string in URL (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return new URL(jsonValue.value);
        }
        case "product":
            return toProduct(changeType(type), typeInfo, typeMap, jsonValue, typeInfo.body.value);
        case "sum":
            return toSum(changeType(type), typeInfo, typeMap, jsonValue, typeInfo.body.value);
    }
};
exports.fromStructuredJsonValue = fromStructuredJsonValue;
const toMap = (type, typeInfo, typeMap, jsonValue) => {
    const [keyType, valueType] = type.parameters;
    if (keyType === undefined || valueType === undefined) {
        throw new Error(`expected 2 type parameter in Map type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
    }
    if (jsonValue.type !== "object") {
        throw new Error(`expected json object in Map type (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
    }
    return new Map([...jsonValue.value].map(([key, valueJson]) => {
        const keyTypeInfo = (0, collectType_js_1.collectedDefinyRpcTypeMapGet)(typeMap, keyType.namespace, keyType.name);
        if (keyTypeInfo.body.type === "string") {
            return [
                key,
                fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, changeType(valueType), typeMap, valueJson),
            ];
        }
        const keyJson = (0, typedJson_js_1.structuredJsonParse)(key);
        if (keyJson === undefined) {
            throw new Error(`Map 型のときに key が string 以外での場合は json として解釈できる文字列である必要があります (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
        }
        return [
            fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, changeType(keyType), typeMap, keyJson),
            fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, changeType(valueType), typeMap, valueJson),
        ];
    }));
};
const toProduct = (type, typeInfo, typeMap, jsonValue, fields) => {
    if (jsonValue.type !== "object") {
        throw new Error(`expected json object in product (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
    }
    return Object.fromEntries([
        ...fields.map((field) => {
            const fieldValueJson = jsonValue.value.get(field.name);
            if (fieldValueJson === undefined) {
                throw new Error(`${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)} need ${field.name} field (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
            }
            return [
                field.name,
                fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, changeType(field.type), typeMap, fieldValueJson),
            ];
        }),
        [
            Symbol.toStringTag,
            (0, collectType_js_1.createTypeKey)(type.namespace, type.name),
        ],
    ]);
};
const toSum = (type, typeInfo, typeMap, jsonValue, patternList) => {
    if (jsonValue.type === "string") {
        for (const pattern of patternList) {
            if (pattern.name === jsonValue.value) {
                if (pattern.parameter.type === "just") {
                    throw new Error(`expected json object in sum pattern with parameter (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
                }
                return {
                    type: pattern.name,
                    [Symbol.toStringTag]: (0, collectType_js_1.createTypeKey)(type.namespace, type.name),
                };
            }
        }
        throw new Error(`unknown pattern name expected [${patternList.map((p) => p.name).join(",")}] but got ${jsonValue.value} (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
    }
    if (jsonValue.type === "object") {
        const typeFieldJson = jsonValue.value.get("type");
        if (typeFieldJson?.type !== "string") {
            throw new Error(`expected json string in sum pattern key (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
        }
        for (const pattern of patternList) {
            if (pattern.name === typeFieldJson.value) {
                if (pattern.parameter.type === "just") {
                    const valueJson = jsonValue.value.get("value");
                    if (valueJson === undefined) {
                        throw new Error(`expected value field in sum pattern with parameter (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
                    }
                    return {
                        type: pattern.name,
                        value: fromStructuredJsonValueConsiderTypeParameter(type.parameters, typeInfo.parameter, pattern.parameter.value, typeMap, valueJson),
                        [Symbol.toStringTag]: (0, collectType_js_1.createTypeKey)(type.namespace, type.name),
                    };
                }
                return {
                    type: pattern.name,
                    [Symbol.toStringTag]: (0, collectType_js_1.createTypeKey)(type.namespace, type.name),
                };
            }
        }
        throw new Error(`unknown pattern name expected [${patternList.map((p) => p.name).join(",")}] but got ${jsonValue.value} (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
    }
    throw new Error(`expected json object or string in sum (${(0, collectType_js_1.createTypeKey)(type.namespace, type.name)})`);
};
const fromStructuredJsonValueConsiderTypeParameter = (typeParameters, typeParameterInfoList, type, typeMap, jsonValue) => {
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
            return (0, exports.fromStructuredJsonValue)(changeType(matchedTypeParameter), typeMap, jsonValue);
        }
    }
    return (0, exports.fromStructuredJsonValue)(type, typeMap, jsonValue);
};
