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
exports.GetContainerItemValidatedByManifestCommand = void 0;
const command_interface_1 = require("./command.interface");
const ecc = require("tiny-secp256k1");
const bitcoin = require('bitcoinjs-lib');
bitcoin.initEccLib(ecc);
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const get_by_container_command_1 = require("./get-by-container-command");
const file_utils_1 = require("../utils/file-utils");
const get_container_item_validated_command_1 = require("./get-container-item-validated-command");
const crypto_1 = require("bitcoinjs-lib/src/crypto");
const tinysecp = require('tiny-secp256k1');
(0, bitcoinjs_lib_1.initEccLib)(tinysecp);
class GetContainerItemValidatedByManifestCommand {
    constructor(electrumApi, container, requestDmitem, manifestJsonFile) {
        this.electrumApi = electrumApi;
        this.container = container;
        this.requestDmitem = requestDmitem;
        this.manifestJsonFile = manifestJsonFile;
        this.container = this.container.startsWith('#') ? this.container.substring(1) : this.container;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const getCmd = new get_by_container_command_1.GetByContainerCommand(this.electrumApi, this.container, command_interface_1.AtomicalsGetFetchType.GET);
            const getResponse = yield getCmd.run();
            if (!getResponse.success || !getResponse.data.result.atomical_id) {
                return {
                    success: false,
                    msg: 'Error retrieving container parent atomical ' + this.container,
                    data: getResponse.data
                };
            }
            const parentContainerId = getResponse.data.result.atomical_id;
            // Step 0. Get the details from the manifest
            const jsonFile = yield (0, file_utils_1.jsonFileReader)(this.manifestJsonFile);
            const expectedData = jsonFile['data'];
            if (expectedData['args']['request_dmitem'] !== this.requestDmitem) {
                throw new Error('Mismatch item id');
            }
            const fileBuf = Buffer.from(expectedData[expectedData['args']['main']]['$b'], 'hex');
            const main = expectedData['args']['main'];
            const mainHash = (0, crypto_1.hash256)(fileBuf).toString('hex');
            const proof = expectedData['args']['proof'];
            // Step 1. Query the container item to see if it's taken
            let bitworkc = 'any';
            let bitworkr = 'any';
            if (expectedData['args']['bitworkc']) {
                bitworkc = expectedData['args']['bitworkc'];
            }
            if (expectedData['args']['bitworkr']) {
                bitworkr = expectedData['args']['bitworkr'];
            }
            const getItemCmd = new get_container_item_validated_command_1.GetContainerItemValidatedCommand(this.electrumApi, this.container, this.requestDmitem, bitworkc, bitworkr, main, mainHash, proof, true);
            const getItemCmdResponse = yield getItemCmd.run();
            console.log('getItemCmdResponse', getItemCmdResponse);
            return {
                success: true,
                data: getItemCmdResponse
            };
        });
    }
}
exports.GetContainerItemValidatedByManifestCommand = GetContainerItemValidatedByManifestCommand;
