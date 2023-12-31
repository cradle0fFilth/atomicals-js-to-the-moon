"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAddressTypeToScripthash2 = exports.getNetwork = exports.utxoToInput = exports.getAddressType = exports.AddressTypeString = exports.GetUtxoPartialFromLocation = exports.IsAtomicalOwnedByWalletRecord = exports.performAddressAliasReplacement = exports.hash160HexToAddress = exports.hash160BufToAddress = exports.addressToHash160 = exports.addressToP2PKH = exports.addressToScripthash = exports.detectScriptToAddressType = exports.detectAddressTypeToScripthash = void 0;
const bs58check = require("bs58check");
const js_sha256_1 = require("js-sha256");
const ecc = require("tiny-secp256k1");
const command_helpers_1 = require("../commands/command-helpers");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const dotenv = require("dotenv");
const create_key_pair_1 = require("./create-key-pair");
dotenv.config();
function detectAddressTypeToScripthash(address) {
    // Detect legacy address
    try {
        bitcoin.address.fromBase58Check(address, command_helpers_1.NETWORK);
        const p2pkh = addressToP2PKH(address);
        const p2pkhBuf = Buffer.from(p2pkh, "hex");
        return {
            output: p2pkh,
            scripthash: Buffer.from((0, js_sha256_1.sha256)(p2pkhBuf), "hex").reverse().toString("hex"),
            address
        };
    }
    catch (err) {
    }
    // Detect segwit or taproot
    // const detected = bitcoin.address.fromBech32(address);
    if (address.indexOf('bc1p') === 0) {
        const output = bitcoin.address.toOutputScript(address, command_helpers_1.NETWORK);
        return {
            output,
            scripthash: Buffer.from((0, js_sha256_1.sha256)(output), "hex").reverse().toString("hex"),
            address
        };
    }
    else if (address.indexOf('bc1') === 0) {
        const output = bitcoin.address.toOutputScript(address, command_helpers_1.NETWORK);
        return {
            output,
            scripthash: Buffer.from((0, js_sha256_1.sha256)(output), "hex").reverse().toString("hex"),
            address
        };
    }
    else if (address.indexOf('tb1') === 0) {
        const output = bitcoin.address.toOutputScript(address, command_helpers_1.NETWORK);
        return {
            output,
            scripthash: Buffer.from((0, js_sha256_1.sha256)(output), "hex").reverse().toString("hex"),
            address
        };
    }
    else if (address.indexOf('bcrt1p') === 0) {
        const output = bitcoin.address.toOutputScript(address, command_helpers_1.NETWORK);
        return {
            output,
            scripthash: Buffer.from((0, js_sha256_1.sha256)(output), "hex").reverse().toString("hex"),
            address
        };
    }
    else {
        throw "unrecognized address";
    }
}
exports.detectAddressTypeToScripthash = detectAddressTypeToScripthash;
function detectScriptToAddressType(script) {
    const address = bitcoin.address.fromOutputScript(Buffer.from(script, 'hex'), command_helpers_1.NETWORK);
    return address;
}
exports.detectScriptToAddressType = detectScriptToAddressType;
function addressToScripthash(address) {
    const p2pkh = addressToP2PKH(address);
    const p2pkhBuf = Buffer.from(p2pkh, "hex");
    return Buffer.from((0, js_sha256_1.sha256)(p2pkhBuf), "hex").reverse().toString("hex");
}
exports.addressToScripthash = addressToScripthash;
function addressToP2PKH(address) {
    const addressDecoded = bs58check.decode(address);
    const addressDecodedSub = addressDecoded.toString().substr(2);
    const p2pkh = `76a914${addressDecodedSub}88ac`;
    return p2pkh;
}
exports.addressToP2PKH = addressToP2PKH;
function addressToHash160(address) {
    const addressDecoded = bs58check.decode(address);
    const addressDecodedSub = addressDecoded.toString().substr(2);
    return addressDecodedSub;
}
exports.addressToHash160 = addressToHash160;
function hash160BufToAddress(hash160) {
    const addressEncoded = bs58check.encode(hash160);
    return addressEncoded;
}
exports.hash160BufToAddress = hash160BufToAddress;
function hash160HexToAddress(hash160) {
    const addressEncoded = bs58check.encode(Buffer.from(hash160, "hex"));
    return addressEncoded;
}
exports.hash160HexToAddress = hash160HexToAddress;
function performAddressAliasReplacement(walletInfo, address) {
    let addressToReturn;
    if (address === 'primary') {
        addressToReturn = walletInfo.primary.address;
    }
    else if (address === 'funding') {
        addressToReturn = walletInfo.funding.address;
    }
    else if (walletInfo.imported && walletInfo.imported[address]) {
        addressToReturn = walletInfo.imported[address].address;
    }
    else {
        addressToReturn = address;
    }
    if (!addressToReturn) {
        return addressToReturn;
    }
    return detectAddressTypeToScripthash(addressToReturn);
}
exports.performAddressAliasReplacement = performAddressAliasReplacement;
/**
 * Whether the atomical for the mint is owned by the provided wallet or not
 * @param ownerRecord The proposed wallet that owns the atomical
 * @param atomical
 * @returns
 */
function IsAtomicalOwnedByWalletRecord(address, atomical) {
    if (!atomical.location_info_obj) {
        console.log(atomical);
        throw new Error('Error: location_info_obj not found');
    }
    const locationInfo = atomical.location_info_obj;
    const currentLocation = locationInfo.locations[0] || {};
    return GetUtxoPartialFromLocation(address, currentLocation, false);
}
exports.IsAtomicalOwnedByWalletRecord = IsAtomicalOwnedByWalletRecord;
function GetUtxoPartialFromLocation(addressToCheck, location, throwOnMismatch = true) {
    if (!location) {
        throw new Error('Error: location not found');
    }
    // Just in case populate the address on locationInfo if it was not set
    // It can be deduced from the script field
    let detectedAddress;
    try {
        detectedAddress = detectScriptToAddressType(location.script);
    }
    catch (err) {
        throw new Error('Error: invalid script address');
    }
    location.address = detectedAddress;
    if (addressToCheck !== location.address) {
        if (throwOnMismatch) {
            throw new Error('location_info not match expected address. expectedAddress=' + addressToCheck + ', foundAddress=' + location.address);
        }
        return null;
    }
    return {
        hash: location.txid,
        index: Number(location.index),
        address: detectedAddress,
        witnessUtxo: {
            value: Number(location.value),
            script: Buffer.from(location.script, 'hex')
        }
    };
}
exports.GetUtxoPartialFromLocation = GetUtxoPartialFromLocation;
var AddressTypeString;
(function (AddressTypeString) {
    AddressTypeString["p2pkh"] = "p2pkh";
    AddressTypeString["p2tr"] = "p2tr";
    AddressTypeString["p2sh"] = "p2sh";
    AddressTypeString["p2wpkh"] = "p2wpkh";
    AddressTypeString["p2wpkh_testnet"] = "p2wpkh_testnet";
    AddressTypeString["p2tr_testnet"] = "p2tr_testnet";
    AddressTypeString["p2sh_testnet"] = "p2sh_testnet";
    AddressTypeString["p2pkh_testnet"] = "p2pkh_testnet";
    AddressTypeString["p2tr_regtest"] = "p2tr_regtest";
    AddressTypeString["unknown"] = "unknown";
})(AddressTypeString = exports.AddressTypeString || (exports.AddressTypeString = {}));
function getAddressType(address) {
    if (address.startsWith('bc1q')) {
        return AddressTypeString.p2wpkh;
    }
    else if (address.startsWith('bc1p')) {
        return AddressTypeString.p2tr;
    }
    else if (address.startsWith('1')) {
        return AddressTypeString.p2pkh;
    }
    else if (address.startsWith('3')) {
        return AddressTypeString.p2sh;
    }
    else if (address.startsWith('tb1q')) {
        return AddressTypeString.p2wpkh_testnet;
    }
    else if (address.startsWith('m')) {
        return AddressTypeString.p2pkh_testnet;
    }
    else if (address.startsWith('2')) {
        return AddressTypeString.p2sh_testnet;
    }
    else if (address.startsWith('tb1p')) {
        return AddressTypeString.p2tr_testnet;
    }
    else if (address.startsWith('bcrt1p')) {
        return AddressTypeString.p2tr_regtest;
    }
    else {
        return AddressTypeString.unknown;
    }
}
exports.getAddressType = getAddressType;
function utxoToInput(utxo, address, publicKey, option) {
    var _a, _b, _c, _d;
    const addressType = getAddressType(address);
    let script;
    if (option.override.script !== undefined) {
        script = Buffer.isBuffer(option.override.script)
            ? option.override.script
            : Buffer.from(option.override.script, 'hex');
    }
    else {
        script = utxo.script ? Buffer.from(utxo.script, 'hex') : undefined;
    }
    switch (addressType) {
        case AddressTypeString.p2pkh || AddressTypeString.p2pkh_testnet: {
            const { output } = detectAddressTypeToScripthash(address);
            // have transform script to scripthash, use witnessScript
            return {
                hash: utxo.txid,
                index: (_a = option.override.vout) !== null && _a !== void 0 ? _a : utxo.vout,
                witnessUtxo: {
                    value: utxo.value,
                    script: Buffer.from(output, 'hex'),
                },
            };
        }
        case AddressTypeString.p2sh || AddressTypeString.p2sh_testnet: {
            const redeemData = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(publicKey, 'hex') });
            return {
                hash: utxo.txid,
                index: (_b = option.override.vout) !== null && _b !== void 0 ? _b : utxo.vout,
                witnessUtxo: {
                    value: utxo.value,
                    script,
                },
                redeemScript: redeemData.output,
            };
        }
        case AddressTypeString.p2wpkh || AddressTypeString.p2wpkh_testnet: {
            return {
                hash: utxo.txid,
                index: (_c = option.override.vout) !== null && _c !== void 0 ? _c : utxo.vout,
                witnessUtxo: {
                    value: utxo.value,
                    script,
                },
            };
        }
        case AddressTypeString.p2tr || AddressTypeString.p2tr_testnet || AddressTypeString.p2tr_regtest: {
            return {
                hash: utxo.txid,
                index: (_d = option.override.vout) !== null && _d !== void 0 ? _d : utxo.vout,
                witnessUtxo: {
                    value: utxo.value,
                    script,
                },
                tapInternalKey: (0, create_key_pair_1.toXOnly)(Buffer.from(publicKey, 'hex')),
            };
        }
    }
}
exports.utxoToInput = utxoToInput;
function getNetwork(network) {
    if (typeof network === 'string') {
        if (network === 'testnet') {
            return bitcoin.networks.testnet;
        }
        else {
            return bitcoin.networks.bitcoin;
        }
    }
    else {
        return network;
    }
}
exports.getNetwork = getNetwork;
function detectAddressTypeToScripthash2(address, network) {
    const _network = getNetwork(network);
    // Detect legacy address
    try {
        bitcoin.address.fromBase58Check(address);
    }
    catch (err) {
        /* empty */
    }
    const addressType = getAddressType(address);
    switch (addressType) {
        case AddressTypeString.p2pkh: {
            const p2pkh = addressToP2PKH(address);
            const p2pkhBuf = Buffer.from(p2pkh, 'hex');
            return {
                output: p2pkh,
                scripthash: Buffer.from((0, js_sha256_1.sha256)(p2pkhBuf), 'hex').reverse().toString('hex'),
                address,
            };
        }
        case AddressTypeString.unknown: {
            throw 'unrecognized address';
        }
        default: {
            const output = bitcoin.address.toOutputScript(address, _network);
            return {
                output,
                scripthash: Buffer.from((0, js_sha256_1.sha256)(output), 'hex').reverse().toString('hex'),
                address,
            };
        }
    }
}
exports.detectAddressTypeToScripthash2 = detectAddressTypeToScripthash2;
