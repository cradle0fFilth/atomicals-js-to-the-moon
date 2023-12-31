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
exports.getFundingUtxo = exports.getFundingSelectedUtxo = exports.getInputUtxoFromTxid = void 0;
const bitcoin = require("bitcoinjs-lib");
const ecc = require("tiny-secp256k1");
const qrcode = require("qrcode-terminal");
bitcoin.initEccLib(ecc);
const getInputUtxoFromTxid = (utxo, electrumx) => __awaiter(void 0, void 0, void 0, function* () {
    const txResult = yield electrumx.getTx(utxo.txId);
    if (!txResult || !txResult.success) {
        throw `Transaction not found in getInputUtxoFromTxid ${utxo.txId}`;
    }
    const tx = txResult.tx;
    utxo.nonWitnessUtxo = Buffer.from(tx, 'hex');
    const reconstructedTx = bitcoin.Transaction.fromHex(tx.tx);
    if (reconstructedTx.getId() !== utxo.txId) {
        throw "getInputUtxoFromTxid txid mismatch error";
    }
    return utxo;
});
exports.getInputUtxoFromTxid = getInputUtxoFromTxid;
const getFundingSelectedUtxo = (address, minFundingSatoshis, electrumx) => __awaiter(void 0, void 0, void 0, function* () {
    // Query for a UTXO
    let listunspents = yield electrumx.getUnspentAddress(address);
    let utxos = listunspents.utxos.filter((utxo) => {
        if (utxo.value >= minFundingSatoshis) {
            return utxo;
        }
    });
    if (!utxos.length) {
        throw new Error(`Unable to select funding utxo, check at least 1 utxo contains ${minFundingSatoshis} satoshis`);
    }
    const selectedUtxo = utxos[0];
    return (0, exports.getInputUtxoFromTxid)(selectedUtxo, electrumx);
});
exports.getFundingSelectedUtxo = getFundingSelectedUtxo;
/**
     * Gets a funding UTXO and also displays qr code for quick deposit
     * @param electrumxApi
     * @param address
     * @param amount
     * @returns
     */
const getFundingUtxo = (electrumxApi, address, amount, suppressDepositAddressInfo = false, seconds = 5) => __awaiter(void 0, void 0, void 0, function* () {
    // We are expected to perform commit work, therefore we must fund with an existing UTXO first to generate the commit deposit address
    if (!suppressDepositAddressInfo) {
        qrcode.generate(address, { small: false });
    }
    // If commit POW was requested, then we will use a UTXO from the funding wallet to generate it
    console.log(`...`);
    console.log(`...`);
    if (!suppressDepositAddressInfo) {
        console.log(`WAITING UNTIL ${amount / 100000000} BTC RECEIVED AT ${address}`);
    }
    console.log(`...`);
    console.log(`...`);
    const fundingUtxo = yield electrumxApi.waitUntilUTXO(address, amount, seconds ? 5 : seconds, false);
    console.log(`Detected Funding UTXO (${fundingUtxo.txid}:${fundingUtxo.vout}) with value ${fundingUtxo.value} for funding...`);
    return fundingUtxo;
});
exports.getFundingUtxo = getFundingUtxo;
