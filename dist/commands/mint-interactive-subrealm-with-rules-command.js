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
exports.MintInteractiveSubrealmWithRulesCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const command_helpers_1 = require("./command-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const get_by_realm_command_1 = require("./get-by-realm-command");
const address_helpers_1 = require("../utils/address-helpers");
const get_command_1 = require("./get-command");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class MintInteractiveSubrealmWithRulesCommand {
    constructor(electrumApi, requestSubrealm, nearestParentAtomicalId, address, fundingWIF, options) {
        this.electrumApi = electrumApi;
        this.requestSubrealm = requestSubrealm;
        this.nearestParentAtomicalId = nearestParentAtomicalId;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.options = options;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.requestSubrealm.indexOf('.') === -1) {
                throw 'Cannot mint for a top level Realm. Must be a name like +name.subname. Use the mint-realm command for a top level Realm';
            }
            const realmParts = this.requestSubrealm.split('.');
            const finalSubrealmPart = realmParts[realmParts.length - 1];
            // Step 1. Query the full realm and determine if it's already claimed
            const getSubrealmCommand = new get_by_realm_command_1.GetByRealmCommand(this.electrumApi, this.requestSubrealm, command_interface_1.AtomicalsGetFetchType.LOCATION, true);
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
                throw new Error(`Nearest parent realm is not the direct potential parent of the requested Subrealm. Try minting ${getSubrealmReponse.data.found_full_realm_name} first`);
            }
            const getNearestParentRealmCommand = new get_command_1.GetCommand(this.electrumApi, this.nearestParentAtomicalId, command_interface_1.AtomicalsGetFetchType.LOCATION);
            const getNearestParentRealmResponse = yield getNearestParentRealmCommand.run();
            if (getNearestParentRealmResponse.success && getNearestParentRealmResponse.data.atomical_id) {
                return {
                    success: false,
                    msg: 'Error retrieving nearest parent atomical ' + this.nearestParentAtomicalId,
                    data: getSubrealmReponse.data
                };
            }
            (0, command_helpers_1.logBanner)('HOW SUBREALM MINTING WORKS. WARNING: READ CAREFULLY!');
            console.log('IMPORTANT NOTE: At anytime you may review the complete active subrealm mint rules with the command: ');
            console.log(`% npm cli realm-info ${this.requestSubrealm}`);
            console.log('getSubrealmReponse', getSubrealmReponse);
            console.log(`*** We detected that the expected active rules list for the next block (${getSubrealmReponse.data.nearest_parent_realm_subrealm_mint_rules.current_height}) are: ***`);
            console.log(JSON.stringify(getSubrealmReponse.data.nearest_parent_realm_subrealm_mint_rules.current_height_rules, null, 2));
            let index = 0;
            let matchedAtLeastOneRule = false;
            if (!getSubrealmReponse.data.nearest_parent_realm_subrealm_mint_rules.current_height_rules ||
                !Object.keys(getSubrealmReponse.data.nearest_parent_realm_subrealm_mint_rules.current_height_rules).length) {
                throw new Error('The requested subrealm does not have any rules for the current height. Aborting...');
            }
            let bitworkc;
            let bitworkr;
            for (const price_point of getSubrealmReponse.data.nearest_parent_realm_subrealm_mint_rules.current_height_rules) {
                const regexRule = price_point.p;
                const outputRulesMap = price_point.o;
                bitworkc = price_point.bitworkc;
                bitworkr = price_point.bitworkr;
                const modifiedPattern = '^' + regexRule + '$';
                let regexPattern;
                try {
                    regexPattern = new RegExp(modifiedPattern);
                }
                catch (ex) {
                    // Technically that means a malformed payment *could* possibly be made and it would work.
                    // But it's probably not what either party intended. Therefore warn the user and bow out.
                    console.log('Realm rule regex is invalid. Contact the owner of the parent realm to tell them to fix it! Unable to continue. Aborting...');
                    throw ex;
                }
                if (regexPattern.test(finalSubrealmPart)) {
                    console.log(`The subrealm name of ${finalSubrealmPart} matches the rule entry at index ${index}:`);
                    console.log('---------------------------------------------------------------------------------------');
                    console.log('Pattern: ', modifiedPattern);
                    let outputNum = 0;
                    for (const propScript in outputRulesMap) {
                        if (!outputRulesMap.hasOwnProperty(propScript)) {
                            continue;
                        }
                        const priceRule = outputRulesMap[propScript]['v'];
                        const priceRuleTokenType = outputRulesMap[propScript]['id'];
                        if (priceRule < 0) {
                            throw new Error('Aborting minting because price is less than 0');
                        }
                        if (priceRule > 100000000) {
                            throw new Error('Aborting minting because price is greater than 1');
                        }
                        console.log('Rule entry: ', price_point);
                        if (isNaN(priceRule)) {
                            throw new Error('Price is not a valid number');
                        }
                        if (priceRuleTokenType && !(0, atomical_format_helpers_1.isAtomicalId)(priceRuleTokenType)) {
                            throw new Error('id parameter must be a compact atomical id: ' + priceRuleTokenType);
                        }
                        try {
                            const result = (0, address_helpers_1.detectScriptToAddressType)(propScript);
                            console.log('Detected payment address: ', result);
                            console.log('---------------------------------------------------------------------------------------');
                        }
                        catch (ex) {
                            // Technically that means a malformed payment *could* possibly be made and it would work.
                            // But it's probably not what either party intended. Therefore warn the user and bow out.
                            console.log('Realm rule output format is not a valid address script. Aborting...');
                            throw ex;
                        }
                        console.log('Payment Output #', outputNum);
                        console.log('Price (Satoshis): ', priceRule);
                        console.log('Price: ', priceRule / 100000000);
                        outputNum++;
                    }
                    if (bitworkr) {
                        console.log('Bitworkr required: ', bitworkr);
                    }
                    if (bitworkc) {
                        console.log('Bitworkc required: ', bitworkc);
                    }
                    matchedAtLeastOneRule = true;
                    break;
                }
                index++;
            }
            if (!matchedAtLeastOneRule) {
                throw new Error('The requested subrealm does not match any rule entry! Choose a different subrealm name. Aborting...');
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
            atomicalBuilder.setRequestSubrealm(this.requestSubrealm, this.nearestParentAtomicalId, atomical_operation_builder_1.REALM_CLAIM_TYPE.RULE);
            // Attach a container request
            if (this.options.container) {
                atomicalBuilder.setContainerMembership(this.options.container);
            }
            // Attach any requested bitwork
            if (bitworkc || this.options.bitworkc) {
                if (bitworkc === 'any') {
                    bitworkc = undefined;
                }
                atomicalBuilder.setBitworkCommit(bitworkc || this.options.bitworkc);
            }
            if (bitworkr || this.options.bitworkr) {
                if (bitworkr === 'any') {
                    bitworkr = undefined;
                }
                atomicalBuilder.setBitworkReveal(bitworkr || this.options.bitworkr);
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
exports.MintInteractiveSubrealmWithRulesCommand = MintInteractiveSubrealmWithRulesCommand;
