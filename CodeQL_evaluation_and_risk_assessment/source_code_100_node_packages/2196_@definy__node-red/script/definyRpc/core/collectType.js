"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectedDefinyRpcTypeMapGet = exports.createTypeKey = void 0;
const namespace_js_1 = require("../codeGen/namespace.js");
const createTypeKey = (namespace, typeName) => {
    return (0, namespace_js_1.namespaceToString)(namespace) + "." + typeName;
};
exports.createTypeKey = createTypeKey;
const collectedDefinyRpcTypeMapGet = (map, namespace, typeName) => {
    const typeInfo = map.get((0, exports.createTypeKey)(namespace, typeName));
    if (typeInfo === undefined) {
        throw new Error("type (" + (0, exports.createTypeKey)(namespace, typeName) + ") not found. in [" +
            [...map.keys()].join(", ") + "]");
    }
    return typeInfo;
};
exports.collectedDefinyRpcTypeMapGet = collectedDefinyRpcTypeMapGet;
