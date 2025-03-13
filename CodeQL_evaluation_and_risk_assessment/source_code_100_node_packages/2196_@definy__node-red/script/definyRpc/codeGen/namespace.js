"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionNamespaceToString = exports.fromFunctionNamespace = exports.namespaceEqual = exports.namespaceToString = exports.toMeta = exports.toRequest = exports.namespaceFromAndToToTypeScriptModuleName = exports.namespaceRelative = void 0;
const coreType_js_1 = require("../core/coreType.js");
const namespaceRelative = (from, to) => {
    for (const [index, fromItem] of from.entries()) {
        const toItem = to[index];
        if (toItem !== fromItem) {
            return { upCount: from.length - index, path: to.slice(index) };
        }
    }
    return { upCount: 0, path: to.slice(from.length) };
};
exports.namespaceRelative = namespaceRelative;
/**
 * @return undefined の場合は同一のモジュールということ
 */
const namespaceFromAndToToTypeScriptModuleName = (from, to) => {
    switch (to.type) {
        case "coreType":
            return toCoreTypeModuleName(from);
        case "request":
            return (0, exports.toRequest)(from);
        case "typedJson":
            return toTypedJson(from);
        case "local":
            return toLocal(from, to.value);
        case "meta":
            return (0, exports.toMeta)(from);
    }
};
exports.namespaceFromAndToToTypeScriptModuleName = namespaceFromAndToToTypeScriptModuleName;
const toCoreTypeModuleName = (from) => {
    switch (from.type) {
        case "coreType":
            return undefined;
        case "request":
        case "typedJson":
            throw new Error("この方向には参照しない!");
        case "local":
        case "meta":
            return "https://raw.githubusercontent.com/narumincho/definy/f662850e6a0cb9ec7a69e60f424624c07dd417fa/deno-lib/definyRpc/core/coreType.ts";
    }
};
const toRequest = (from) => {
    switch (from.type) {
        case "coreType":
            throw new Error("この方向には参照しない!");
        case "typedJson":
        case "request":
            throw new Error("コード生成しない!");
        case "local":
        case "meta":
            return "https://raw.githubusercontent.com/narumincho/definy/f662850e6a0cb9ec7a69e60f424624c07dd417fa/deno-lib/definyRpc/core/request.ts";
    }
};
exports.toRequest = toRequest;
const toTypedJson = (from) => {
    switch (from.type) {
        case "typedJson":
        case "request":
            throw new Error("コード生成しない!");
        case "coreType":
            return "../../typedJson.ts";
        case "local":
        case "meta":
            return "https://raw.githubusercontent.com/narumincho/definy/f662850e6a0cb9ec7a69e60f424624c07dd417fa/deno-lib/typedJson.ts";
    }
};
const toLocal = (from, to) => {
    switch (from.type) {
        case "request":
        case "typedJson":
        case "coreType":
        case "meta":
            throw new Error("その方向には参照できない!");
        case "local": {
            const relativeNamespace = (0, exports.namespaceRelative)(from.value, to);
            if (relativeNamespace.path.length === 0 && relativeNamespace.upCount === 0) {
                return undefined;
            }
            const prefix = relativeNamespace.upCount <= 1
                ? "./"
                : "../".repeat(relativeNamespace.upCount - 1);
            return prefix + relativeNamespace.path.join("/") + ".ts";
        }
    }
};
const toMeta = (from) => {
    switch (from.type) {
        case "request":
        case "typedJson":
        case "coreType":
            throw new Error("その方向には参照できない!");
        case "local": {
            const relativeNamespace = (0, exports.namespaceRelative)(["serverName", ...from.value], [
                "meta.ts",
            ]);
            const prefix = relativeNamespace.upCount <= 1
                ? "./"
                : "../".repeat(relativeNamespace.upCount - 1);
            return prefix + relativeNamespace.path.join("/") + ".ts";
        }
    }
};
exports.toMeta = toMeta;
const namespaceToString = (namespace) => {
    switch (namespace.type) {
        case "typedJson":
            return "*typedJson";
        case "request":
            return "*request";
        case "coreType":
            return "*coreType";
        case "meta":
            return "*meta";
        case "local":
            return namespace.value.join(".");
    }
};
exports.namespaceToString = namespaceToString;
const namespaceEqual = (a, b) => {
    return (0, exports.namespaceToString)(a) === (0, exports.namespaceToString)(b);
};
exports.namespaceEqual = namespaceEqual;
const fromFunctionNamespace = (functionNamespace) => {
    if (functionNamespace.type === "meta") {
        return coreType_js_1.Namespace.meta;
    }
    return coreType_js_1.Namespace.local(functionNamespace.value);
};
exports.fromFunctionNamespace = fromFunctionNamespace;
const functionNamespaceToString = (functionNamespace) => {
    if (functionNamespace.type === "meta") {
        return "*meta";
    }
    return functionNamespace.value.join(".");
};
exports.functionNamespaceToString = functionNamespaceToString;
