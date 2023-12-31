"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMnemonicPhrase = void 0;
const bitcoin = require('bitcoinjs-lib');
const ecc = require("tiny-secp256k1");
bitcoin.initEccLib(ecc);
const crypto_1 = require("crypto");
const bip39 = require('bip39');
function createMnemonicPhrase() {
    const mnemonic = bip39.entropyToMnemonic((0, crypto_1.randomBytes)(16).toString('hex'));
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic generated!");
    }
    return {
        phrase: mnemonic
    };
}
exports.createMnemonicPhrase = createMnemonicPhrase;
