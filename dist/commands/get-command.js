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
exports.GetCommand = void 0;
const command_interface_1 = require("./command.interface");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
class GetCommand {
    constructor(electrumApi, atomicalAliasOrId, fetchType = command_interface_1.AtomicalsGetFetchType.GET, verbose) {
        this.electrumApi = electrumApi;
        this.atomicalAliasOrId = atomicalAliasOrId;
        this.fetchType = fetchType;
        this.verbose = verbose;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            if (this.fetchType === command_interface_1.AtomicalsGetFetchType.GET) {
                response = yield this.electrumApi.atomicalsGet(this.atomicalAliasOrId);
            }
            else if (this.fetchType === command_interface_1.AtomicalsGetFetchType.LOCATION) {
                response = yield this.electrumApi.atomicalsGetLocation(this.atomicalAliasOrId);
            }
            else if (this.fetchType === command_interface_1.AtomicalsGetFetchType.STATE) {
                response = yield this.electrumApi.atomicalsGetState(this.atomicalAliasOrId, this.verbose || false);
            }
            else if (this.fetchType === command_interface_1.AtomicalsGetFetchType.STATE_HISTORY) {
                response = yield this.electrumApi.atomicalsGetStateHistory(this.atomicalAliasOrId);
            }
            else if (this.fetchType === command_interface_1.AtomicalsGetFetchType.EVENT_HISTORY) {
                response = yield this.electrumApi.atomicalsGetEventHistory(this.atomicalAliasOrId);
            }
            else if (this.fetchType === command_interface_1.AtomicalsGetFetchType.TX_HISTORY) {
                response = yield this.electrumApi.atomicalsGetTxHistory(this.atomicalAliasOrId);
            }
            else {
                throw new Error('Invalid AtomicalsGetFetchType');
            }
            const updatedRes = Object.assign({}, response, {
                result: (0, atomical_format_helpers_1.decorateAtomical)(response.result)
            });
            return {
                success: true,
                data: updatedRes
            };
        });
    }
}
exports.GetCommand = GetCommand;
