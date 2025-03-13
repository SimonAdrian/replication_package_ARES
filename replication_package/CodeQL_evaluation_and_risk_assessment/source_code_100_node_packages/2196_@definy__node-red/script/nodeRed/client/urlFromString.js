"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlFromString = void 0;
const urlFromString = (url) => {
    try {
        return new URL(url);
    }
    catch (_) {
        return undefined;
    }
};
exports.urlFromString = urlFromString;
