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
exports.MintInteractiveDatCommand = void 0;
const ecc = require("tiny-secp256k1");
const ecpair_1 = require("ecpair");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const command_helpers_1 = require("./command-helpers");
const atomical_operation_builder_1 = require("../utils/atomical-operation-builder");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
const ECPair = (0, ecpair_1.ECPairFactory)(tinysecp);
class MintInteractiveDatCommand {
    constructor(electrumApi, options, filepath, givenFileName, address, fundingWIF) {
        this.electrumApi = electrumApi;
        this.options = options;
        this.filepath = filepath;
        this.givenFileName = givenFileName;
        this.address = address;
        this.fundingWIF = fundingWIF;
        this.options = (0, atomical_format_helpers_1.checkBaseRequestOptions)(this.options);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const atomicalBuilder = new atomical_operation_builder_1.AtomicalOperationBuilder({
                electrumApi: this.electrumApi,
                rbf: this.options.rbf,
                satsbyte: this.options.satsbyte,
                address: this.address,
                disableMiningChalk: this.options.disableMiningChalk,
                opType: 'dat',
                datOptions: {
                    satsoutput: 1000
                },
                meta: this.options.meta,
                ctx: this.options.ctx,
                init: this.options.init,
            });
            // Attach any default data
            let filesData = yield (0, command_helpers_1.readFileAsCompleteDataObject)(this.filepath, this.givenFileName);
            console.log('filesData', filesData);
            yield atomicalBuilder.setData(filesData);
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
            // The receiver output of store data
            atomicalBuilder.addOutput({
                address: this.address,
                value: this.options.satsoutput || 1000
            });
            const result = yield atomicalBuilder.start(this.fundingWIF);
            return {
                success: true,
                data: result
            };
        });
    }
}
exports.MintInteractiveDatCommand = MintInteractiveDatCommand;
