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
exports.GetFtInfoCommand = void 0;
const command_interface_1 = require("./command.interface");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const resolve_command_1 = require("./resolve-command");
class GetFtInfoCommand {
    constructor(electrumApi, atomicalAliasOrId) {
        this.electrumApi = electrumApi;
        this.atomicalAliasOrId = atomicalAliasOrId;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new resolve_command_1.ResolveCommand(this.electrumApi, this.atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.GET);
            const resolved = yield command.run();
            let response;
            response = yield this.electrumApi.atomicalsGetFtInfo(resolved.data.result.atomical_id);
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
exports.GetFtInfoCommand = GetFtInfoCommand;
