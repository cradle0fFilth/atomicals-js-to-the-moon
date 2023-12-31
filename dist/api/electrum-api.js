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
exports.ElectrumApi = void 0;
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
const axios_1 = require("axios");
const address_helpers_1 = require("../utils/address-helpers");
class ElectrumApi {
    constructor(baseUrl, usePost = true) {
        this.baseUrl = baseUrl;
        this.usePost = usePost;
        this.isOpenFlag = false;
        this.resetConnection();
    }
    resetConnection() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static createClient(url, usePost = true) {
        return new ElectrumApi(url, usePost);
    }
    open() {
        return new Promise((resolve) => {
            if (this.isOpenFlag) {
                resolve(true);
                return;
            }
            resolve(true);
        });
    }
    isOpen() {
        return this.isOpenFlag;
    }
    close() {
        return Promise.resolve(true);
    }
    call(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response;
                if (this.usePost) {
                    response = yield axios_1.default.post(`${this.baseUrl}/${method}`, { params });
                }
                else {
                    response = yield axios_1.default.get(`${this.baseUrl}/${method}?params=${JSON.stringify(params)}`);
                }
                return response.data.response;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    sendTransaction(signedRawTx) {
        return this.broadcast(signedRawTx);
    }
    getTx(txId, verbose = false) {
        return new Promise((resolve, reject) => {
            this.call('blockchain.transaction.get', [txId, verbose ? 1 : 0]).then((result) => {
                resolve({ success: true, tx: result });
            }).catch((error) => reject(error));
        });
    }
    getUnspentAddress(address) {
        const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(address);
        return this.getUnspentScripthash(scripthash);
    }
    getUnspentScripthash(scriptHash) {
        return new Promise((resolve, reject) => {
            this.call('blockchain.scripthash.listunspent', [scriptHash]).then(function (result) {
                const data = { unconfirmed: 0, confirmed: 0, utxos: [] };
                for (const utxo of result) {
                    if (!utxo.height || utxo.height <= 0) {
                        data.unconfirmed += utxo.value;
                    }
                    else {
                        data.confirmed += utxo.value;
                    }
                    // data.balance += utxo.value;
                    data.utxos.push({
                        txid: utxo.tx_hash,
                        txId: utxo.tx_hash,
                        // height: utxo.height,
                        outputIndex: utxo.tx_pos,
                        index: utxo.tx_pos,
                        vout: utxo.tx_pos,
                        value: utxo.value,
                        atomicals: utxo.atomicals,
                        // script: addressToP2PKH(address)
                    });
                }
                resolve(data);
            }).catch((error) => reject(error));
        });
    }
    waitUntilUTXO(address, satoshis, intervalSeconds = 10, exactSatoshiAmount = false) {
        return __awaiter(this, void 0, void 0, function* () {
            function hasAttachedAtomicals(utxo) {
                if (utxo && utxo.atomicals && utxo.atomicals.length) {
                    return true;
                }
                return utxo && utxo.height <= 0;
            }
            return new Promise((resolve, reject) => {
                let intervalId;
                const checkForUtxo = () => __awaiter(this, void 0, void 0, function* () {
                    console.log('...');
                    try {
                        const response = yield this.getUnspentAddress(address).catch((e) => {
                            console.error(e);
                            return { unconfirmed: 0, confirmed: 0, utxos: [] };
                        });
                        const utxos = response.utxos.sort((a, b) => a.value - b.value);
                        for (const utxo of utxos) {
                            // Do not use utxos that have attached atomicals
                            if (hasAttachedAtomicals(utxo)) {
                                continue;
                            }
                            // If the exact amount was requested, then only return if the exact amount is found
                            if (exactSatoshiAmount) {
                                if (utxo.value === satoshis) {
                                    clearInterval(intervalId);
                                    resolve(utxo);
                                    return;
                                }
                            }
                            else {
                                if (utxo.value >= satoshis) {
                                    clearInterval(intervalId);
                                    resolve(utxo);
                                    return;
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error(error);
                        reject(error);
                        clearInterval(intervalId);
                    }
                });
                intervalId = setInterval(checkForUtxo, intervalSeconds * 1000);
            });
        });
    }
    serverVersion() {
        return this.call('server.version', []);
    }
    broadcast(rawtx, force = false) {
        return this.call(force
            ? 'blockchain.transaction.broadcast_force'
            : 'blockchain.transaction.broadcast', [rawtx]);
    }
    dump() {
        return this.call('blockchain.atomicals.dump', []);
    }
    atomicalsGetGlobal(hashes) {
        return this.call('blockchain.atomicals.get_global', [hashes]);
    }
    atomicalsGet(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get', [atomicalAliasOrId]);
    }
    atomicalsGetFtInfo(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get_ft_info', [atomicalAliasOrId]);
    }
    atomicalsGetLocation(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get_location', [atomicalAliasOrId]);
    }
    atomicalsGetStateHistory(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get_state_history', [atomicalAliasOrId]);
    }
    atomicalsGetState(atomicalAliasOrId, verbose) {
        return this.call('blockchain.atomicals.get_state', [atomicalAliasOrId, verbose ? 1 : 0]);
    }
    atomicalsGetEventHistory(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get_events', [atomicalAliasOrId]);
    }
    atomicalsGetTxHistory(atomicalAliasOrId) {
        return this.call('blockchain.atomicals.get_tx_history', [atomicalAliasOrId]);
    }
    history(scripthash) {
        return this.call('blockchain.scripthash.get_history', [scripthash]);
    }
    atomicalsList(limit, offset, asc = false) {
        return this.call('blockchain.atomicals.list', [limit, offset, asc ? 1 : 0]);
    }
    atomicalsByScripthash(scripthash, verbose = true) {
        const params = [scripthash];
        if (verbose) {
            params.push(true);
        }
        return this.call('blockchain.atomicals.listscripthash', params);
    }
    atomicalsByAddress(address) {
        const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(address);
        return this.atomicalsByScripthash(scripthash);
    }
    atomicalsAtLocation(location) {
        return this.call('blockchain.atomicals.at_location', [location]);
    }
    txs(txs, verbose) {
        return Promise.all(txs.map((tx) => this.call('blockchain.transaction.get', [tx, verbose ? 1 : 0])));
    }
    atomicalsGetRealmInfo(realmOrSubRealm, verbose) {
        return this.call('blockchain.atomicals.get_realm_info', [realmOrSubRealm, verbose ? 1 : 0]);
    }
    atomicalsGetByRealm(realm) {
        return this.call('blockchain.atomicals.get_by_realm', [realm]);
    }
    atomicalsGetByTicker(ticker) {
        return this.call('blockchain.atomicals.get_by_ticker', [ticker]);
    }
    atomicalsGetByContainer(container) {
        return this.call('blockchain.atomicals.get_by_container', [container]);
    }
    atomicalsGetContainerItems(container, limit, offset) {
        return this.call('blockchain.atomicals.get_container_items', [container, limit, offset]);
    }
    atomicalsGetByContainerItem(container, itemName) {
        return this.call('blockchain.atomicals.get_by_container_item', [container, itemName]);
    }
    atomicalsGetByContainerItemValidated(container, item, bitworkc, bitworkr, main, mainHash, proof, checkWithoutSealed) {
        return this.call('blockchain.atomicals.get_by_container_item_validate', [container, item, bitworkc, bitworkr, main, mainHash, proof, checkWithoutSealed]);
    }
    atomicalsFindTickers(prefix, asc) {
        const args = [];
        args.push(prefix ? prefix : null);
        if (!asc) {
            args.push(1);
        }
        else {
            args.push(0);
        }
        return this.call('blockchain.atomicals.find_tickers', args);
    }
    atomicalsFindContainers(prefix, asc) {
        const args = [];
        args.push(prefix ? prefix : null);
        if (!asc) {
            args.push(1);
        }
        else {
            args.push(0);
        }
        return this.call('blockchain.atomicals.find_containers', args);
    }
    atomicalsFindRealms(prefix, asc) {
        const args = [];
        args.push(prefix ? prefix : null);
        if (!asc) {
            args.push(1);
        }
        else {
            args.push(0);
        }
        return this.call('blockchain.atomicals.find_realms', args);
    }
    atomicalsFindSubRealms(parentRealmId, prefix, asc) {
        const args = [];
        args.push(prefix ? prefix : null);
        if (!asc) {
            args.push(1);
        }
        else {
            args.push(0);
        }
        return this.call('blockchain.atomicals.find_subrealms', [parentRealmId, args]);
    }
}
exports.ElectrumApi = ElectrumApi;
