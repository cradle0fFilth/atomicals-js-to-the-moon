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
exports.TransferInteractiveFtCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const readline = require("readline");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const qrcode = require("qrcode-terminal");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const address_helpers_1 = require("../utils/address-helpers");
const address_keypair_path_1 = require("../utils/address-keypair-path");
const command_helpers_1 = require("./command-helpers");
const utils_1 = require("../utils/utils");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const get_command_1 = require("./get-command");
const get_by_ticker_command_1 = require("./get-by-ticker-command");
const protocol_tags_1 = require("../types/protocol-tags");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class TransferInteractiveFtCommand {
    constructor(electrumApi, options, atomicalAliasOrId, currentOwnerAtomicalWIF, fundingWIF, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.atomicalAliasOrId = atomicalAliasOrId;
        this.currentOwnerAtomicalWIF = currentOwnerAtomicalWIF;
        this.fundingWIF = fundingWIF;
        this.validatedWalletInfo = validatedWalletInfo;
        this.satsbyte = satsbyte;
        this.nofunding = nofunding;
        this.atomicalIdReceipt = atomicalIdReceipt;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.atomicalIdReceipt && !(0, atomical_format_helpers_1.isAtomicalId)(this.atomicalIdReceipt)) {
                throw new Error('AtomicalId receipt is not a valid atomical id');
            }
            const keypairAtomical = ECPair.fromWIF(this.currentOwnerAtomicalWIF);
            const keypairFunding = ECPair.fromWIF(this.fundingWIF);
            const keypairFundingInfo = (0, address_keypair_path_1.getKeypairInfo)(keypairFunding);
            const keypairAtomicalInfo = (0, address_keypair_path_1.getKeypairInfo)(keypairAtomical);
            const atomicalType = (0, atomical_format_helpers_1.getAtomicalIdentifierType)(this.atomicalAliasOrId);
            let cmd;
            if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_ID || atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_NUMBER) {
                cmd = new get_command_1.GetCommand(this.electrumApi, atomicalType.providedIdentifier || '', command_interface_1.AtomicalsGetFetchType.GET);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.TICKER_NAME) {
                cmd = new get_by_ticker_command_1.GetByTickerCommand(this.electrumApi, atomicalType.tickerName || '', command_interface_1.AtomicalsGetFetchType.GET);
            }
            else {
                throw 'Atomical identifier is invalid. Use a ticker or atomicalId or atomical number';
            }
            const cmdResult = yield cmd.run();
            if (!cmdResult.success) {
                throw 'Unable to resolve Atomical.';
            }
            console.log("====================================================================");
            console.log("Transfer Interactive (FT)");
            console.log("====================================================================");
            const atomicalId = cmdResult.data.result.atomical_id;
            const atomicalNumber = cmdResult.data.result.atomical_number;
            const ticker = cmdResult.data.result.$ticker;
            console.log(`Atomical Id: ${atomicalId}`);
            console.log(`Atomical Number: ${atomicalNumber}`);
            console.log(`Ticker Symbol: ${ticker}`);
            const transferOptions = yield this.promptTransferOptions(atomicalId, keypairAtomicalInfo.address);
            const tx = yield this.buildAndSendTransaction(transferOptions, keypairAtomicalInfo, keypairFundingInfo, this.satsbyte);
            return {
                tx
            };
        });
    }
    promptTransferOptions(atomicalId, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const atomicalsInfo = yield this.getBalanceSummary(atomicalId, address);
            if (atomicalsInfo.type !== 'FT') {
                throw 'Atomical is not an FT. It is expected to be an FT type';
            }
            if (atomicalsInfo.$ticker) {
                console.log(`Ticker: ${atomicalsInfo.$ticker}`);
            }
            console.log(`Current Owner Address: ${address}`);
            console.log(`Confirmed Balance: `, atomicalsInfo.confirmed);
            if (atomicalsInfo.utxos.length === 0) {
                throw `No UTXOs available for ${atomicalId} and address ${address}`;
            }
            console.log(`---------------------------------------------------------------------`);
            console.log(`Step 1. Select UTXOs to send`);
            console.log(`---`);
            console.log(`UTXOs Count: `, atomicalsInfo.utxos.length);
            console.log(`UTXOs: `);
            let i = 0;
            atomicalsInfo.utxos.map((utxo) => {
                console.log(`${i}.`);
                console.log(JSON.stringify(utxo, null, 2));
                i++;
            });
            const selectedUtxos = yield this.promptUtxoSelection(atomicalsInfo);
            yield this.promptIfDetectedMultipleAtomicalsAtSameUtxos(atomicalId, selectedUtxos);
            console.log('Selected UTXOs For Sending: ', JSON.stringify(selectedUtxos, null, 2));
            console.log(`---------------------------------------------------------------------`);
            console.log(`Step 2. Enter receive amounts`);
            console.log(`UTXOs Chosen Count: `, selectedUtxos.length);
            const chosenSum = selectedUtxos.reduce((accum, item) => accum + item.value, 0);
            console.log(`UTXOs Chosen Balance: `, chosenSum);
            console.log(`---`);
            const outputs = yield this.promptAmountsToSend(this.validatedWalletInfo, chosenSum);
            console.log('Selected UTXOs: ', JSON.stringify(selectedUtxos, null, 2));
            console.log('Recipients: ', JSON.stringify(outputs, null, 2));
            console.log(`---------------------------------------------------------------------`);
            console.log(`Step 3. Confirm and send`);
            yield this.promptContinue(atomicalsInfo, selectedUtxos);
            return {
                atomicalsInfo,
                selectedUtxos,
                outputs
            };
        });
    }
    promptIfDetectedMultipleAtomicalsAtSameUtxos(atomicalId, selectedUtxos) {
        return __awaiter(this, void 0, void 0, function* () {
            const dupMap = {};
            dupMap[atomicalId] = true;
            let i = 0;
            let isOtherAtomicalsFound = false;
            const indexesOfSelectedUtxosWithMultipleAtomicals = [];
            for (const utxo of selectedUtxos) {
                for (const atomical of utxo.atomicals) {
                    if (!dupMap[atomical]) {
                        isOtherAtomicalsFound = true;
                        indexesOfSelectedUtxosWithMultipleAtomicals.push(i);
                    }
                }
                i++;
            }
            if (!isOtherAtomicalsFound) {
                return;
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            try {
                let reply = '';
                const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
                console.log(`WARNING! There are some chosen UTXOs which contain multiple Atomicals which would be transferred at the same time.`);
                console.log(`It is recommended to use the "extract" (NFT) or "skip" (FT) operations to separate them first.`);
                let i = 0;
                for (const item of indexesOfSelectedUtxosWithMultipleAtomicals) {
                    console.log(`${i}.`);
                    console.log(JSON.stringify(item, null, 2));
                    i++;
                }
                reply = (yield prompt("To ignore and continue type 'y' or 'n' to cancel: "));
                if (reply === 'y' || reply === 'yes') {
                    return;
                }
                if (reply === 'n' || reply === 'no') {
                    throw 'Aborted. User cancelled';
                }
                throw 'Aborted';
            }
            finally {
                rl.close();
            }
        });
    }
    promptUtxoSelection(info) {
        return __awaiter(this, void 0, void 0, function* () {
            let selectedUtxos = [];
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            try {
                let reply = '';
                const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
                while (reply !== 'f') {
                    const currentBalance = selectedUtxos.reduce((accum, item) => accum + item.value, 0);
                    console.log(`Selected amount: ${currentBalance}`);
                    console.log(`Options: '*' for all, or enter specific UTXO number or 'f' for Finished selecting`);
                    console.log('-');
                    reply = (yield prompt("Select which UTXOs to transfer: "));
                    switch (reply) {
                        case '*':
                            return info.utxos;
                        case 'f':
                            return selectedUtxos;
                        default:
                            const parsedNum = parseInt(reply, 10);
                            if (parsedNum >= info.utxos.length || parsedNum < 0) {
                                console.log('Invalid selection. Maximum: ' + (info.utxos.length - 1));
                                continue;
                            }
                            selectedUtxos.push(info.utxos[parsedNum]);
                            // Filter out dups
                            selectedUtxos = selectedUtxos.filter(utils_1.onlyUnique);
                            break;
                    }
                }
                return selectedUtxos;
            }
            finally {
                rl.close();
            }
        });
    }
    promptContinue(info, selectedUtxos) {
        return __awaiter(this, void 0, void 0, function* () {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            try {
                let reply = '';
                const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
                reply = (yield prompt("Does everything look good above? To continue funding the transfer type 'y' or 'yes': "));
                if (reply === 'y' || reply === 'yes') {
                    return;
                }
                throw 'Aborted';
            }
            finally {
                rl.close();
            }
        });
    }
    getBalanceSummary(atomicalId, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.electrumApi.atomicalsByAddress(address);
            if (!res.atomicals[atomicalId]) {
                throw "No Atomicals found for " + atomicalId;
            }
            // console.log(JSON.stringify(res.atomicals[atomicalId], null, 2))
            // console.log(JSON.stringify(res.utxos, null, 2))
            const filteredUtxosByAtomical = [];
            for (const utxo of res.utxos) {
                if (utxo.atomicals.find((item) => item === atomicalId)) {
                    filteredUtxosByAtomical.push({
                        txid: utxo.txid,
                        index: utxo.index,
                        value: utxo.value,
                        height: utxo.height,
                        atomicals: utxo.atomicals,
                    });
                }
            }
            return {
                confirmed: res.atomicals[atomicalId].confirmed,
                type: res.atomicals[atomicalId].type,
                utxos: filteredUtxosByAtomical
            };
        });
    }
    promptAmountsToSend(validatedWalletInfo, availableBalance) {
        return __awaiter(this, void 0, void 0, function* () {
            let remainingBalance = availableBalance;
            const amountsToSend = [];
            const min = 1000;
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            try {
                const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
                while (remainingBalance > 0) {
                    console.log(`Recipients: `);
                    let accumulatd = 0;
                    amountsToSend.map((item) => {
                        console.log(`${item.address}: ${item.value}`);
                        accumulatd += item.value;
                    });
                    if (!amountsToSend.length) {
                        console.log('No recipients yet...');
                    }
                    console.log('-');
                    console.log(`Accumulated amount: ${accumulatd}`);
                    console.log(`Remaining amount: ${remainingBalance}`);
                    console.log(`'f' for Finished adding recipients`);
                    console.log('-');
                    let reply = yield prompt("Enter address and amount separated by a space: ");
                    if (reply === 'f') {
                        break;
                    }
                    const splitted = reply.split(/[ ,]+/);
                    let addressPart = (0, address_helpers_1.performAddressAliasReplacement)(validatedWalletInfo, splitted[0]);
                    const valuePart = parseInt(splitted[1], 10);
                    if (valuePart < 546 || !valuePart) {
                        console.log('Invalid value, minimum: 546');
                        continue;
                    }
                    if (remainingBalance - valuePart < 0) {
                        console.log('Invalid value, maximum remaining: ' + remainingBalance);
                        continue;
                    }
                    try {
                        (0, address_helpers_1.detectAddressTypeToScripthash)(addressPart.address);
                    }
                    catch (err) {
                        console.log('Invalid address');
                        continue;
                    }
                    amountsToSend.push({
                        address: addressPart.address,
                        value: valuePart
                    });
                    remainingBalance -= valuePart;
                }
                if (!this.nofunding) {
                    if (remainingBalance > 0) {
                        throw new Error('Remaining balance was not 0');
                    }
                }
                console.log('Successfully allocated entire available amounts to recipients...');
                return amountsToSend;
            }
            finally {
                rl.close();
            }
        });
    }
    buildAndSendTransaction(transferOptions, keyPairAtomical, keyPairFunding, satsbyte) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transferOptions.atomicalsInfo.type !== 'FT') {
                throw 'Atomical is not an FT. It is expected to be an FT type';
            }
            const psbt = new bitcoin.Psbt({ network: command_helpers_1.NETWORK });
            let tokenBalanceIn = 0;
            let tokenBalanceOut = 0;
            let tokenInputsLength = 0;
            let tokenOutputsLength = 0;
            for (const utxo of transferOptions.selectedUtxos) {
                // Add the atomical input, the value from the input counts towards the total satoshi amount required
                const { output } = (0, address_helpers_1.detectAddressTypeToScripthash)(keyPairAtomical.address);
                psbt.addInput({
                    sequence: this.options.rbf ? command_helpers_1.RBF_INPUT_SEQUENCE : undefined,
                    hash: utxo.txid,
                    index: utxo.index,
                    witnessUtxo: { value: utxo.value, script: Buffer.from(output, 'hex') },
                    tapInternalKey: keyPairAtomical.childNodeXOnlyPubkey,
                });
                tokenBalanceIn += utxo.value;
                tokenInputsLength++;
            }
            for (const output of transferOptions.outputs) {
                psbt.addOutput({
                    value: output.value,
                    address: output.address,
                });
                tokenBalanceOut += output.value;
                tokenOutputsLength++;
            }
            if (this.atomicalIdReceipt) {
                const outpoint = (0, atomical_format_helpers_1.compactIdToOutpoint)(this.atomicalIdReceipt);
                console.log('outpoint', outpoint);
                const atomEnvBuf = Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8');
                const payOpBuf = Buffer.from('p', 'utf8');
                const outpointBuf = Buffer.from(outpoint, 'hex');
                const embed = bitcoin.payments.embed({ data: [atomEnvBuf, payOpBuf, outpointBuf] });
                const paymentRecieptOpReturn = embed.output;
                psbt.addOutput({
                    script: paymentRecieptOpReturn,
                    value: 0,
                });
            }
            if (!this.nofunding) {
                // TODO DETECT THAT THERE NEEDS TO BE CHANGE ADDED AND THEN 
                if (tokenBalanceIn !== tokenBalanceOut) {
                    throw 'Invalid input and output does not match for token. Developer Error.';
                }
            }
            const { expectedSatoshisDeposit } = (0, command_helpers_1.calculateFTFundsRequired)(transferOptions.selectedUtxos.length, transferOptions.outputs.length, satsbyte, 0);
            if (expectedSatoshisDeposit < 546) {
                throw 'Invalid expectedSatoshisDeposit. Developer Error.';
            }
            (0, command_helpers_1.logBanner)(`DEPOSIT ${expectedSatoshisDeposit / 100000000} BTC to ${keyPairFunding.address}`);
            qrcode.generate(keyPairFunding.address, { small: false });
            console.log(`...`);
            console.log(`...`);
            console.log(`WAITING UNTIL ${expectedSatoshisDeposit / 100000000} BTC RECEIVED AT ${keyPairFunding.address}`);
            console.log(`...`);
            console.log(`...`);
            let utxo = yield this.electrumApi.waitUntilUTXO(keyPairFunding.address, expectedSatoshisDeposit, 5, false);
            console.log(`Detected UTXO (${utxo.txid}:${utxo.vout}) with value ${utxo.value} for funding the transfer operation...`);
            if (!this.nofunding) {
                // Add the funding input
                psbt.addInput({
                    sequence: this.options.rbf ? command_helpers_1.RBF_INPUT_SEQUENCE : undefined,
                    hash: utxo.txid,
                    index: utxo.outputIndex,
                    witnessUtxo: { value: utxo.value, script: keyPairFunding.output },
                    tapInternalKey: keyPairFunding.childNodeXOnlyPubkey,
                });
            }
            const isMoreThanDustChangeRemaining = utxo.value - expectedSatoshisDeposit >= 546;
            if (isMoreThanDustChangeRemaining) {
                // Add change output
                console.log(`Adding change output, remaining: ${utxo.value - expectedSatoshisDeposit}`);
                psbt.addOutput({
                    value: utxo.value - expectedSatoshisDeposit,
                    address: keyPairFunding.address,
                });
            }
            let i = 0;
            for (i = 0; i < tokenInputsLength; i++) {
                console.log(`Signing Atomical input ${i}...`);
                psbt.signInput(i, keyPairAtomical.tweakedChildNode);
            }
            // Sign the final funding input
            console.log('Signing funding input...');
            psbt.signInput(i, keyPairFunding.tweakedChildNode);
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const rawtx = tx.toHex();
            console.log(`Constructed Atomicals FT Transfer, attempting to broadcast: ${tx.getId()}`);
            let broadcastedTxId = yield this.electrumApi.broadcast(rawtx);
            console.log(`Success!`);
            return {
                success: true,
                data: { txid: broadcastedTxId }
            };
        });
    }
    accumulateAsc(amount, utxos) {
        const cloned = [...utxos];
        cloned.sort(function (a, b) {
            return a.value - b.value;
        });
        const selectedUtxos = [];
        let remainingAmount = amount;
        for (const utxo of cloned) {
            selectedUtxos.push(utxo);
            remainingAmount -= amount;
            if (remainingAmount <= 0) {
                break;
            }
        }
        return selectedUtxos;
    }
    accumulateDesc(amount, utxos) {
        const cloned = [...utxos];
        cloned.sort(function (a, b) {
            return b.value - a.value;
        });
        const selectedUtxos = [];
        let remainingAmount = amount;
        for (const utxo of cloned) {
            selectedUtxos.push(utxo);
            remainingAmount -= amount;
            if (remainingAmount <= 0) {
                break;
            }
        }
        return selectedUtxos;
    }
}
exports.TransferInteractiveFtCommand = TransferInteractiveFtCommand;
