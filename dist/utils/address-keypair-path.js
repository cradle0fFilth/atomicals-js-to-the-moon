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
exports.getKeypairInfo = exports.getExtendTaprootAddressKeypairPath = void 0;
const bitcoin = require('bitcoinjs-lib');
const ecc = require("tiny-secp256k1");
bitcoin.initEccLib(ecc);
const bip39 = require('bip39');
const bip32_1 = require("bip32");
const create_key_pair_1 = require("./create-key-pair");
const command_helpers_1 = require("../commands/command-helpers");
const bip32 = (0, bip32_1.default)(ecc);
const getExtendTaprootAddressKeypairPath = (phrase, path) => __awaiter(void 0, void 0, void 0, function* () {
    const seed = yield bip39.mnemonicToSeed(phrase);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(path);
    const childNodeXOnlyPubkey = childNode.publicKey.slice(1, 33);
    // This is new for taproot
    // Note: we are using mainnet here to get the correct address
    // The output is the same no matter what the network is.
    const { address, output } = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network: command_helpers_1.NETWORK
    });
    // Used for signing, since the output and address are using a tweaked key
    // We must tweak the signer in the same way.
    const tweakedChildNode = childNode.tweak(bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));
    return {
        address,
        tweakedChildNode,
        childNodeXOnlyPubkey,
        output,
        keyPair: childNode,
        path,
    };
});
exports.getExtendTaprootAddressKeypairPath = getExtendTaprootAddressKeypairPath;
const getKeypairInfo = (childNode) => {
    const childNodeXOnlyPubkey = (0, create_key_pair_1.toXOnly)(childNode.publicKey);
    // This is new for taproot
    // Note: we are using mainnet here to get the correct address
    // The output is the same no matter what the network is.
    const { address, output } = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network: command_helpers_1.NETWORK
    });
    // Used for signing, since the output and address are using a tweaked key
    // We must tweak the signer in the same way.
    const tweakedChildNode = childNode.tweak(bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));
    return {
        address,
        tweakedChildNode,
        childNodeXOnlyPubkey,
        output,
        childNode
    };
};
exports.getKeypairInfo = getKeypairInfo;
