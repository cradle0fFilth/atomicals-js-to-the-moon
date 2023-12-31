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
exports.GetByRealmCommand = void 0;
const command_interface_1 = require("./command.interface");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const get_command_1 = require("./get-command");
class GetByRealmCommand {
    constructor(electrumApi, realm, fetchType = command_interface_1.AtomicalsGetFetchType.GET, verbose) {
        this.electrumApi = electrumApi;
        this.realm = realm;
        this.fetchType = fetchType;
        this.verbose = verbose;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const responseResult = yield this.electrumApi.atomicalsGetRealmInfo(this.realm, this.verbose);
            if (!responseResult.result || !responseResult.result.atomical_id) {
                return {
                    success: false,
                    data: responseResult.result
                };
            }
            const getDefaultCommand = new get_command_1.GetCommand(this.electrumApi, responseResult.result.atomical_id, this.fetchType, this.verbose);
            const getDefaultCommandResponse = yield getDefaultCommand.run();
            const updatedRes = Object.assign({}, getDefaultCommandResponse.data, {
                result: (0, atomical_format_helpers_1.decorateAtomical)(getDefaultCommandResponse.data.result)
            });
            return {
                success: true,
                data: updatedRes
            };
        });
    }
}
exports.GetByRealmCommand = GetByRealmCommand;
