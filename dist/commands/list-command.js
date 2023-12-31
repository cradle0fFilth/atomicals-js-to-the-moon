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
exports.ListCommand = void 0;
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
class ListCommand {
    constructor(electrumApi, limit, offset, asc) {
        this.electrumApi = electrumApi;
        this.limit = limit;
        this.offset = offset;
        this.asc = asc;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.electrumApi.atomicalsList(this.limit, this.offset, this.asc);
            return Object.assign({}, response, {
                success: true,
                data: {
                    global: response.global,
                    result: (0, atomical_format_helpers_1.decorateAtomicals)(response.result),
                }
            });
        });
    }
}
exports.ListCommand = ListCommand;
