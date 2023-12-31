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
exports.WalletInitCommand = void 0;
const create_key_pair_1 = require("../utils/create-key-pair");
const file_utils_1 = require("../utils/file-utils");
const wallet_path_resolver_1 = require("../utils/wallet-path-resolver");
const fs = require("fs");
const walletPath = (0, wallet_path_resolver_1.walletPathResolver)();
class WalletInitCommand {
    constructor(phrase, path, n) {
        this.phrase = phrase;
        this.path = path;
        this.n = n;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.walletExists()) {
                throw "wallet.json exists, please remove it first to initialize another wallet. You may also use 'wallet-create' command to generate a new wallet.";
            }
            const { wallet, imported } = yield (0, create_key_pair_1.createPrimaryAndFundingImportedKeyPairs)(this.phrase, this.path, this.n);
            const walletDir = `wallets/`;
            if (!fs.existsSync(walletDir)) {
                fs.mkdirSync(walletDir);
            }
            const created = {
                phrase: wallet.phrase,
                primary: {
                    address: wallet.primary.address,
                    path: wallet.primary.path,
                    WIF: wallet.primary.WIF
                },
                funding: {
                    address: wallet.funding.address,
                    path: wallet.funding.path,
                    WIF: wallet.funding.WIF
                },
                imported
            };
            yield (0, file_utils_1.jsonFileWriter)(walletPath, created);
            return {
                success: true,
                data: created
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
exports.WalletInitCommand = WalletInitCommand;
