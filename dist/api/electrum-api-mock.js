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
exports.ElectrumApiMock = void 0;
class ElectrumApiMock {
    constructor() {
        this.isOpenFlag = false;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isOpenFlag = false;
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isOpenFlag = true;
        });
    }
    isOpen() {
        return this.isOpenFlag;
    }
    dump() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    resetConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
        });
    }
    atomicalsGetGlobal(hashes) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setSendTransaction(cb) {
        return this.sendTransactionCallback = cb;
    }
    sendTransaction(rawtx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sendTransactionCallback) {
                throw "sendTransactionCallback undefined";
            }
            return this.sendTransactionCallback(rawtx);
        });
    }
    setGetUnspentAddress(cb) {
        return this.getUnspentAddressCallBack = cb;
    }
    getUnspentAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.getUnspentAddressCallBack) {
                throw "getUnspentAddressCallBack undefined";
            }
            return this.getUnspentAddressCallBack(address);
        });
    }
    setGetUnspentScripthash(cb) {
        return this.getUnspentScripthashCallBack = cb;
    }
    getUnspentScripthash(scripthash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.getUnspentScripthashCallBack) {
                throw "getUnspentScripthashCallBack undefined";
            }
            return this.getUnspentScripthashCallBack(scripthash);
        });
    }
    setGetTx(cb) {
        return this.getTxCallback = cb;
    }
    getTx(txid, verbose = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.getTxCallback) {
                throw "getTxCallback undefined";
            }
            return this.getTxCallback(txid);
        });
    }
    waitUntilUTXO(address, satoshis, intervalSeconds = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let intervalId;
                const checkForUtxo = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const response = yield this.getUnspentAddress(address);
                        const utxos = response.utxos;
                        for (const utxo of utxos) {
                            console.log('utxo', utxo);
                            if (utxo.value >= satoshis) {
                                return utxo;
                            }
                        }
                    }
                    catch (error) {
                        reject(error);
                        clearInterval(intervalId);
                    }
                });
                intervalId = setInterval(checkForUtxo, intervalSeconds * 1000);
            });
        });
    }
    serverVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return "test mock";
        });
    }
    broadcast(rawtx, force) {
        return __awaiter(this, void 0, void 0, function* () {
            return "send";
        });
    }
    history(scripthash) {
        return __awaiter(this, void 0, void 0, function* () {
            return "history";
        });
    }
    atomicalsGet(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGet";
        });
    }
    atomicalsGetFtInfo(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetFtInfo";
        });
    }
    atomicalsGetLocation(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetLocation";
        });
    }
    atomicalsGetState(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetState";
        });
    }
    atomicalsGetStateHistory(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetStateHistory";
        });
    }
    atomicalsGetEventHistory(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetEventHistory";
        });
    }
    atomicalsGetTxHistory(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetTxHistory";
        });
    }
    atomicalsList(limit, offset, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsList";
        });
    }
    atomicalsByScripthash(scripthash, verbose = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsByScripthash";
        });
    }
    atomicalsByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsByAddress";
        });
    }
    atomicalsAtLocation(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsAtLocation";
        });
    }
    atomicalsGetMintData(atomicalAliasOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetMintData";
        });
    }
    atomicalsGetByRealm(realm) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetByRealm";
        });
    }
    atomicalsGetRealmInfo(realmOrSubRealm, verbose) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetRealmInfo";
        });
    }
    atomicalsGetByTicker(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetByTicker";
        });
    }
    atomicalsGetByContainer(container) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetByContainer";
        });
    }
    atomicalsGetContainerItems(container, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetContainerItems";
        });
    }
    atomicalsGetByContainerItem(container, item) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetByContainerItem";
        });
    }
    atomicalsGetByContainerItemValidated(container, item, bitworkc, bitworkr, main, mainHash, proof, checkWithoutSealed) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsGetByContainerItemValidated";
        });
    }
    atomicalsFindTickers(tickerPrefix, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsFindTickers";
        });
    }
    atomicalsFindContainers(containerPrefix, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsFindContainers";
        });
    }
    atomicalsFindRealms(realmPrefix, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsFindRealms";
        });
    }
    atomicalsFindSubRealms(parentRealmId, subrealmPrefix, asc) {
        return __awaiter(this, void 0, void 0, function* () {
            return "atomicalsFindSubRealms";
        });
    }
}
exports.ElectrumApiMock = ElectrumApiMock;
