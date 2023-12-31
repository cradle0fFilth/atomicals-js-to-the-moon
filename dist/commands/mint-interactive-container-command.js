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
exports.MintInteractiveContainerCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const get_by_container_command_1 = require("./get-by-container-command");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const command_helpers_1 = require("./command-helpers");
const address_keypair_path_1 = require("../utils/address-keypair-path");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class MintInteractiveContainerCommand {
    constructor(electrumApi, options, requestContainer, address, fundingWIF) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.requestContainer = requestContainer;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
        this.requestContainer = this.requestContainer.startsWith('#') ? this.requestContainer.substring(1) : this.requestContainer;
        (0, atomical_format_helpers_1.isValidBitworkMinimum)(this.options.bitworkc);
    }
    run() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the request already exists
            const getExistingNameCommand = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, this.requestContainer, command_interface_1.AtomicalsGetFetchType.GET, undefined);
            try {
                const getExistingNameResult = yield getExistingNameCommand.run();
                if (getExistingNameResult.success && getExistingNameResult.data) {
                    if (getExistingNameResult.data.result && getExistingNameResult.data.result.atomical_id || getExistingNameResult.data.candidates.length) {
                        throw 'Already exists with that name. Try a different name.';
                    }
                }
            }
            catch (err) {
                if (err.code !== 1) {
                    throw err; // Code 1 means call correctly returned that it was not found
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
            });
            // Set to request a container
            atomicalBuilder.setRequestContainer(this.requestContainer);
            // Attach a container request
            if (this.options.container)
                atomicalBuilder.setContainerMembership(this.options.container);
            // Attach any requested bitwork
            if (this.options.bitworkc) {
                atomicalBuilder.setBitworkCommit(this.options.bitworkc);
            }
            if (this.options.bitworkr) {
                atomicalBuilder.setBitworkReveal(this.options.bitworkr);
            }
            if (this.options.parent) {
                const { atomicalInfo, locationInfo, inputUtxoPartial } = yield (0, command_helpers_1.getAndCheckAtomicalInfo)(this.electrumApi, this.options.parent, (_a = this.options.parentOwner) === null || _a === void 0 ? void 0 : _a.address);
                const parentKeypairInput = ECPair.fromWIF((_b = this.options.parentOwner) === null || _b === void 0 ? void 0 : _b.WIF);
                const parentKeypairInputInfo = (0, address_keypair_path_1.getKeypairInfo)(parentKeypairInput);
                const inp = {
                    parentId: this.options.parent,
                    parentUtxoPartial: inputUtxoPartial,
                    parentKeyInfo: parentKeypairInputInfo
                };
                atomicalBuilder.setInputParent(inp);
            }
            if (this.options.parent) {
                atomicalBuilder.setInputParent(yield atomical_operation_builder_1.AtomicalOperationBuilder.resolveInputParent(this.electrumApi, this.options.parent, this.options.parentOwner));
            }
            // The receiver output of the mint
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.options.satsoutput
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.MintInteractiveContainerCommand = MintInteractiveContainerCommand;
