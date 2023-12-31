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
exports.ResolveCommand = void 0;
const command_interface_1 = require("./command.interface");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const get_by_realm_command_1 = require("./get-by-realm-command");
const get_by_container_command_1 = require("./get-by-container-command");
const get_by_ticker_command_1 = require("./get-by-ticker-command");
const get_command_1 = require("./get-command");
class ResolveCommand {
    constructor(electrumApi, atomicalAliasOrId, fetchType = command_interface_1.AtomicalsGetFetchType.GET, verbose) {
        this.electrumApi = electrumApi;
        this.atomicalAliasOrId = atomicalAliasOrId;
        this.fetchType = fetchType;
        this.verbose = verbose;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const atomicalType = (0, atomical_format_helpers_1.getAtomicalIdentifierType)(this.atomicalAliasOrId);
            let foundAtomicalResponse;
            let cmd;
            if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_ID || atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.ATOMICAL_NUMBER) {
                cmd = new get_command_1.GetCommand(this.electrumApi, atomicalType.providedIdentifier || '', this.fetchType, this.verbose);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.REALM_NAME) {
                cmd = new get_by_realm_command_1.GetByRealmCommand(this.electrumApi, atomicalType.realmName || '', this.fetchType, this.verbose);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.CONTAINER_NAME) {
                cmd = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, atomicalType.containerName || '', this.fetchType, this.verbose);
            }
            else if (atomicalType.type === atomical_format_helpers_1.AtomicalIdentifierType.TICKER_NAME) {
                cmd = new get_by_ticker_command_1.GetByTickerCommand(this.electrumApi, atomicalType.tickerName || '', this.fetchType, this.verbose);
            }
            const cmdResponse = yield cmd.run();
            if (!cmdResponse || !cmdResponse.success) {
                return cmdResponse;
            }
            foundAtomicalResponse = cmdResponse.data;
            const updatedRes = Object.assign({}, foundAtomicalResponse, {
                result: (0, atomical_format_helpers_1.decorateAtomical)(foundAtomicalResponse.result)
            });
            return {
                success: true,
                data: updatedRes
            };
        });
    }
}
exports.ResolveCommand = ResolveCommand;
