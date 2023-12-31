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
exports.TransferInteractiveNftCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const readline = require("readline");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const qrcode = require("qrcode-terminal");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const address_helpers_1 = require("../utils/address-helpers");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const create_key_pair_1 = require("../utils/create-key-pair");
const address_keypair_path_1 = require("../utils/address-keypair-path");
const command_helpers_1 = require("./command-helpers");
const get_command_1 = require("./get-command");
const get_by_realm_command_1 = require("./get-by-realm-command");
const get_by_container_command_1 = require("./get-by-container-command");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class TransferInteractiveNftCommand {
    constructor(electrumApi, options, atomicalAliasOrId, currentOwnerAtomicalWIF, receiveAddress, fundingWIF, satsbyte, satsoutput) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.atomicalAliasOrId = atomicalAliasOrId;
        this.currentOwnerAtomicalWIF = currentOwnerAtomicalWIF;
        this.receiveAddress = receiveAddress;
        this.fundingWIF = fundingWIF;
        this.satsbyte = satsbyte;
        this.satsoutput = satsoutput;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, address_helpers_1.detectAddressTypeToScripthash)(this.receiveAddress);
            const keypairAtomical = ECPair.fromWIF(this.currentOwnerAtomicalWIF);
            const keypairFunding = ECPair.fromWIF(this.fundingWIF);
            const p2tr = bitcoin.payments.p2tr({
                internalPubkey: (0, create_key_pair_1.toXOnly)(keypairAtomical.publicKey),
                network: command_helpers_1.NETWORK
            });
            const atomicalType = (0, atomical_format_helpers_1.getAtomicalIdentifierType)(this.atomicalAliasOrId);
            let cmd;
            if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_ID || atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_NUMBER) {
                cmd = new get_command_1.GetCommand(this.electrumApi, atomicalType.providedIdentifier || '', command_interface_1.AtomicalsGetFetchType.GET);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.REALM_NAME) {
                cmd = new get_by_realm_command_1.GetByRealmCommand(this.electrumApi, atomicalType.realmName || '', command_interface_1.AtomicalsGetFetchType.GET);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.CONTAINER_NAME) {
                cmd = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, atomicalType.containerName || '', command_interface_1.AtomicalsGetFetchType.GET);
            }
            else {
                throw 'Atomical identifier is invalid. Use a realm name, container name or atomicalId or atomical number';
            }
            const cmdResult = yield cmd.run();
            if (!cmdResult.success) {
                throw 'Unable to resolve Atomical.';
            }
            console.log("====================================================================");
            console.log("Transfer Interactive (NFT)");
            console.log("====================================================================");
            const atomicalId = cmdResult.data.result.atomical_id;
            const atomicalNumber = cmdResult.data.result.atomical_number;
            console.log(`Atomical Id: ${atomicalId}`);
            console.log(`Atomical Number: ${atomicalNumber}`);
            if (cmdResult.data.result.$container) {
                console.log('Container Name: ', cmdResult.data.result.$container);
            }
            if (cmdResult.data.result.$full_realm_name) {
                console.log('Full Realm Name: ', cmdResult.data.result.$full_realm_name);
            }
            console.log('Expected existing address owner of the private key (WIF) provided: ', p2tr.address);
            console.log("Satoshis amount to add into the Atomical at transfer:", this.satsoutput);
            console.log("Requested fee rate satoshis/byte:", this.satsbyte);
            const atomicalInfo = yield this.electrumApi.atomicalsGetLocation(atomicalId);
            const atomicalDecorated = (0, atomical_format_helpers_1.decorateAtomical)(atomicalInfo.result);
            console.log(JSON.stringify(atomicalDecorated, null, 2));
            // Check to make sure that the location is controlled by the same address as supplied by the WIF
            if (!atomicalDecorated.location_info_obj || !atomicalDecorated.location_info_obj.locations || !atomicalDecorated.location_info_obj.locations.length || atomicalDecorated.location_info_obj.locations[0].address !== p2tr.address) {
                throw `Atomical is controlled by a different address (${atomicalDecorated.location_info_obj.locations[0].address}) than the provided wallet (${p2tr.address})`;
            }
            if (atomicalDecorated.location_info_obj.locations[0].atomicals_at_location.length > 1) {
                throw `Multiple atomicals are located at the same address as the NFT. Use the splat command to separate them first.`;
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
            try {
                const cont = yield prompt("Proceed with transfer? Type 'y' to continue: ");
                if (cont.toLowerCase() === 'y') {
                    const txid = yield this.performTransfer(atomicalDecorated, keypairAtomical, keypairFunding, this.satsbyte, this.satsoutput, this.receiveAddress);
                    return {
                        success: true,
                        data: {
                            txid
                        }
                    };
                }
                else {
                    console.log("Cancelled");
                    return {
                        success: false,
                        message: "Cancelled transfer"
                    };
                }
            }
            catch (e) {
                console.log('e', e.toString());
                return {
                    success: false,
                    message: e,
                    e: e.toString()
                };
            }
            finally {
                rl.close();
            }
        });
    }
    performTransfer(atomical, atomicalKeypair, fundingKeypair, satsbyte, satsoutput, receiveAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const keypairAtomical = (0, address_keypair_path_1.getKeypairInfo)(atomicalKeypair);
            if (atomical.type !== 'NFT') {
                throw 'Atomical is not an NFT. It is expected to be an NFT type';
            }
            if (!atomical.location_info_obj || !atomical.location_info_obj.locations || !atomical.location_info_obj.locations.length || atomical.location_info_obj.locations[0].address !== keypairAtomical.address) {
                throw "Provided atomical WIF does not match the location address of the Atomical";
            }
            const keypairFundingInfo = (0, address_keypair_path_1.getKeypairInfo)(fundingKeypair);
            console.log('Funding address of the funding private key (WIF) provided: ', keypairFundingInfo.address);
            (0, command_helpers_1.logBanner)('Preparing Funding Fees...');
            if (!atomical.location_info_obj || atomical.location_info_obj.locations.length !== 1) {
                throw 'expected exactly one location_info for NFT Atomical';
            }
            const location = atomical.location_info_obj.locations[0];
            const { expectedSatoshisDeposit } = (0, command_helpers_1.calculateFundsRequired)(location.value, satsoutput, satsbyte, 0);
            const psbt = new bitcoin.Psbt({ network: command_helpers_1.NETWORK });
            // Add the atomical input, the value from the input counts towards the total satoshi amount required
            psbt.addInput({
                sequence: this.options.rbf ? command_helpers_1.RBF_INPUT_SEQUENCE : undefined,
                hash: location.txid,
                index: location.index,
                witnessUtxo: { value: location.value, script: Buffer.from(location.script, 'hex') },
                tapInternalKey: keypairAtomical.childNodeXOnlyPubkey,
            });
            // There is a funding deficit
            // Could fund with the atomical input value, but we wont
            // const requiresDeposit = expectedSatoshisDeposit > 0;
            (0, command_helpers_1.logBanner)(`DEPOSIT ${expectedSatoshisDeposit / 100000000} BTC to ${keypairFundingInfo.address}`);
            qrcode.generate(keypairFundingInfo.address, { small: false });
            console.log(`...`);
            console.log(`...`);
            console.log(`WAITING UNTIL ${expectedSatoshisDeposit / 100000000} BTC RECEIVED AT ${keypairFundingInfo.address}`);
            console.log(`...`);
            console.log(`...`);
            let utxo = yield this.electrumApi.waitUntilUTXO(keypairFundingInfo.address, expectedSatoshisDeposit, 5, false);
            console.log(`Detected UTXO (${utxo.txid}:${utxo.vout}) with value ${utxo.value} for funding the transfer operation...`);
            // Add the funding input
            psbt.addInput({
                sequence: this.options.rbf ? command_helpers_1.RBF_INPUT_SEQUENCE : undefined,
                hash: utxo.txid,
                index: utxo.outputIndex,
                witnessUtxo: { value: utxo.value, script: keypairFundingInfo.output },
                tapInternalKey: keypairFundingInfo.childNodeXOnlyPubkey,
            });
            psbt.addOutput({
                value: this.satsoutput,
                address: receiveAddress,
            });
            const isMoreThanDustChangeRemaining = utxo.value - expectedSatoshisDeposit >= 546;
            if (isMoreThanDustChangeRemaining) {
                // Add change output
                console.log(`Adding change output, remaining: ${utxo.value - expectedSatoshisDeposit}`);
                psbt.addOutput({
                    value: utxo.value - expectedSatoshisDeposit,
                    address: keypairFundingInfo.address
                });
            }
            psbt.signInput(0, keypairAtomical.tweakedChildNode);
            psbt.signInput(1, keypairFundingInfo.tweakedChildNode);
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const rawtx = tx.toHex();
            console.log(`Constructed Atomicals NFT Transfer, attempting to broadcast: ${tx.getId()}`);
            let broadcastedTxId = yield this.electrumApi.broadcast(rawtx);
            console.log(`Success!`);
            return broadcastedTxId;
        });
    }
}
exports.TransferInteractiveNftCommand = TransferInteractiveNftCommand;
