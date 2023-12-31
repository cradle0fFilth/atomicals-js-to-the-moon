"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletPathResolver = void 0;
const dotenv = require("dotenv");
dotenv.config();
const walletPathResolver = () => {
    let basePath = '.';
    if (process.env.WALLET_PATH) {
        basePath = process.env.WALLET_PATH;
    }
    let fileName = 'wallet.json';
    if (process.env.WALLET_FILE) {
        fileName = process.env.WALLET_FILE;
    }
    const fullPath = `${basePath}/${fileName}`;
    return fullPath;
};
exports.walletPathResolver = walletPathResolver;
