"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeMnemonicPhrase = void 0;
const bitcoin = require('bitcoinjs-lib');
const ecpair_1 = require("ecpair");
const ecc = require("tiny-secp256k1");
bitcoin.initEccLib(ecc);
const ECPair = (0, ecpair_1.default)(ecc);
const bip32_1 = require("bip32");
const command_helpers_1 = require("../commands/command-helpers");
const bip32 = (0, bip32_1.default)(ecc);
const toXOnly = (publicKey) => {
    return publicKey.slice(1, 33);
};
const bip39 = require('bip39');
const decodeMnemonicPhrase = (phrase, path) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!bip39.validateMnemonic(phrase)) {
        throw new Error("Invalid mnemonic phrase provided!");
    }
    const seed = yield bip39.mnemonicToSeed(phrase);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(path);
    // const { address } = bitcoin.payments.p2pkh({ pubkey: childNode.publicKey });
    const childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
    const p2tr = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network: command_helpers_1.NETWORK
    });
    if (!p2tr.address || !p2tr.output) {
        throw "error creating p2tr";
    }
    // Used for signing, since the output and address are using a tweaked key
    // We must tweak the signer in the same way.
    const tweakedChildNode = childNode.tweak(bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));
    return {
        phrase,
        address: p2tr.address,
        publicKey: childNode.publicKey.toString('hex'),
        publicKeyXOnly: childNodeXOnlyPubkey.toString('hex'),
        path,
        WIF: childNode.toWIF(),
        privateKey: (_a = childNode.privateKey) === null || _a === void 0 ? void 0 : _a.toString('hex'),
    };
});
exports.decodeMnemonicPhrase = decodeMnemonicPhrase;
