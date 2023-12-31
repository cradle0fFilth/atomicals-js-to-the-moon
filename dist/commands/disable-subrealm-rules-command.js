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
exports.DisableSubrealmRulesInteractiveCommand = void 0;
const ecc = require("tiny-secp256k1");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const command_helpers_1 = require("./command-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
class DisableSubrealmRulesInteractiveCommand {
    constructor(electrumApi, options, atomicalId, funding, owner) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.atomicalId = atomicalId;
        this.funding = funding;
        this.owner = owner;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, command_helpers_1.logBanner)(`Disable Subrealm Minting Rules Interactive`);
            const { atomicalInfo, locationInfo, inputUtxoPartial } = yield (0, command_helpers_1.getAndCheckAtomicalInfo)(this.electrumApi, this.atomicalId, this.owner.address, 'NFT', null);
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.owner.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'mod',
                nftOptions: {
                    satsoutput: this.options.satsoutput
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            yield atomicalBuilder.setData({
                subrealms: true,
                $a: 1
            });
            // Just add some bitwork to make it use the funding address
            atomicalBuilder.setBitworkCommit('1');
            // Add the atomical to update
            atomicalBuilder.addInputUtxo(inputUtxoPartial, this.owner.WIF);
            // The receiver output
            atomicalBuilder.addOutput({
                address: this.owner.address,
                value: this.options.satsoutput || 1000
            });
            const result = yield atomicalBuilder.start(this.funding.WIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.DisableSubrealmRulesInteractiveCommand = DisableSubrealmRulesInteractiveCommand;
