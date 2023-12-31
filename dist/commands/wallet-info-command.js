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
exports.WalletInfoCommand = void 0;
const address_helpers_1 = require("../utils/address-helpers");
class WalletInfoCommand {
    constructor(electrumApi, address, verbose) {
        this.electrumApi = electrumApi;
        this.address = address;
        this.verbose = verbose;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
            let res = yield this.electrumApi.atomicalsByScripthash(scripthash, true);
            let history = undefined;
            if (this.verbose) {
                history = yield this.electrumApi.history(scripthash);
            }
            const plainUtxos = [];
            let total_confirmed = 0;
            let total_unconfirmed = 0;
            let regular_confirmed = 0;
            let regular_unconfirmed = 0;
            let atomicals_confirmed = 0;
            let atomicals_unconfirmed = 0;
            const atomicalsUtxos = [];
            for (const utxo of res.utxos) {
                if (utxo.height <= 0) {
                    total_unconfirmed += utxo.value;
                }
                else {
                    total_confirmed += utxo.value;
                }
                if (utxo.atomicals && utxo.atomicals.length) {
                    if (utxo.height <= 0) {
                        atomicals_unconfirmed += utxo.value;
                    }
                    else {
                        atomicals_confirmed += utxo.value;
                    }
                    atomicalsUtxos.push(utxo);
                    continue;
                }
                if (utxo.height <= 0) {
                    regular_unconfirmed += utxo.value;
                }
                else {
                    regular_confirmed += utxo.value;
                }
                plainUtxos.push(utxo);
            }
            return {
                success: true,
                data: {
                    address: this.address,
                    scripthash: scripthash,
                    atomicals_count: Object.keys(res.atomicals).length,
                    atomicals_utxos: atomicalsUtxos,
                    atomicals_balances: res.atomicals,
                    total_confirmed,
                    total_unconfirmed,
                    atomicals_confirmed,
                    atomicals_unconfirmed,
                    regular_confirmed,
                    regular_unconfirmed,
                    regular_utxos: plainUtxos,
                    regular_utxo_count: plainUtxos.length,
                    history
                }
            };
        });
    }
}
exports.WalletInfoCommand = WalletInfoCommand;
