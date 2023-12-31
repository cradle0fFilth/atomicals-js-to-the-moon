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
exports.GetContainerItemValidatedCommand = void 0;
class GetContainerItemValidatedCommand {
    constructor(electrumApi, containerName, item, bitworkc, bitworkr, main, mainHash, proof, checkWithoutSealed) {
        this.electrumApi = electrumApi;
        this.containerName = containerName;
        this.item = item;
        this.bitworkc = bitworkc;
        this.bitworkr = bitworkr;
        this.main = main;
        this.mainHash = mainHash;
        this.proof = proof;
        this.checkWithoutSealed = checkWithoutSealed;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const responseResult = yield this.electrumApi.atomicalsGetByContainerItemValidated(this.containerName, this.item, this.bitworkc, this.bitworkr, this.main, this.mainHash, this.proof, this.checkWithoutSealed);
            return {
                success: true,
                data: responseResult.result
            };
        });
    }
}
exports.GetContainerItemValidatedCommand = GetContainerItemValidatedCommand;
