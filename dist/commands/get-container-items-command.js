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
exports.GetContainerItems = void 0;
class GetContainerItems {
    constructor(electrumApi, container, limit, offset) {
        this.electrumApi = electrumApi;
        this.container = container;
        this.limit = limit;
        this.offset = offset;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const trimmedContainer = this.container.startsWith('#') ? this.container.substring(1) : this.container;
            const responseResult = yield this.electrumApi.atomicalsGetContainerItems(trimmedContainer, this.limit, this.offset);
            if (!responseResult.result) {
                return {
                    success: false,
                    data: responseResult.result
                };
            }
            return {
                success: true,
                data: responseResult
            };
        });
    }
}
exports.GetContainerItems = GetContainerItems;
