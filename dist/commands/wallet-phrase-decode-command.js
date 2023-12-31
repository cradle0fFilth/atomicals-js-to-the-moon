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
exports.WalletPhraseDecodeCommand = void 0;
const decode_mnemonic_phrase_1 = require("../utils/decode-mnemonic-phrase");
class WalletPhraseDecodeCommand {
    constructor(phrase, path) {
        this.phrase = phrase;
        this.path = path;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield (0, decode_mnemonic_phrase_1.decodeMnemonicPhrase)(this.phrase, this.path);
            return {
                success: true,
                data: wallet
            };
        });
    }
}
exports.WalletPhraseDecodeCommand = WalletPhraseDecodeCommand;
