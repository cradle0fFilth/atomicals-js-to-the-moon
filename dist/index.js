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
exports.instance = exports.Atomicals = exports.bitcoin = exports.detectScriptToAddressType = exports.detectAddressTypeToScripthash = exports.createMnemonicPhrase = exports.isValidSubRealmName = exports.isValidRealmName = exports.hexifyObjectWithUtf8 = exports.buildAtomicalsFileMapFromRawTx = exports.createKeyPair = exports.getExtendTaprootAddressKeypairPath = exports.addressToP2PKH = exports.decorateAtomicals = exports.ElectrumApi = exports.ElectrumApiMock = void 0;
const bitcoin = require('bitcoinjs-lib');
exports.bitcoin = bitcoin;
const ecc = require("tiny-secp256k1");
bitcoin.initEccLib(ecc);
var electrum_api_mock_1 = require("./api/electrum-api-mock");
Object.defineProperty(exports, "ElectrumApiMock", { enumerable: true, get: function () { return electrum_api_mock_1.ElectrumApiMock; } });
const electrum_api_1 = require("./api/electrum-api");
var electrum_api_2 = require("./api/electrum-api");
Object.defineProperty(exports, "ElectrumApi", { enumerable: true, get: function () { return electrum_api_2.ElectrumApi; } });
const command_interface_1 = require("./commands/command.interface");
const wallet_create_command_1 = require("./commands/wallet-create-command");
const mint_interactive_nft_command_1 = require("./commands/mint-interactive-nft-command");
const wallet_init_command_1 = require("./commands/wallet-init-command");
const wallet_phrase_decode_command_1 = require("./commands/wallet-phrase-decode-command");
const server_version_command_1 = require("./commands/server-version-command");
const get_command_1 = require("./commands/get-command");
const list_command_1 = require("./commands/list-command");
const get_atomicals_address_command_1 = require("./commands/get-atomicals-address-command");
const get_utxos_1 = require("./commands/get-utxos");
const tx_command_1 = require("./commands/tx-command");
const get_atomicals_at_location_command_1 = require("./commands/get-atomicals-at-location-command");
const download_command_1 = require("./commands/download-command");
const address_info_command_1 = require("./commands/address-info-command");
const wallet_info_command_1 = require("./commands/wallet-info-command");
const transfer_interactive_nft_command_1 = require("./commands/transfer-interactive-nft-command");
const wallet_import_command_1 = require("./commands/wallet-import-command");
const address_history_command_1 = require("./commands/address-history-command");
const render_previews_command_1 = require("./commands/render-previews-command");
const set_interactive_command_1 = require("./commands/set-interactive-command");
const transfer_interactive_ft_command_1 = require("./commands/transfer-interactive-ft-command");
const transfer_interactive_utxos_command_1 = require("./commands/transfer-interactive-utxos-command");
const mint_interactive_ft_command_1 = require("./commands/mint-interactive-ft-command");
const get_by_realm_command_1 = require("./commands/get-by-realm-command");
const get_by_ticker_command_1 = require("./commands/get-by-ticker-command");
const get_by_container_command_1 = require("./commands/get-by-container-command");
const mint_interactive_realm_command_1 = require("./commands/mint-interactive-realm-command");
const mint_interactive_container_command_1 = require("./commands/mint-interactive-container-command");
const mint_interactive_dft_command_1 = require("./commands/mint-interactive-dft-command");
const init_interactive_dft_command_1 = require("./commands/init-interactive-dft-command");
const mint_interactive_subrealm_command_1 = require("./commands/mint-interactive-subrealm-command");
const resolve_command_1 = require("./commands/resolve-command");
const seal_interactive_command_1 = require("./commands/seal-interactive-command");
const get_subrealm_info_command_1 = require("./commands/get-subrealm-info-command");
const search_tickers_command_1 = require("./commands/search-tickers-command");
const search_containers_command_1 = require("./commands/search-containers-command");
const search_realms_command_1 = require("./commands/search-realms-command");
const summary_subrealms_command_1 = require("./commands/summary-subrealms-command");
const summary_containers_command_1 = require("./commands/summary-containers-command");
const summary_realms_command_1 = require("./commands/summary-realms-command");
const summary_tickers_command_1 = require("./commands/summary-tickers-command");
const pending_subrealms_command_1 = require("./commands/pending-subrealms-command");
const set_relation_interactive_command_1 = require("./commands/set-relation-interactive-command");
const mint_interactive_dat_command_1 = require("./commands/mint-interactive-dat-command");
const merge_interactive_utxos_1 = require("./commands/merge-interactive-utxos");
const splat_interactive_command_1 = require("./commands/splat-interactive-command");
const emit_interactive_command_1 = require("./commands/emit-interactive-command");
const delete_interactive_command_1 = require("./commands/delete-interactive-command");
const disable_subrealm_rules_command_1 = require("./commands/disable-subrealm-rules-command");
const enable_subrealm_rules_command_1 = require("./commands/enable-subrealm-rules-command");
const split_interactive_command_1 = require("./commands/split-interactive-command");
const get_global_command_1 = require("./commands/get-global-command");
const get_dft_info_command_1 = require("./commands/get-dft-info-command");
const broadcast_command_1 = require("./commands/broadcast-command");
const set_container_data_interactive_command_1 = require("./commands/set-container-data-interactive-command");
const get_container_items_command_1 = require("./commands/get-container-items-command");
const mint_interactive_ditem_command_1 = require("./commands/mint-interactive-ditem-command");
const set_container_dmint_interactive_command_1 = require("./commands/set-container-dmint-interactive-command");
const get_container_item_1 = require("./commands/get-container-item");
const get_container_item_validated_by_manifest_command_1 = require("./commands/get-container-item-validated-by-manifest-command");
const create_dmint_manifest_command_1 = require("./commands/create-dmint-manifest-command");
const create_dmint_command_1 = require("./commands/create-dmint-command");
const transfer_interactive_builder_command_1 = require("./commands/transfer-interactive-builder-command");
var atomical_format_helpers_1 = require("./utils/atomical-format-helpers");
Object.defineProperty(exports, "decorateAtomicals", { enumerable: true, get: function () { return atomical_format_helpers_1.decorateAtomicals; } });
var address_helpers_1 = require("./utils/address-helpers");
Object.defineProperty(exports, "addressToP2PKH", { enumerable: true, get: function () { return address_helpers_1.addressToP2PKH; } });
var address_keypair_path_1 = require("./utils/address-keypair-path");
Object.defineProperty(exports, "getExtendTaprootAddressKeypairPath", { enumerable: true, get: function () { return address_keypair_path_1.getExtendTaprootAddressKeypairPath; } });
var create_key_pair_1 = require("./utils/create-key-pair");
Object.defineProperty(exports, "createKeyPair", { enumerable: true, get: function () { return create_key_pair_1.createKeyPair; } });
var atomical_format_helpers_2 = require("./utils/atomical-format-helpers");
Object.defineProperty(exports, "buildAtomicalsFileMapFromRawTx", { enumerable: true, get: function () { return atomical_format_helpers_2.buildAtomicalsFileMapFromRawTx; } });
Object.defineProperty(exports, "hexifyObjectWithUtf8", { enumerable: true, get: function () { return atomical_format_helpers_2.hexifyObjectWithUtf8; } });
Object.defineProperty(exports, "isValidRealmName", { enumerable: true, get: function () { return atomical_format_helpers_2.isValidRealmName; } });
Object.defineProperty(exports, "isValidSubRealmName", { enumerable: true, get: function () { return atomical_format_helpers_2.isValidSubRealmName; } });
var create_mnemonic_phrase_1 = require("./utils/create-mnemonic-phrase");
Object.defineProperty(exports, "createMnemonicPhrase", { enumerable: true, get: function () { return create_mnemonic_phrase_1.createMnemonicPhrase; } });
var address_helpers_2 = require("./utils/address-helpers");
Object.defineProperty(exports, "detectAddressTypeToScripthash", { enumerable: true, get: function () { return address_helpers_2.detectAddressTypeToScripthash; } });
Object.defineProperty(exports, "detectScriptToAddressType", { enumerable: true, get: function () { return address_helpers_2.detectScriptToAddressType; } });
class Atomicals {
    constructor(electrumApi) {
        this.electrumApi = electrumApi;
    }
    static createDmintItemManifests(folderName, output) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new create_dmint_manifest_command_1.CreateDmintItemManifestsCommand(folderName, output);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static createDmint(folderName, mintHeight, bitworkc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new create_dmint_command_1.CreateDmintCommand(folderName, mintHeight, bitworkc);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static renderPreviews(filesmap, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new render_previews_command_1.RenderPreviewsCommand(filesmap, body);
                return command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static walletCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new wallet_create_command_1.WalletCreateCommand();
                return command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static isObject(p) {
        if (typeof p === 'object' &&
            !Array.isArray(p) &&
            p !== null) {
            return true;
        }
        return false;
    }
    static encodeX(fileContents, updatedObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Atomicals.isObject(fileContents)) {
                return;
            }
            const updatedtotal = [];
            const concise = [];
            const traitsArray = [
                {
                    "trait": "design",
                    "type": "string",
                    "values": [
                        "Portal Prologue",
                        "La Vista",
                        "X Essence"
                    ]
                },
                {
                    "trait": "color",
                    "type": "string",
                    "values": [
                        "Azure Crimson",
                        "Monochrome Elegance",
                        "Blush Velvet Bliss",
                        "Atomicals Nature Illusion",
                        "Golden Satoshi Luster",
                    ]
                }
            ];
            function findIndexInMap(index, itemValue) {
                for (let i = 0; i < traitsArray[index].values.length; i++) {
                    if (itemValue === traitsArray[index].values[i]) {
                        return i;
                    }
                }
            }
            for (const prop in fileContents) {
                if (!fileContents.hasOwnProperty(prop)) {
                    continue;
                }
                const obj = {
                    id: fileContents[prop]['id'],
                    n: fileContents[prop]['n']
                };
                const attrs = [];
                let attributeIndex = 0;
                for (const item of fileContents[prop]['a']) {
                    attrs.push(findIndexInMap(attributeIndex, item['v']));
                    attributeIndex++;
                }
                obj['a'] = attrs;
                updatedtotal[prop] = obj;
            }
            const resulting = {
                "traits": traitsArray,
                items: Object.assign({}, updatedtotal)
            };
            return resulting;
        });
    }
    static walletImport(wif, alias) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new wallet_import_command_1.WalletImportCommand(wif, alias);
                return command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static walletPhraseDecode(phrase, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new wallet_phrase_decode_command_1.WalletPhraseDecodeCommand(phrase, path);
                return command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    static walletInit(phrase, path, n) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new wallet_init_command_1.WalletInitCommand(phrase, path, n);
                return command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
        });
    }
    serverVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new server_version_command_1.ServerVersionCommand(this.electrumApi);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintDatInteractive(options, filepath, givenFileName, address, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_dat_command_1.MintInteractiveDatCommand(this.electrumApi, options, filepath, givenFileName, address, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintNftInteractive(options, files, address, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_nft_command_1.MintInteractiveNftCommand(this.electrumApi, options, files, address, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintRealmInteractive(options, requestRealm, address, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_realm_command_1.MintInteractiveRealmCommand(this.electrumApi, options, requestRealm, address, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintSubrealmInteractive(options, requestSubRealm, address, WIF, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_subrealm_command_1.MintInteractiveSubrealmCommand(this.electrumApi, options, requestSubRealm, address, WIF, owner);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintContainerItemInteractive(options, container, itemId, manifestFile, address, WIF, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_ditem_command_1.MintInteractiveDitemCommand(this.electrumApi, options, container, itemId, manifestFile, address, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintContainerInteractive(options, requestContainer, address, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_container_command_1.MintInteractiveContainerCommand(this.electrumApi, options, requestContainer, address, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    stack: error.stack,
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintFtInteractive(options, file, supply, address, requestTicker, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_ft_command_1.MintInteractiveFtCommand(this.electrumApi, options, file, supply, address, requestTicker, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mintDftInteractive(options, address, ticker, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new mint_interactive_dft_command_1.MintInteractiveDftCommand(this.electrumApi, options, address, ticker, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    initDftInteractive(options, file, address, requestTicker, mintAmount, maxMints, mintHeight, mintBitworkc, mintBitworkr, WIF) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new init_interactive_dft_command_1.InitInteractiveDftCommand(this.electrumApi, options, file, address, requestTicker, mintAmount, maxMints, mintHeight, mintBitworkc, mintBitworkr, WIF);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    disableSubrealmRules(options, realmOrSubrealm, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new disable_subrealm_rules_command_1.DisableSubrealmRulesInteractiveCommand(this.electrumApi, options, realmOrSubrealm, funding, atomicalOwner);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    enableSubrealmRules(options, realmOrSubrealm, file, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new enable_subrealm_rules_command_1.EnableSubrealmRulesCommand(this.electrumApi, options, realmOrSubrealm, file, funding, atomicalOwner);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    setRelationInteractive(options, atomicalId, relationName, values, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new set_relation_interactive_command_1.SetRelationInteractiveCommand(this.electrumApi, options, atomicalId, relationName, values, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    splatInteractive(options, atomicalId, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new splat_interactive_command_1.SplatInteractiveCommand(this.electrumApi, options, atomicalId, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    splitItneractive(options, atomicalId, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new split_interactive_command_1.SplitInteractiveCommand(this.electrumApi, options, atomicalId, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    emitInteractive(options, atomicalId, files, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new emit_interactive_command_1.EmitInteractiveCommand(this.electrumApi, options, atomicalId, files, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    setInteractive(options, atomicalId, filename, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new set_interactive_command_1.SetInteractiveCommand(this.electrumApi, options, atomicalId, filename, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    setContainerDataInteractive(options, containerName, filename, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new set_container_data_interactive_command_1.SetContainerDataInteractiveCommand(this.electrumApi, options, containerName, filename, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    setContainerDmintInteractive(options, containerName, filename, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new set_container_dmint_interactive_command_1.SetContainerDmintInteractiveCommand(this.electrumApi, options, containerName, filename, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    deleteInteractive(options, atomicalId, filesToDelete, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new delete_interactive_command_1.DeleteInteractiveCommand(this.electrumApi, options, atomicalId, filesToDelete, funding, atomicalOwner);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    sealInteractive(options, atomicalId, funding, atomicalOwner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new seal_interactive_command_1.SealInteractiveCommand(this.electrumApi, options, atomicalId, atomicalOwner, funding);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    transferInteractiveNft(options, atomicalId, owner, funding, receiveAddress, satsbyte, satsoutput) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new transfer_interactive_nft_command_1.TransferInteractiveNftCommand(this.electrumApi, options, atomicalId, owner.WIF, receiveAddress, funding.WIF, satsbyte, satsoutput);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    transferInteractiveFt(options, atomicalId, owner, funding, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new transfer_interactive_ft_command_1.TransferInteractiveFtCommand(this.electrumApi, options, atomicalId, owner.WIF, funding.WIF, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    transferInteractiveBuilder(options, owner, funding, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt, atomicalIdReceiptType, forceSkipValidation = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new transfer_interactive_builder_command_1.TransferInteractiveBuilderCommand(this.electrumApi, options, owner.WIF, funding.WIF, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt, atomicalIdReceiptType, forceSkipValidation);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    transferInteractiveUtxos(options, owner, funding, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new transfer_interactive_utxos_command_1.TransferInteractiveUtxosCommand(this.electrumApi, options, owner.WIF, funding.WIF, validatedWalletInfo, satsbyte, nofunding, atomicalIdReceipt);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    global(hashes = 10, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_global_command_1.GetGlobalCommand(this.electrumApi, hashes);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    dump(keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                let response = yield this.electrumApi.dump();
                return response;
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    resolveAtomical(atomicalIdOrNumberOrVariousName, atomicalsGetFetchType, verbose = false, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new resolve_command_1.ResolveCommand(this.electrumApi, atomicalIdOrNumberOrVariousName, atomicalsGetFetchType, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getRealmInfo(atomicalIdOrNumberOrVariousName, verbose = false, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_subrealm_info_command_1.GetRealmInfoCommand(this.electrumApi, atomicalIdOrNumberOrVariousName, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomical(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalFtInfo(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_dft_info_command_1.GetFtInfoCommand(this.electrumApi, atomicalAliasOrId);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalLocation(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.LOCATION);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalState(atomicalAliasOrId, verbose = false, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.STATE, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalStateHistory(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.STATE_HISTORY);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalEventHistory(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.EVENT_HISTORY);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalHistory(atomicalAliasOrId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_command_1.GetCommand(this.electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.TX_HISTORY);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    searchTickers(prefix, asc = true, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new search_tickers_command_1.SearchTickersCommand(this.electrumApi, prefix, asc);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    searchContainers(prefix, asc = true, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new search_containers_command_1.SearchContainersCommand(this.electrumApi, prefix, asc);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    searchRealms(prefix, asc = true, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new search_realms_command_1.SearchRealmsCommand(this.electrumApi, prefix, asc);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalByRealm(realm, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_by_realm_command_1.GetByRealmCommand(this.electrumApi, realm);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalByTicker(ticker, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_by_ticker_command_1.GetByTickerCommand(this.electrumApi, ticker);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalByContainer(container, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, container);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getContainerItems(container, limit, offset, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_container_items_command_1.GetContainerItems(this.electrumApi, container, limit, offset);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalByContainerItem(container, itemId, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_container_item_1.GetContainerItemCommand(this.electrumApi, container, itemId);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getAtomicalByContainerItemValidated(container, itemId, manifestFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_container_item_validated_by_manifest_command_1.GetContainerItemValidatedByManifestCommand(this.electrumApi, container, itemId, manifestFile);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    addressInfo(address, verbose) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new address_info_command_1.AddressInfoCommand(this.electrumApi, address, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    pendingSubrealms(options, address, funding, satsbyte, display = false, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new pending_subrealms_command_1.PendingSubrealmsCommand(this.electrumApi, options, address, funding.WIF, satsbyte, display);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    summarySubrealms(address, filter, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new summary_subrealms_command_1.SummarySubrealmsCommand(this.electrumApi, address, filter);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    summaryContainers(address, filter, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new summary_containers_command_1.SummaryContainersCommand(this.electrumApi, address, filter);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    summaryRealms(address, filter, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new summary_realms_command_1.SummaryRealmsCommand(this.electrumApi, address, filter);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    summaryTickers(address, filter, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new summary_tickers_command_1.SummaryTickersCommand(this.electrumApi, address, filter);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    walletInfo(address, verbose, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new wallet_info_command_1.WalletInfoCommand(this.electrumApi, address, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    list(offset, limit, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new list_command_1.ListCommand(this.electrumApi, offset, limit, asc);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    getUtxos(address, keepElectrumAlive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_utxos_1.GetUtxosCommand(this.electrumApi, address);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                if (!keepElectrumAlive) {
                    this.electrumApi.close();
                }
            }
        });
    }
    getHistory(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new address_history_command_1.AddressHistoryCommand(this.electrumApi, address);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    getAtomicals(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_atomicals_address_command_1.GetAtomicalsAddressCommand(this.electrumApi, address);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    getTx(txid, verbose) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new tx_command_1.TxCommand(this.electrumApi, txid, verbose);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    download(locationIdOrTxId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new download_command_1.DownloadCommand(this.electrumApi, locationIdOrTxId);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    broadcast(rawtx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new broadcast_command_1.BroadcastCommand(this.electrumApi, rawtx);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    getAtomicalsAtLocation(location) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new get_atomicals_at_location_command_1.GetAtomicalsAtLocationCommand(this.electrumApi, location);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
    mergeInteractiveUtxos(options, owner, funding, validatedWalletInfo, satsbyte) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.electrumApi.open();
                const command = new merge_interactive_utxos_1.MergeInteractiveUtxosCommand(this.electrumApi, options, owner.WIF, funding.WIF, validatedWalletInfo, satsbyte);
                return yield command.run();
            }
            catch (error) {
                return {
                    success: false,
                    message: error.toString(),
                    error
                };
            }
            finally {
                this.electrumApi.close();
            }
        });
    }
}
exports.Atomicals = Atomicals;
function instance(config, electrumUrl) {
    return new Atomicals(electrum_api_1.ElectrumApi.createClient(electrumUrl));
}
exports.instance = instance;
try {
    // Running under node, we are in command line mode
    if (typeof window !== 'undefined') {
        // otherwise we are being used as a kind of library
        window['atomicals'] = {
            instance: instance
        };
    }
}
catch (ex) {
    // Window is not defined, must be running in windowless node env...
    console.log("atomicals window object not found. Skipping initialization on window object");
}
