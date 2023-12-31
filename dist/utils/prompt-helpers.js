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
exports.warnContinueAbort = void 0;
const readline = require("readline");
/**
 * Warn or continue
 * @param msg Msg to display
 * @param success Success criteria input match
 * @returns
 */
const warnContinueAbort = (msg, success) => __awaiter(void 0, void 0, void 0, function* () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    try {
        let reply = '';
        const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
        reply = (yield prompt(msg));
        if (reply === success) {
            return;
        }
        throw 'Cancelled';
    }
    finally {
        rl.close();
    }
});
exports.warnContinueAbort = warnContinueAbort;
