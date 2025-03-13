"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoints = void 0;
exports.endpoints = {
    protocol: {
        base: 'https://',
        webSocket: 'wss://',
    },
    UniFiOSConsole: {
        login: {
            url: '/api/auth/login',
            retry: 5000,
        },
        logout: {
            url: '/api/auth/logout',
        },
        wsport: 443,
    },
    UniFiNetworkApplication: {
        login: {
            url: '/api/login',
            retry: 5000,
        },
        logout: {
            url: '/api/logout',
        },
        wsport: 8443,
    },
};
