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
exports.AddressInfoCommand = void 0;
const address_helpers_1 = require("../utils/address-helpers");
class AddressInfoCommand {
    constructor(electrumApi, address, verbose) {
        this.electrumApi = electrumApi;
        this.address = address;
        this.verbose = verbose;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
            const balanceInfo = yield this.electrumApi.getUnspentScripthash(scripthash);
            const res = yield this.electrumApi.atomicalsByScripthash(scripthash);
            let history = undefined;
            if (this.verbose) {
                history = yield this.electrumApi.history(scripthash);
            }
            // Filter out the utxos that contain atomicals for display the atomicals section
            const filteredAtomicalsUtxos = [];
            const nonAtomicalsBalanceInfoUtxos = [];
            let nonAtomicalsBalanceInfoConfirmed = 0;
            let nonAtomicalsBalanceInfoUnconfirmed = 0;
            for (const utxo of res.utxos) {
                if (utxo.atomicals && utxo.atomicals.length) {
                    filteredAtomicalsUtxos.push({
                        txid: utxo.txid,
                        index: utxo.index,
                        value: utxo.value,
                        height: utxo.height,
                        atomicals: utxo.atomicals,
                    });
                }
                else if (!utxo.atomicals || !utxo.atomicals.length) {
                    nonAtomicalsBalanceInfoUtxos.push({
                        txid: utxo.txid,
                        index: utxo.index,
                        value: utxo.value,
                        height: utxo.height
                    });
                    if (utxo.height && utxo.height > 0) {
                        nonAtomicalsBalanceInfoConfirmed += utxo.value;
                    }
                    else {
                        nonAtomicalsBalanceInfoUnconfirmed += utxo.value;
                    }
                }
            }
            return {
                success: true,
                data: {
                    address: this.address,
                    scripthash: scripthash,
                    atomicals: {
                        count: Object.keys(res.atomicals).length,
                        balances: res.atomicals,
                        utxos: filteredAtomicalsUtxos,
                    },
                    globalBalanceInfo: {
                        unconfirmed: balanceInfo.unconfirmed,
                        confirmed: balanceInfo.confirmed,
                        utxos: balanceInfo.utxos
                    },
                    nonAtomicalsBalanceInfo: {
                        unconfirmed: nonAtomicalsBalanceInfoUnconfirmed,
                        confirmed: nonAtomicalsBalanceInfoConfirmed,
                        utxos: nonAtomicalsBalanceInfoUtxos
                    },
                    history
                }
            };
        });
    }
}
exports.AddressInfoCommand = AddressInfoCommand;
