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
exports.WalletImportCommand = void 0;
const create_key_pair_1 = require("../utils/create-key-pair");
const file_utils_1 = require("../utils/file-utils");
const bitcoin = require('bitcoinjs-lib');
const ecpair_1 = require("ecpair");
const ecc = require("tiny-secp256k1");
const wallet_path_resolver_1 = require("../utils/wallet-path-resolver");
const command_helpers_1 = require("./command-helpers");
bitcoin.initEccLib(ecc);
const ECPair = (0, ecpair_1.default)(ecc);
const walletPath = (0, wallet_path_resolver_1.walletPathResolver)();
class WalletImportCommand {
    constructor(wif, alias) {
        this.wif = wif;
        this.alias = alias;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.walletExists())) {
                throw "wallet.json does NOT exist, please create one first with wallet-init";
            }
            const walletFileData = (yield (0, file_utils_1.jsonFileReader)(walletPath));
            if (!walletFileData.imported) {
                walletFileData.imported = {};
            }
            if (walletFileData.imported.hasOwnProperty(this.alias)) {
                throw `Wallet alias ${this.alias} already exists!`;
            }
            // Just make a backup for now to be safe
            yield (0, file_utils_1.jsonFileWriter)(walletPath + '.' + (new Date()).getTime() + '.walletbackup', walletFileData);
            // Get the wif and the address and ensure they match
            const importedKeypair = ECPair.fromWIF(this.wif);
            const { address, output } = bitcoin.payments.p2tr({
                internalPubkey: (0, create_key_pair_1.toXOnly)(importedKeypair.publicKey),
                network: command_helpers_1.NETWORK
            });
            const walletImportedField = Object.assign({}, walletFileData.imported, {
                [this.alias]: {
                    address,
                    WIF: this.wif
                }
            });
            walletFileData['imported'] = walletImportedField;
            yield (0, file_utils_1.jsonFileWriter)(walletPath, walletFileData);
            return {
                success: true,
                data: {
                    address,
                    alias: this.alias
                }
            };
        });
    }
    walletExists() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield (0, file_utils_1.jsonFileExists)(walletPath)) {
                return true;
            }
        });
    }
}
exports.WalletImportCommand = WalletImportCommand;
