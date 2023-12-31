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
exports.MintInteractiveDitemCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const address_helpers_1 = require("../utils/address-helpers");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const get_by_container_command_1 = require("./get-by-container-command");
const file_utils_1 = require("../utils/file-utils");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const get_container_item_validated_command_1 = require("./get-container-item-validated-command");
const crypto_1 = require("bitcoinjs-lib/src/crypto");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
class MintInteractiveDitemCommand {
    constructor(electrumApi, options, container, requestDmitem, manifestJsonFile, address, fundingWIF) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.container = container;
        this.requestDmitem = requestDmitem;
        this.manifestJsonFile = manifestJsonFile;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
        this.container = this.container.startsWith('#') ? this.container.substring(1) : this.container;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
                console.log("Initial mint address:", this.address);
            }
            catch (ex) {
                console.log('Error validating initial owner address');
                throw ex;
            }
            const getCmd = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, this.container, command_interface_1.AtomicalsGetFetchType.GET);
            const getResponse = yield getCmd.run();
            if (!getResponse.success || !getResponse.data.result.atomical_id) {
                return {
                    success: false,
                    msg: 'Error retrieving container parent atomical ' + this.container,
                    data: getResponse.data
                };
            }
            // Step 0. Get the details from the manifest
            const parentContainerId = getResponse.data.result.atomical_id;
            const jsonFile = yield (0, file_utils_1.jsonFileReader)(this.manifestJsonFile);
            const expectedData = jsonFile['data'];
            if (expectedData['args']['request_dmitem'] !== this.requestDmitem) {
                throw new Error('Mismatch item id');
            }
            const fileBuf = Buffer.from(expectedData[expectedData['args']['main']]['$b'], 'hex');
            const main = expectedData['args']['main'];
            const mainHash = (0, crypto_1.hash256)(fileBuf).toString('hex');
            const proof = expectedData['args']['proof'];
            // Step 1. Query the container item to see if it's taken
            const getItemCmd = new get_container_item_validated_command_1.GetContainerItemValidatedCommand(this.electrumApi, this.container, this.requestDmitem, 'any', 'any', main, mainHash, proof, false);
            const getItemCmdResponse = yield getItemCmd.run();
            const data = getItemCmdResponse.data;
            console.log(getItemCmdResponse);
            if (data.atomical_id) {
                throw new Error('Container item is already claimed. Choose another item');
            }
            if (!data.proof_valid) {
                throw new Error('Item proof is invalid');
            }
            if (data.status) {
                throw new Error(`Item already contains status: ${data.status}`);
            }
            if (!data.applicable_rule) {
                throw new Error('No applicable rule');
            }
            if (data.applicable_rule.bitworkc || expectedData['args']['bitworkc']) {
                if (data.applicable_rule.bitworkc && expectedData['args']['bitworkc'] && (data.applicable_rule.bitworkc !== expectedData['args']['bitworkc'] && data.applicable_rule.bitworkc !== 'any')) {
                    throw new Error('applicable_rule bitworkc is not compatible with the item args bitworkc');
                }
            }
            if (data.applicable_rule.bitworkr || expectedData['args']['bitworkr']) {
                if (data.applicable_rule.bitworkr && expectedData['args']['bitworkr'] && (data.applicable_rule.bitworkr !== expectedData['args']['bitworkr'] && data.applicable_rule.bitworkr !== 'any')) {
                    throw new Error('applicable_rule bitworkr is not compatible with the item args bitworkr');
                }
            }
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'nft',
                nftOptions: {
                    satsoutput: this.options.satsoutput
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
                verbose: true
            });
            // Set to request a container
            atomicalBuilder.setRequestItem(this.requestDmitem, parentContainerId);
            atomicalBuilder.setData({
                [expectedData['args']['main']]: fileBuf
            });
            // Attach any requested bitwork
            atomicalBuilder.setBitworkCommit(data.applicable_rule.bitworkc || expectedData['args']['bitworkc']);
            atomicalBuilder.setBitworkReveal(data.applicable_rule.bitworkr || expectedData['args']['bitworkr']);
            atomicalBuilder.setArgs(Object.assign({}, expectedData['args']));
            // The receiver output
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.options.satsoutput || 1000
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result,
            };
        });
    }
}
exports.MintInteractiveDitemCommand = MintInteractiveDitemCommand;
