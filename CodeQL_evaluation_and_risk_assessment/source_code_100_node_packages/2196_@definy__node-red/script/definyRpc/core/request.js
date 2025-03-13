"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMutation = exports.requestQuery = void 0;
const dntShim = __importStar(require("../../_dnt.shims.js"));
const typedJson_js_1 = require("../../typedJson.js");
const coreType_js_1 = require("./coreType.js");
const fromStructuredJson_js_1 = require("./fromStructuredJson.js");
const toStructuredJson_js_1 = require("./toStructuredJson.js");
const requestQuery = async (parameter) => {
    const url = new URL(parameter.url.toString());
    url.pathname = requestPath(url.pathname, parameter.namespace, parameter.name);
    const inputAsStructuredJson = (0, toStructuredJson_js_1.toStructuredJsonValue)(parameter.inputType, parameter.typeMap, parameter.input);
    try {
        if (parameter.accountToken === undefined) {
            const search = structuredJsonValueToUrlSearch(inputAsStructuredJson);
            if (search !== undefined) {
                for (const [key, value] of search) {
                    url.searchParams.set(key, value);
                }
                const response = await dntShim.fetch(url);
                const jsonValue = await response.json();
                return coreType_js_1.Result.ok((0, fromStructuredJson_js_1.fromStructuredJsonValue)(parameter.outputType, parameter.typeMap, (0, typedJson_js_1.rawJsonToStructuredJsonValue)(jsonValue)));
            }
        }
        const response = await dntShim.fetch(url, {
            method: "POST",
            body: (0, typedJson_js_1.structuredJsonStringify)(parameter.accountToken === undefined
                ? coreType_js_1.StructuredJsonValue.object(new Map([["input", inputAsStructuredJson]]))
                : coreType_js_1.StructuredJsonValue.object(new Map([[
                        "accountToken",
                        coreType_js_1.StructuredJsonValue.string(parameter.accountToken),
                    ], [
                        "input",
                        inputAsStructuredJson,
                    ]]))),
        });
        const jsonValue = await response.json();
        return coreType_js_1.Result.ok((0, fromStructuredJson_js_1.fromStructuredJsonValue)(parameter.outputType, parameter.typeMap, (0, typedJson_js_1.rawJsonToStructuredJsonValue)(jsonValue)));
    }
    catch (e) {
        return coreType_js_1.Result.error(e.toString());
    }
};
exports.requestQuery = requestQuery;
const structuredJsonValueToUrlSearch = (structuredJsonValue) => {
    const search = structuredJsonValueToUrlSearchNoLimit(structuredJsonValue);
    if (2000 < search.toString().length) {
        return undefined;
    }
    return search;
};
const structuredJsonValueToUrlSearchNoLimit = (structuredJsonValue) => {
    switch (structuredJsonValue.type) {
        case "string":
            return new URLSearchParams({ q: structuredJsonValue.value });
        case "number":
            return new URLSearchParams({ q: structuredJsonValue.value.toString() });
        case "boolean":
            return new URLSearchParams({ q: structuredJsonValue.value.toString() });
        case "null":
            return new URLSearchParams({});
        case "array":
            return new URLSearchParams({
                q: (0, typedJson_js_1.structuredJsonStringify)(structuredJsonValue),
            });
        case "object": {
            const search = new URLSearchParams([...structuredJsonValue.value].map(([key, value]) => [key, (0, typedJson_js_1.structuredJsonStringify)(value)]));
            search.sort();
            return search;
        }
    }
};
const requestMutation = async (parameter) => {
    const url = new URL(parameter.url.toString());
    url.pathname = requestPath(url.pathname, parameter.namespace, parameter.name);
    const inputAsStructuredJson = (0, toStructuredJson_js_1.toStructuredJsonValue)(parameter.inputType, parameter.typeMap, parameter.input);
    try {
        const response = await dntShim.fetch(url, {
            method: "POST",
            body: (0, typedJson_js_1.structuredJsonStringify)(parameter.accountToken === undefined
                ? coreType_js_1.StructuredJsonValue.object(new Map([["input", inputAsStructuredJson]]))
                : coreType_js_1.StructuredJsonValue.object(new Map([[
                        "accountToken",
                        coreType_js_1.StructuredJsonValue.string(parameter.accountToken),
                    ], [
                        "input",
                        inputAsStructuredJson,
                    ]]))),
        });
        const jsonValue = await response.json();
        return coreType_js_1.Result.ok((0, fromStructuredJson_js_1.fromStructuredJsonValue)(parameter.outputType, parameter.typeMap, (0, typedJson_js_1.rawJsonToStructuredJsonValue)(jsonValue)));
    }
    catch (e) {
        return coreType_js_1.Result.error(e.toString());
    }
};
exports.requestMutation = requestMutation;
const requestPath = (pathname, namespace, name) => {
    return pathname + (pathname.endsWith("/") ? "" : "/") +
        (namespace.type === "meta"
            ? "meta/"
            : "api/" + namespace.value.join("/") + "/") +
        name;
};
