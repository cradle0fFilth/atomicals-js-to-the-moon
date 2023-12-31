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
exports.PendingSubrealmsCommand = void 0;
const address_helpers_1 = require("../utils/address-helpers");
const readline = require("readline");
const chalk = require("chalk");
const address_keypair_path_1 = require("../utils/address-keypair-path");
const command_helpers_1 = require("./command-helpers");
const ecc = require("tiny-secp256k1");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const qrcode = require("qrcode-terminal");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
;
const ecpair_1 = require("ecpair");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const protocol_tags_1 = require("../types/protocol-tags");
class PendingSubrealmsCommand {
    constructor(electrumApi, options, address, fundingWIF, satsbyte, display) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.satsbyte = satsbyte;
        this.display = display;
    }
    static isCurrentAtomicalPendingCandidate(entry) {
        return entry['request_subrealm_status']['pending_candidate_atomical_id'] == entry['atomical_id'];
    }
    static isPendingCandidate(entry) {
        switch (entry['request_subrealm_status']['status']) {
            case 'pending_awaiting_confirmations_payment_received_prematurely':
            case 'pending_awaiting_confirmations_for_payment_window':
            case 'pending_awaiting_confirmations':
            case 'pending_awaiting_payment':
                if (PendingSubrealmsCommand.isCurrentAtomicalPendingCandidate(entry))
                    return true;
            default:
        }
        return false;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const keypairFunding = ECPair.fromWIF(this.fundingWIF);
            const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
            let res = yield this.electrumApi.atomicalsByScripthash(scripthash, true);
            const statusMap = {};
            const current_block_height = res.global.height;
            for (const prop in res.atomicals) {
                if (!res.atomicals.hasOwnProperty(prop)) {
                    continue;
                }
                const entry = res.atomicals[prop];
                if (entry.type !== 'NFT') {
                    continue;
                }
                if (!entry.subtype || entry.subtype !== 'request_subrealm') {
                    continue;
                }
                const entryStatus = entry['request_subrealm_status']['status'];
                if (!PendingSubrealmsCommand.isPendingCandidate(entry)) {
                    continue;
                }
                let candidateInfo = null;
                for (const candidate of entry['subrealm_candidates']) {
                    if (candidate['atomical_id'] == entry['atomical_id']) {
                        candidateInfo = candidate;
                        break;
                    }
                }
                // It is a pending for the current atomical
                statusMap[entry.subtype] = statusMap[entry.subtype] || {};
                statusMap[entry.subtype][entryStatus] = statusMap[entry.subtype][entryStatus] || [];
                const obj = Object.assign({ atomical_id: entry['atomical_id'], atomical_number: entry['atomical_number'], request_full_realm_name: entry['request_full_realm_name'], status: entry['request_subrealm_status'], payment_type: entry['payment_type'] }, entry);
                if (candidateInfo.payment_type == 'applicable_rule') {
                    obj['make_payment_from_height'] = candidateInfo['make_payment_from_height'];
                    obj['payment_due_no_later_than_height'] = candidateInfo['payment_due_no_later_than_height'];
                    obj['applicable_rule'] = candidateInfo['applicable_rule'];
                }
                statusMap[entry.subtype][entryStatus].push(obj);
            }
            const statusReturn = Object.assign({ current_block_height }, statusMap);
            this.makePrettyMenu(statusReturn);
            if (this.display) {
                console.log('display on');
                return {
                    success: true,
                    data: statusReturn
                };
            }
            let selection = yield this.promptSubrealmSelection(statusReturn['request_subrealm']['pending_awaiting_payment']);
            if (!selection) {
                return {
                    success: false,
                    data: statusReturn
                };
            }
            // overide to test sending premature payments
            // selection = statusReturn['request_subrealm']['pending_awaiting_confirmations_for_payment_window'][0];
            const expectedPaymentOutputsMap = selection['applicable_rule']['matched_rule']['o'];
            const paymentOutputs = [];
            console.log('Sats per byte', this.satsbyte);
            let num = 0;
            for (const propScript in expectedPaymentOutputsMap) {
                if (!expectedPaymentOutputsMap.hasOwnProperty(propScript)) {
                    continue;
                }
                const outputValue = expectedPaymentOutputsMap[propScript]['v'];
                const outputArc20 = expectedPaymentOutputsMap[propScript]['id'];
                const expectedAddress = (0, address_helpers_1.detectScriptToAddressType)(propScript);
                paymentOutputs.push({
                    address: expectedAddress,
                    value: outputValue
                });
                console.log('Output #' + num);
                if (outputArc20) {
                    console.log('Price: ', outputValue / 100000000, `ARC20: (${outputArc20})`);
                }
                else {
                    console.log('Price: ', outputValue / 100000000);
                }
                if (outputArc20) {
                    console.log(`WARNING: You must send ARC20: (${outputArc20}) for this output`);
                }
                console.log('Payment Address:', expectedAddress);
                num++;
            }
            const paymentResult = yield this.makePayment(selection['atomical_id'], paymentOutputs, keypairFunding, this.satsbyte);
            return {
                success: true,
                data: paymentResult
            };
        });
    }
    hasSubrealmsAwaitingPayment(statusReturn) {
        return statusReturn['request_subrealm'] && statusReturn['request_subrealm']['pending_awaiting_payment'];
    }
    hasSubrealmsAwaitingPaymentWindow(statusReturn) {
        return statusReturn['request_subrealm'] && statusReturn['request_subrealm']['pending_awaiting_confirmations_for_payment_window'];
    }
    calculateFundsRequired(price, satsbyte) {
        const base = 300 * (satsbyte ? satsbyte : 1);
        return base + price;
    }
    makePayment(atomicalId, paymentOutputs, fundingKeypair, satsbyte) {
        return __awaiter(this, void 0, void 0, function* () {
            const keypairFundingInfo = (0, address_keypair_path_1.getKeypairInfo)(fundingKeypair);
            console.log('Funding address of the funding private key (WIF) provided: ', keypairFundingInfo.address);
            (0, command_helpers_1.logBanner)('Preparing Funding Fees...');
            let price = 0;
            paymentOutputs.map((e) => {
                price += e.value;
            });
            console.log('paymentOutputs', paymentOutputs);
            const expectedSatoshisDeposit = this.calculateFundsRequired(price, satsbyte);
            const psbt = new bitcoin.Psbt({ network: command_helpers_1.NETWORK });
            (0, command_helpers_1.logBanner)(`DEPOSIT ${expectedSatoshisDeposit / 100000000} BTC to ${keypairFundingInfo.address}`);
            qrcode.generate(keypairFundingInfo.address, { small: false });
            console.log(`...`);
            console.log(`...`);
            console.log(`WAITING UNTIL ${expectedSatoshisDeposit / 100000000} BTC RECEIVED AT ${keypairFundingInfo.address}`);
            console.log(`...`);
            console.log(`...`);
            let utxo = yield this.electrumApi.waitUntilUTXO(keypairFundingInfo.address, expectedSatoshisDeposit, 5, true);
            console.log(`Detected UTXO (${utxo.txid}:${utxo.vout}) with value ${utxo.value} for funding the operation...`);
            // Add the funding input
            psbt.addInput({
                sequence: this.options.rbf ? command_helpers_1.RBF_INPUT_SEQUENCE : undefined,
                hash: utxo.txid,
                index: utxo.outputIndex,
                witnessUtxo: { value: utxo.value, script: keypairFundingInfo.output },
                tapInternalKey: keypairFundingInfo.childNodeXOnlyPubkey,
            });
            for (const paymentOutput of paymentOutputs) {
                psbt.addOutput({
                    value: paymentOutput.value,
                    address: paymentOutput.address,
                });
            }
            const outpoint = (0, atomical_format_helpers_1.compactIdToOutpoint)(atomicalId);
            const atomEnvBuf = Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8');
            const payOpBuf = Buffer.from('p', 'utf8');
            const outpointBuf = Buffer.from(outpoint, 'hex');
            const embed = bitcoin.payments.embed({ data: [atomEnvBuf, payOpBuf, outpointBuf] });
            const paymentRecieptOpReturn = embed.output;
            psbt.addOutput({
                script: paymentRecieptOpReturn,
                value: 0,
            });
            // Add op return here
            psbt.signInput(0, keypairFundingInfo.tweakedChildNode);
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const rawtx = tx.toHex();
            console.log('rawtx', rawtx);
            console.log(`Constructed Atomicals Payment, attempting to broadcast: ${tx.getId()}`);
            console.log(`About to broadcast`);
            let broadcastedTxId = yield this.electrumApi.broadcast(rawtx);
            console.log(`Success!`);
            return broadcastedTxId;
        });
    }
    makePrettyMenu(statusReturn) {
        console.log(chalk.blue.bold('GENERAL INFORMATION'));
        console.log(chalk.blue.bold('------------------------------------------------------'));
        console.log('Current Block Height: ', chalk.bold(statusReturn.current_block_height));
        console.log('\n');
        console.log(chalk.blue.bold('PENDING AWAITING PAYMENT'));
        console.log(chalk.blue.bold('------------------------------------------------------'));
        let counter = 0;
        if (!this.hasSubrealmsAwaitingPayment(statusReturn)) {
            console.log('There are no subrealms awaiting payment at the moment. Any pending awaiting payments will appear here during their payment windows.');
            console.log('\n');
        }
        else {
            for (const subrealm_pending of statusReturn['request_subrealm']['pending_awaiting_payment']) {
                console.log(chalk.bold(counter + '. Subrealm Request: +' + subrealm_pending['request_full_realm_name']));
                console.log('Atomical Id: ' + subrealm_pending['atomical_id']);
                console.log('Atomical Number: ' + subrealm_pending['atomical_number']);
                console.log('Status: ', subrealm_pending['status']['status']);
                const make_payment_from_height = subrealm_pending['make_payment_from_height'];
                const payment_due_no_later_than_height = subrealm_pending['payment_due_no_later_than_height'];
                console.log(`make_payment_from_height: ` + chalk.bold(`${make_payment_from_height}`));
                console.log(`payment_due_no_later_than_height: ` + chalk.bold(`${payment_due_no_later_than_height}`));
                const expectedPaymentOutputs = subrealm_pending['applicable_rule']['matched_rule']['o'];
                let i = 0;
                for (const propScript in expectedPaymentOutputs) {
                    if (!expectedPaymentOutputs.hasOwnProperty(propScript)) {
                        continue;
                    }
                    const expectedOutputScript = propScript;
                    const expectedAddress = (0, address_helpers_1.detectScriptToAddressType)(expectedOutputScript);
                    console.log('Expected Payment Outputs For Rule: ');
                    //const applicableRulePrice = expectedPaymentOutputs[propScript];
                    const outputValue = expectedPaymentOutputs[propScript]['v'];
                    const outputArc20 = expectedPaymentOutputs[propScript]['id'];
                    const price = outputValue / 100000000;
                    if (outputArc20) {
                        console.log(`Payment output #${i} to address ${expectedAddress} for amount ${price} in ARC20: ${outputArc20}`);
                    }
                    else {
                        console.log(`Payment output #${i} to address ${expectedAddress} for amount ${price}`);
                    }
                    i++;
                }
                const outpoint = (0, atomical_format_helpers_1.compactIdToOutpoint)(subrealm_pending['atomical_id']);
                const atomEnvBuf = Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8');
                const payOpBuf = Buffer.from('p', 'utf8');
                const outpointBuf = Buffer.from(outpoint, 'hex');
                const embed = bitcoin.payments.embed({ data: [atomEnvBuf, payOpBuf, outpointBuf] });
                const paymentReceipt = embed.output;
                console.log(`Payment receipt (OP_RETURN): ` + chalk.bold(`${paymentReceipt.toString('hex')}`));
                console.log(chalk.red.bold(`ACTION REQUIRED: Make payment outputs before block height ${payment_due_no_later_than_height}`));
                console.log(chalk.red.bold(`WARNING: If the payment is not made by block ${payment_due_no_later_than_height} then someone else could claim this subrealm and your request will expire.`));
                console.log('\n');
                counter++;
            }
        }
        console.log(chalk.blue.bold('PENDING AWAITING CONFIRMATIONS FOR PAYMENT WINDOW'));
        console.log(chalk.blue.bold('------------------------------------------------------'));
        if (!this.hasSubrealmsAwaitingPaymentWindow(statusReturn)) {
            console.log('There are no subrealms awaiting confirmations for the payment window. Go ahead and mint a subrealm first.');
            console.log('\n');
        }
        else {
            for (const subrealm_pending of statusReturn['request_subrealm']['pending_awaiting_confirmations_for_payment_window']) {
                console.log(chalk.bold('Pending Subrealm Request: +' + subrealm_pending['request_full_realm_name']));
                console.log('Atomical Id: ' + subrealm_pending['atomical_id']);
                console.log('Atomical Number: ' + subrealm_pending['atomical_number']);
                console.log('Status: ', subrealm_pending['status']['status']);
                const make_payment_from_height = subrealm_pending['make_payment_from_height'];
                const payment_due_no_later_than_height = subrealm_pending['payment_due_no_later_than_height'];
                console.log(`make_payment_from_height: ` + chalk.bold(`${make_payment_from_height}`));
                console.log(`payment_due_no_later_than_height: ` + chalk.bold(`${payment_due_no_later_than_height}`));
                const applicableRulePrice = subrealm_pending['applicable_rule']['matched_rule']['satoshis'];
                const price = applicableRulePrice / 100000000;
                console.log(chalk.green.bold(`NO ACTION REQUIRED YET. Wait until block height ${make_payment_from_height} for the payment window to open. The price will be ${price} if your request is the leading candidate.`));
                console.log(`WARNING: If a payment is made prematurely ${payment_due_no_later_than_height} then your funds would be lost if someone had an earlier commit and reveals it before block height ${make_payment_from_height}`);
                console.log('------------------------------------------------------');
            }
        }
        console.log(chalk.blue.bold('OTHER PENDING STATES'));
        console.log(chalk.blue.bold('------------------------------------------------------'));
        let foundOther = false;
        for (const prop in statusReturn['request_subrealm']) {
            if (!statusReturn['request_subrealm'].hasOwnProperty(prop)) {
                continue;
            }
            if (prop === 'pending_awaiting_payment' || prop === 'pending_awaiting_confirmations_for_payment_window') {
                continue;
            }
            foundOther = true;
            const subrealm_pendings_list = statusReturn['request_subrealm'][prop];
            for (const subrealm_pending of subrealm_pendings_list) {
                console.log(chalk.bold('Pending: +' + subrealm_pending['request_full_realm_name']));
                console.log('Atomical Id: ' + subrealm_pending['atomical_id']);
                console.log('Atomical Number: ' + subrealm_pending['atomical_number']);
                console.log('Status: ', subrealm_pending['status']['status']);
                console.log(`NO ACTION REQUIRED`);
                console.log('------------------------------------------------------');
            }
        }
        if (!foundOther) {
            console.log('There are no subrealms in other pending states');
            console.log('\n');
        }
    }
    promptSubrealmSelection(pendingSubrealms) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pendingSubrealms || !pendingSubrealms.length) {
                return null;
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            try {
                let reply = '';
                const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
                while (reply !== 'q') {
                    console.log(`Specify the number of the subrealm above to make a payment for or 'q' to quit.`);
                    console.log('-');
                    reply = (yield prompt("Enter your selection: "));
                    switch (reply) {
                        case 'q':
                            throw new Error('User cancelled');
                        default:
                            const parsedNum = parseInt(reply, 10);
                            if (parsedNum >= pendingSubrealms.length || parsedNum < 0) {
                                console.log('Invalid selection.');
                                continue;
                            }
                            return pendingSubrealms[parsedNum];
                    }
                }
                return null;
            }
            finally {
                rl.close();
            }
        });
    }
}
exports.PendingSubrealmsCommand = PendingSubrealmsCommand;
