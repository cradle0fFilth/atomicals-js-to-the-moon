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
exports.SummaryRealmsCommand = void 0;
const address_helpers_1 = require("../utils/address-helpers");
class SummaryRealmsCommand {
    constructor(electrumApi, address, filter) {
        this.electrumApi = electrumApi;
        this.address = address;
        this.filter = filter;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { scripthash } = (0, address_helpers_1.detectAddressTypeToScripthash)(this.address);
            let res = yield this.electrumApi.atomicalsByScripthash(scripthash, true);
            const statusMap = {};
            for (const prop in res.atomicals) {
                if (!res.atomicals.hasOwnProperty(prop)) {
                    continue;
                }
                const entry = res.atomicals[prop];
                if (entry.type !== 'NFT') {
                    continue;
                }
                if (!entry.subtype || (entry.subtype !== 'realm' && entry.subtype !== 'request_realm')) {
                    continue;
                }
                const entryStatus = entry['request_realm_status']['status'];
                if (this.filter) {
                    const myRe = new RegExp(this.filter);
                    if (!myRe.test(entryStatus)) {
                        continue;
                    }
                }
                statusMap[entry.subtype] = statusMap[entry.subtype] || {};
                statusMap[entry.subtype][entryStatus] = statusMap[entry.subtype][entryStatus] || [];
                statusMap[entry.subtype][entryStatus].push({
                    atomical_id: entry['atomical_id'],
                    atomical_number: entry['atomical_number'],
                    request_realm: entry['request_realm'],
                    status: entry['request_realm_status']
                });
            }
            return {
                success: true,
                data: Object.assign({}, statusMap)
            };
        });
    }
}
exports.SummaryRealmsCommand = SummaryRealmsCommand;
