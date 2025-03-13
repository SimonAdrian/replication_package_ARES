"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieToRaw = exports.cookieToObject = void 0;
const cookieToObject = (raw) => {
    const cookies = {};
    raw.replace(/ /g, '')
        .split(';')
        .forEach((c) => {
        if (c.includes('=')) {
            const [key, value] = c.split('=');
            cookies[key] = value;
        }
        else {
            cookies[c] = '';
        }
    });
    return cookies;
};
exports.cookieToObject = cookieToObject;
const cookieToRaw = (cookie) => {
    let raw = '';
    Object.keys(cookie).forEach((key) => {
        const value = cookie[key];
        raw += `${key}=${value};`;
    });
    return raw;
};
exports.cookieToRaw = cookieToRaw;
