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
exports.SplatInteractiveCommand = void 0;
const ecc = require("tiny-secp256k1");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const command_helpers_1 = require("./command-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const get_atomicals_at_location_command_1 = require("./get-atomicals-at-location-command");
const address_helpers_1 = require("../utils/address-helpers");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
class SplatInteractiveCommand {
    constructor(electrumApi, options, locationId, owner, funding) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.locationId = locationId;
        this.owner = owner;
        this.funding = funding;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, command_helpers_1.logBanner)(`Splat Interactive`);
            const command = new get_atomicals_at_location_command_1.GetAtomicalsAtLocationCommand(this.electrumApi, this.locationId);
            const response = yield command.run();
            if (!response || !response.success) {
                throw new Error(response);
            }
            const atomicals = response.data.atomicals;
            const atomicalNfts = atomicals.filter((item) => {
                return item.type === 'NFT';
            });
            if (atomicalNfts.length <= 1) {
                throw new Error('Multiple NFTs were not found at the same location. Nothing to skip split out.');
            }
            const hasFts = (0, atomical_format_helpers_1.hasAtomicalType)('FT', atomicals);
            if (hasFts) {
                throw new Error('Splat operation attempted for a location which contains non-NFT type atomicals. Detected FT type. Use Split operation first. Aborting...');
            }
            const inputUtxoPartial = (0, address_helpers_1.GetUtxoPartialFromLocation)(this.owner.address, response.data.location_info);
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.owner.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'x',
                splatOptions: {
                    satsoutput: this.options.satsoutput
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            // Add the owner of the atomicals at the location
            atomicalBuilder.addInputUtxo(inputUtxoPartial, this.owner.WIF);
            // ... and make sure to assign outputs to capture each atomical splatted out
            let amountSkipped = 0;
            atomicalBuilder.addOutput({
                address: inputUtxoPartial.address,
                value: inputUtxoPartial.witnessUtxo.value
            });
            if (this.options.bitworkc) {
                atomicalBuilder.setBitworkCommit(this.options.bitworkc);
            }
            amountSkipped += inputUtxoPartial.witnessUtxo.value;
            for (const nft of atomicalNfts) {
                // We do not actually need to know which atomical it is, just that we create an output for each
                // Make sure to make N outputs, for each atomical NFT
                atomicalBuilder.addOutput({
                    address: inputUtxoPartial.address,
                    value: this.options.satsoutput || 1000
                });
            }
            const result = yield atomicalBuilder.start(this.funding.WIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.SplatInteractiveCommand = SplatInteractiveCommand;
