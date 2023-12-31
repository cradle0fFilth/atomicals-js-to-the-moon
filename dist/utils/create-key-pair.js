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
exports.createNKeyPairs = exports.createPrimaryAndFundingImportedKeyPairs = exports.createKeyPair = exports.toXOnly = void 0;
const bitcoin = require('bitcoinjs-lib');
const ecpair_1 = require("ecpair");
const ecc = require("tiny-secp256k1");
const create_mnemonic_phrase_1 = require("./create-mnemonic-phrase");
bitcoin.initEccLib(ecc);
const ECPair = (0, ecpair_1.default)(ecc);
const bip32_1 = require("bip32");
const command_helpers_1 = require("../commands/command-helpers");
const bip32 = (0, bip32_1.default)(ecc);
const toXOnly = (publicKey) => {
    return publicKey.slice(1, 33);
};
exports.toXOnly = toXOnly;
const bip39 = require('bip39');
const createKeyPair = (phrase = '', path = `m/44'/0'/0'/0/0`) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!phrase || phrase === '') {
        const phraseResult = yield (0, create_mnemonic_phrase_1.createMnemonicPhrase)();
        phrase = phraseResult.phrase;
    }
    const seed = yield bip39.mnemonicToSeed(phrase);
    const rootKey = bip32.fromSeed(seed);
    const childNodePrimary = rootKey.derivePath(path);
    // const p2pkh = bitcoin.payments.p2pkh({ pubkey: childNodePrimary.publicKey });
    const childNodeXOnlyPubkeyPrimary = (0, exports.toXOnly)(childNodePrimary.publicKey);
    const p2trPrimary = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkeyPrimary,
        network: command_helpers_1.NETWORK
    });
    if (!p2trPrimary.address || !p2trPrimary.output) {
        throw "error creating p2tr";
    }
    // Used for signing, since the output and address are using a tweaked key
    // We must tweak the signer in the same way.
    const tweakedChildNodePrimary = childNodePrimary.tweak(bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkeyPrimary));
    // Do a sanity check with the WIF serialized and then verify childNodePrimary is the same
    const wif = childNodePrimary.toWIF();
    const keypair = ECPair.fromWIF(wif);
    if (childNodePrimary.publicKey.toString('hex') !== keypair.publicKey.toString('hex')) {
        throw 'createKeyPair error child node not match sanity check';
    }
    return {
        address: p2trPrimary.address,
        publicKey: childNodePrimary.publicKey.toString('hex'),
        publicKeyXOnly: childNodeXOnlyPubkeyPrimary.toString('hex'),
        path,
        WIF: childNodePrimary.toWIF(),
        privateKey: (_a = childNodePrimary.privateKey) === null || _a === void 0 ? void 0 : _a.toString('hex'),
        // tweakedChildNode: tweakedChildNodePrimary
    };
});
exports.createKeyPair = createKeyPair;
const createPrimaryAndFundingImportedKeyPairs = (phrase, path, n) => __awaiter(void 0, void 0, void 0, function* () {
    let phraseResult = phrase;
    if (!phraseResult) {
        phraseResult = yield (0, create_mnemonic_phrase_1.createMnemonicPhrase)();
        phraseResult = phraseResult.phrase;
    }
    let pathUsed = `m/44'/0'/0'`;
    if (path) {
        pathUsed = path;
    }
    const imported = {};
    if (n) {
        for (let i = 2; i < n + 2; i++) {
            imported[i + ''] = yield (0, exports.createKeyPair)(phraseResult, `${pathUsed}/0/` + i);
        }
    }
    return {
        wallet: {
            phrase: phraseResult,
            primary: yield (0, exports.createKeyPair)(phraseResult, `${pathUsed}/0/0`),
            funding: yield (0, exports.createKeyPair)(phraseResult, `${pathUsed}/1/0`)
        },
        imported
    };
});
exports.createPrimaryAndFundingImportedKeyPairs = createPrimaryAndFundingImportedKeyPairs;
const createNKeyPairs = (phrase, n = 1) => __awaiter(void 0, void 0, void 0, function* () {
    const keypairs = [];
    for (let i = 0; i < n; i++) {
        keypairs.push(yield (0, exports.createKeyPair)(phrase, `m/44'/0'/0'/0/${i}`));
    }
    return {
        phrase,
        keypairs,
    };
});
exports.createNKeyPairs = createNKeyPairs;
