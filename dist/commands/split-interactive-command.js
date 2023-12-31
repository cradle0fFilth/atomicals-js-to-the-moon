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
exports.SplitInteractiveCommand = void 0;
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
class SplitInteractiveCommand {
    constructor(electrumApi, options, locationId, owner, funding) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.locationId = locationId;
        this.owner = owner;
        this.funding = funding;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, command_helpers_1.logBanner)(`Split FTs Interactive`);
            const command = new get_atomicals_at_location_command_1.GetAtomicalsAtLocationCommand(this.electrumApi, this.locationId);
            const response = yield command.run();
            if (!response || !response.success) {
                throw new Error(response);
            }
            const atomicals = response.data.atomicals;
            const atomicalFts = atomicals.filter((item) => {
                return item.type === 'FT';
            });
            console.log('Found multiple FTs at the same location: ', atomicalFts);
            const hasNfts = (0, atomical_format_helpers_1.hasAtomicalType)('NFT', atomicals);
            if (hasNfts) {
                console.log('Found at least one NFT at the same location. The first output will contain the NFTs, and the second output, etc will contain the FTs split out. After you may use the splat command to separate multiple NFTs if they exist at the same location.');
            }
            if (!hasNfts && atomicalFts.length <= 1) {
                throw new Error('Multiple FTs were not found at the same location. Nothing to skip split.');
            }
            const inputUtxoPartial = (0, address_helpers_1.GetUtxoPartialFromLocation)(this.owner.address, response.data.location_info);
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.owner.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'y',
                skipOptions: {},
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            // Add the owner of the atomicals at the location
            atomicalBuilder.addInputUtxo(inputUtxoPartial, this.owner.WIF);
            // ... and make sure to assign outputs to capture each atomical split
            const ftsToSplit = {};
            let amountSkipped = 0;
            if (hasNfts) {
                atomicalBuilder.addOutput({
                    address: inputUtxoPartial.address,
                    value: inputUtxoPartial.witnessUtxo.value
                });
                amountSkipped += inputUtxoPartial.witnessUtxo.value;
            }
            if (isNaN(amountSkipped)) {
                throw new Error('Critical error amountSkipped isNaN');
            }
            for (const ft of atomicalFts) {
                if (!ft.atomical_id) {
                    throw new Error('Critical error atomical_id not set for FT');
                }
                if (!(0, atomical_format_helpers_1.isAtomicalId)(ft.atomical_id)) {
                    throw new Error('Critical error atomical_id is not valid for FT');
                }
                // Make sure to make N outputs, for each atomical NFT
                ftsToSplit[ft.atomical_id] = amountSkipped;
                atomicalBuilder.addOutput({
                    address: inputUtxoPartial.address,
                    value: inputUtxoPartial.witnessUtxo.value
                });
                // Add the amount to skip for the next FT
                amountSkipped += inputUtxoPartial.witnessUtxo.value;
                if (isNaN(amountSkipped)) {
                    throw new Error('Critical error amountSkipped isNaN');
                }
            }
            yield atomicalBuilder.setData(ftsToSplit);
            const result = yield atomicalBuilder.start(this.funding.WIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.SplitInteractiveCommand = SplitInteractiveCommand;
