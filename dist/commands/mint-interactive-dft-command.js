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
exports.MintInteractiveDftCommand = void 0;
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const command_helpers_1 = require("./command-helpers");
const address_keypair_path_1 = require("../utils/address-keypair-path");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class MintInteractiveDftCommand {
    constructor(electrumApi, options, address, ticker, fundingWIF) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.address = address;
        this.ticker = ticker;
        this.fundingWIF = fundingWIF;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
        this.ticker = this.ticker.startsWith('$') ? this.ticker.substring(1) : this.ticker;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare the keys
            const keypairRaw = ECPair.fromWIF(this.fundingWIF);
            const keypair = (0, address_keypair_path_1.getKeypairInfo)(keypairRaw);
            const filesData = yield (0, command_helpers_1.prepareArgsMetaCtx)({
                mint_ticker: this.ticker,
            }, undefined, undefined);
            (0, command_helpers_1.logBanner)('Mint Interactive FT (Decentralized)');
            console.log("Atomical type:", 'FUNGIBLE (decentralized)', filesData, this.ticker);
            console.log("Mint for ticker: ", this.ticker);
            const atomicalIdResult = yield this.electrumApi.atomicalsGetByTicker(this.ticker);
            const atomicalResponse = yield this.electrumApi.atomicalsGetFtInfo(atomicalIdResult.result.atomical_id);
            const globalInfo = atomicalResponse.global;
            const atomicalInfo = atomicalResponse.result;
            const atomicalDecorated = (0, atomical_format_helpers_1.decorateAtomical)(atomicalInfo);
            console.log(globalInfo, atomicalDecorated);
            if (!atomicalDecorated['$ticker'] || atomicalDecorated['$ticker'] != this.ticker) {
                throw new Error('Ticker being requested does not match the initialized decentralized FT mint: ' + atomicalDecorated);
            }
            if (!atomicalDecorated['subtype'] || atomicalDecorated['subtype'] != 'decentralized') {
                throw new Error('Subtype must be decentralized fungible token type');
            }
            if (atomicalDecorated['$mint_height'] > (globalInfo['height'] + 1)) {
                throw new Error(`Mint height is invalid. height=${globalInfo['height']}, $mint_height=${atomicalDecorated['$mint_height']}`);
            }
            const perAmountMint = atomicalDecorated['$mint_amount'];
            if (perAmountMint <= 0 || perAmountMint >= 100000000) {
                throw new Error('Per amount mint must be > 0 and less than or equal to 100,000,000');
            }
            console.log("Per mint amount:", perAmountMint);
            if (!atomicalDecorated['dft_info']) {
                throw new Error(`General error no dft_info found`);
            }
            const max_mints = atomicalDecorated['$max_mints'];
            const mint_count = atomicalDecorated['dft_info']['mint_count'];
            const ticker = atomicalDecorated['$ticker'];
            if (atomicalDecorated['dft_info']['mint_count'] >= atomicalDecorated['$max_mints']) {
                throw new Error(`Decentralized mint for ${ticker} completely minted out!`);
            }
            else {
                console.log(`There are already ${mint_count} mints of ${ticker} out of a max total of ${max_mints}.`);
            }
            console.log('atomicalDecorated', atomicalResponse, atomicalDecorated);
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'dmt',
                dmtOptions: {
                    mintAmount: perAmountMint,
                    ticker: this.ticker,
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            // Attach any default data
            // Attach a container request
            if (this.options.container)
                atomicalBuilder.setContainerMembership(this.options.container);
            // Attach any requested bitwork OR automatically request bitwork if the parent decentralized ft requires it
            const mint_bitworkc = atomicalDecorated['$mint_bitworkc'] || this.options.bitworkc;
            if (mint_bitworkc) {
                atomicalBuilder.setBitworkCommit(mint_bitworkc);
            }
            const mint_bitworkr = atomicalDecorated['$mint_bitworkr'] || this.options.bitworkr;
            if (mint_bitworkr) {
                atomicalBuilder.setBitworkReveal(mint_bitworkr);
            }
            // The receiver output of the deploy
            atomicalBuilder.addOutput({
                address: this.address,
                value: perAmountMint
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.MintInteractiveDftCommand = MintInteractiveDftCommand;
