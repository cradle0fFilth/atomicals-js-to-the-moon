"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCliInputs = void 0;
const validateCliInputs = () => {
    // Validate the BITCOIND_RPCURL 
    if (process.env.ELECTRUMX_PROXY_BASE_URL) {
        return {
            electrumxWebsocketUrl: process.env.ELECTRUMX_PROXY_BASE_URL
        };
    }
    throw new Error('invalid config');
};
exports.validateCliInputs = validateCliInputs;
