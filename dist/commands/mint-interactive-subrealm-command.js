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
exports.MintInteractiveSubrealmCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const address_helpers_1 = require("../utils/address-helpers");
const command_helpers_1 = require("./command-helpers");
const get_command_1 = require("./get-command");
const mint_interactive_subrealm_direct_command_1 = require("./mint-interactive-subrealm-direct-command");
const get_subrealm_info_command_1 = require("./get-subrealm-info-command");
const mint_interactive_subrealm_with_rules_command_1 = require("./mint-interactive-subrealm-with-rules-command");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class MintInteractiveSubrealmCommand {
    constructor(electrumApi, options, requestSubRealm, address, fundingWIF, owner) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.requestSubRealm = requestSubRealm;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.owner = owner;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
        this.requestSubRealm = this.requestSubRealm.startsWith('+') ? this.requestSubRealm.substring(1) : this.requestSubRealm;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.requestSubRealm.indexOf('.') === -1) {
                throw 'Cannot mint for a top level Realm. Must be a name like +name.subname. Use the mint-realm command for a top level Realm';
            }
            const realmParts = this.requestSubRealm.split('.');
            const finalSubrealmPart = realmParts[realmParts.length - 1];
            // Validate that the addresses are valid
            try {
                (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
                console.log("Initial mint address:", this.address);
            }
            catch (ex) {
                console.log('Error validating initial owner address');
                throw ex;
            }
            // Step 1. Query the full realm and determine if it's already claimed
            const getSubrealmCommand = new get_subrealm_info_command_1.GetRealmInfoCommand(this.electrumApi, this.requestSubRealm);
            const getSubrealmReponse = yield getSubrealmCommand.run();
            console.log('getSubrealmReponse', JSON.stringify(getSubrealmReponse.data, null, 2));
            if (getSubrealmReponse.data.atomical_id) {
                return {
                    success: false,
                    msg: 'Subrealm is already claimed. Choose another Subrealm',
                    data: getSubrealmReponse.data
                };
            }
            // Step 2. Check to make sure the only missing part is the requested subrealm itself
            if (getSubrealmReponse.data.missing_name_parts !== finalSubrealmPart) {
                return {
                    success: false,
                    msg: 'Subrealm cannot be minted because at least one other realm parent is missing. Mint that realm first if possible.',
                    data: getSubrealmReponse.data
                };
            }
            // Step 3. Check if the nearest parent is actually a parent realm that the current client already owns by fetching and comparing the address
            // at the location
            const nearestParentAtomicalId = getSubrealmReponse.data.nearest_parent_realm_atomical_id;
            const getNearestParentRealmCommand = new get_command_1.GetCommand(this.electrumApi, nearestParentAtomicalId, command_interface_1.AtomicalsGetFetchType.LOCATION);
            const getNearestParentRealmResponse = yield getNearestParentRealmCommand.run();
            if (getNearestParentRealmResponse.success && getNearestParentRealmResponse.data.atomical_id) {
                return {
                    success: false,
                    msg: 'Error retrieving nearest parent atomical ' + nearestParentAtomicalId,
                    data: getNearestParentRealmResponse.data
                };
            }
            // If it's owned by self, then we can mint directly provided that there is no other candidates
            if ((0, address_helpers_1.IsAtomicalOwnedByWalletRecord)(this.owner.address, getNearestParentRealmResponse.data.result)) {
                (0, command_helpers_1.logBanner)('DETECTED PARENT REALM IS OWNED BY SELF');
                const commandMintDirect = new mint_interactive_subrealm_direct_command_1.MintInteractiveSubrealmDirectCommand(this.electrumApi, this.requestSubRealm, nearestParentAtomicalId, this.address, this.fundingWIF, this.owner, this.options);
                const commandMintDirectResponse = yield commandMintDirect.run();
                if (commandMintDirectResponse.success) {
                    return {
                        success: true,
                        data: commandMintDirectResponse.data
                    };
                }
                else {
                    return {
                        success: false,
                        data: commandMintDirectResponse.data
                    };
                }
            }
            else {
                (0, command_helpers_1.logBanner)('DETECTED PARENT REALM IS NOT OWNED BY PROVIDED --OWNER WALLET');
                console.log('Proceeding to mint with the available subrealm minting rules (if available)...');
                const commandMintWithRules = new mint_interactive_subrealm_with_rules_command_1.MintInteractiveSubrealmWithRulesCommand(this.electrumApi, this.requestSubRealm, nearestParentAtomicalId, this.address, this.fundingWIF, this.options);
                const commandMintWithRulesResponse = yield commandMintWithRules.run();
                if (commandMintWithRulesResponse.success) {
                    return {
                        success: true,
                        data: commandMintWithRulesResponse.data
                    };
                }
                return {
                    success: false,
                    data: commandMintWithRulesResponse.data
                };
            }
        });
    }
}
exports.MintInteractiveSubrealmCommand = MintInteractiveSubrealmCommand;
