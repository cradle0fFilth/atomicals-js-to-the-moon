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
exports.MintInteractiveFtCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const readline = require("readline");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const get_by_ticker_command_1 = require("./get-by-ticker-command");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const command_helpers_1 = require("./command-helpers");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const promptContinue = () => __awaiter(void 0, void 0, void 0, function* () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    try {
        let reply = '';
        const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));
        while (reply !== 'q') {
            console.log(`Are you sure you want to continue with the details above? (y/n)`);
            console.log('-');
            reply = (yield prompt("Enter your selection: "));
            switch (reply) {
                case 'y':
                    return true;
                default:
                    throw new Error("user aborted");
            }
        }
    }
    finally {
        rl.close();
    }
});
class MintInteractiveFtCommand {
    constructor(electrumApi, options, file, supply, address, requestTicker, fundingWIF) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.file = file;
        this.supply = supply;
        this.address = address;
        this.requestTicker = requestTicker;
        this.fundingWIF = fundingWIF;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
        this.requestTicker = this.requestTicker.startsWith('$') ? this.requestTicker.substring(1) : this.requestTicker;
        (0, atomical_format_helpers_1.isValidTickerName)(requestTicker);
        (0, atomical_format_helpers_1.isValidBitworkMinimum)(this.options.bitworkc);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let filesData = yield (0, command_helpers_1.readJsonFileAsCompleteDataObjectEncodeAtomicalIds)(this.file, true);
            console.log('Initializing Direct FT Token');
            console.log('-----------------------');
            console.log('Total Supply (Satoshis): ', this.supply);
            console.log('Total Supply (BTC): ', this.supply / 100000000);
            let supply = this.supply;
            let decimals = 0;
            if (filesData['decimals']) {
                decimals = parseInt(filesData['decimals'], 10);
            }
            console.log('Decimals: ', decimals);
            if (!decimals || decimals === 0) {
                console.log('RECOMMENDATION: USE AT LEAST DECIMALS 1 OR 2');
            }
            let expandedSupply = supply;
            if (decimals > 0) {
                let decimalFactor = Math.pow(10, decimals);
                expandedSupply = supply / decimalFactor;
            }
            console.log('Total Supply (With Decimals): ', expandedSupply);
            console.log('Data objects: ', filesData);
            console.log('-----------------------');
            yield promptContinue();
            const getExistingNameCommand = new get_by_ticker_command_1.GetByTickerCommand(this.electrumApi, this.requestTicker, command_interface_1.AtomicalsGetFetchType.GET, undefined);
            try {
                const getExistingNameResult = yield getExistingNameCommand.run();
                if (getExistingNameResult.success && getExistingNameResult.data) {
                    if (getExistingNameResult.data.result && getExistingNameResult.data.result.atomical_id || getExistingNameResult.data.candidates.length) {
                        throw 'Already exists with that name. Try a different name.';
                    }
                }
            }
            catch (err) {
                console.log('err', err);
                if (err.code !== 1) {
                    throw err; // Code 1 means call correctly returned that it was not found
                }
            }
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'ft',
                ftOptions: {
                    fixedSupply: this.supply,
                    ticker: this.requestTicker,
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            // Attach any default data
            yield atomicalBuilder.setData(filesData);
            // Set to request a container
            atomicalBuilder.setRequestTicker(this.requestTicker);
            // Attach a container request
            if (this.options.container)
                atomicalBuilder.setContainerMembership(this.options.container);
            // Attach any requested bitwork
            if (this.options.bitworkc) {
                atomicalBuilder.setBitworkCommit(this.options.bitworkc);
            }
            if (this.options.bitworkr) {
                atomicalBuilder.setBitworkReveal(this.options.bitworkr);
            }
            if (this.options.parent) {
                atomicalBuilder.setInputParent(yield atomical_operation_builder_1.AtomicalOperationBuilder.resolveInputParent(this.electrumApi, this.options.parent, this.options.parentOwner));
            }
            // The receiver output
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.supply
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.MintInteractiveFtCommand = MintInteractiveFtCommand;
