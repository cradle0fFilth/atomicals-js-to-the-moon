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
exports.MintInteractiveSubrealmDirectCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const address_helpers_1 = require("../utils/address-helpers");
const get_subrealm_info_command_1 = require("./get-subrealm-info-command");
const get_command_1 = require("./get-command");
const prompt_helpers_1 = require("../utils/prompt-helpers");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
/**
 * Mints a subrealm with the assumption that the `owner` wallet owns the parent atomical
 */
class MintInteractiveSubrealmDirectCommand {
    constructor(electrumApi, requestSubrealm, nearestParentAtomicalId, address, fundingWIF, owner, options) {
        this.electrumApi = electrumApi;
        this.requestSubrealm = requestSubrealm;
        this.nearestParentAtomicalId = nearestParentAtomicalId;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.owner = owner;
        this.options = options;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.requestSubrealm.indexOf('.') === -1) {
                throw 'Cannot mint for a top level Realm. Must be a name like +name.subname. Use the mint-realm command for a top level Realm';
            }
            // Step 1. Query the full realm and determine if it's already claimed
            const getSubrealmCommand = new get_subrealm_info_command_1.GetRealmInfoCommand(this.electrumApi, this.requestSubrealm);
            const getSubrealmReponse = yield getSubrealmCommand.run();
            if (getSubrealmReponse.data.atomical_id) {
                return {
                    success: false,
                    msg: 'Subrealm is already claimed. Choose another Subrealm',
                    data: getSubrealmReponse.data
                };
            }
            const finalSubrealmSplit = this.requestSubrealm.split('.');
            const finalSubrealm = finalSubrealmSplit[finalSubrealmSplit.length - 1];
            if (!getSubrealmReponse.data.nearest_parent_realm_atomical_id) {
                throw new Error('Nearest parent realm id is not set');
            }
            if (getSubrealmReponse.data.missing_name_parts !== finalSubrealm) {
                throw new Error(`Nearest parent realm is not the direct potential parent of the requested Subrealm. Try minting the parents first first`);
            }
            const candidates = getSubrealmReponse.data.candidates;
            if (candidates.length) {
                yield (0, prompt_helpers_1.warnContinueAbort)('Candidate Subrealm exists already. There is no guarantee you will win the subrealm. Continue anyways (y/n)?', 'y');
            }
            const getNearestParentRealmCommand = new get_command_1.GetCommand(this.electrumApi, this.nearestParentAtomicalId, command_interface_1.AtomicalsGetFetchType.LOCATION);
            const getNearestParentRealmResponse = yield getNearestParentRealmCommand.run();
            if (getNearestParentRealmResponse.success && getNearestParentRealmResponse.data.atomical_id) {
                return {
                    success: false,
                    msg: 'Error retrieving nearest parent atomical ' + this.nearestParentAtomicalId,
                    data: getNearestParentRealmResponse.data
                };
            }
            // If it's owned by self, then we can mint directly provided that there is no other candidates
            const utxoLocation = (0, address_helpers_1.IsAtomicalOwnedByWalletRecord)(this.owner.address, getNearestParentRealmResponse.data.result);
            if (!utxoLocation) {
                throw new Error('Parent realm is not owned by self');
            }
            if (this.nearestParentAtomicalId !== getNearestParentRealmResponse.data.result.atomical_id) {
                throw new Error('Provided parent id does not match the current location of the parent realm');
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
            // For direct mints we must spent the parent realm atomical in the same transaction
            atomicalBuilder.addInputUtxo(utxoLocation, this.owner.WIF);
            // The first output will be the location of the subrealm minted
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.options.satsoutput,
            });
            // ... and make sure to assign an output to capture the spent parent realm atomical
            atomicalBuilder.addOutput({
                address: utxoLocation.address,
                value: utxoLocation.witnessUtxo.value
            });
            // Set to request a container
            atomicalBuilder.setRequestSubrealm(this.requestSubrealm, this.nearestParentAtomicalId, atomical_operation_builder_1.REALM_CLAIM_TYPE.DIRECT);
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
            // The receiver output
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.options.satsoutput || 1000
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.MintInteractiveSubrealmDirectCommand = MintInteractiveSubrealmDirectCommand;
