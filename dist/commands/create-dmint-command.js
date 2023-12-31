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
exports.CreateDmintCommand = void 0;
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const file_utils_1 = require("../utils/file-utils");
const fs = require("fs");
const crypto_1 = require("bitcoinjs-lib/src/crypto");
const merkletreejs_1 = require("merkletreejs");
const SHA256 = require('crypto-js/sha256');
function isInvalidImageExtension(extName) {
    return extName !== '.jpg' && extName !== '.gif' && extName !== '.jpeg' && extName !== '.png' && extName !== '.svg' && extName !== '.webp' &&
        extName !== '.mp3' && extName !== '.mp4' && extName !== '.mov' && extName !== '.webm' && extName !== '.avi' && extName !== '.mpg';
}
function isJsonExtension(extName) {
    return extName === '.json';
}
class CreateDmintCommand {
    constructor(folder, mintHeight, bitworkc) {
        this.folder = folder;
        this.mintHeight = mintHeight;
        this.bitworkc = bitworkc;
        if (this.mintHeight < 0 || this.mintHeight > 10000000) {
            throw new Error('Invalid Mint height');
        }
        if (!(0, atomical_format_helpers_1.isValidBitworkConst)(bitworkc) && !(0, atomical_format_helpers_1.isValidBitworkString)(bitworkc)) {
            throw new Error(`Invalid Bitwork string. When in doubt use '7777'`);
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let counter = 0;
            const files = fs.readdirSync(this.folder);
            const leafItems = [];
            const jsonFiles = {};
            for (const file of files) {
                if (file.startsWith('.') || file.startsWith('dmint')) {
                    console.log(`Skipping ${file}...`);
                    continue;
                }
                counter++;
                const jsonFile = yield (0, file_utils_1.jsonFileReader)(`${this.folder}/${file}`);
                jsonFiles[jsonFile['data']['args']['request_dmitem']] = jsonFile;
                const itemName = jsonFile['data']['args']['request_dmitem'];
                const mainName = jsonFile['data']['args']['main'];
                const mainFile = Buffer.from(jsonFile['data'][mainName]['$b'], 'hex');
                const hashed = (0, crypto_1.hash256)(mainFile);
                const hashedStr = hashed.toString('hex');
                if (jsonFile['data']['args']['bitworkc'] === 'any') {
                    throw new Error('cannot use ANY bitworkc in item');
                }
                if (jsonFile['data']['args']['bitworkr'] === 'any') {
                    throw new Error('cannot use ANY bitworkr in item');
                }
                let itemBitworkc = 'any';
                if (jsonFile['data']['args']['bitworkc']) {
                    itemBitworkc = jsonFile['data']['args']['bitworkc'] ? jsonFile['data']['args']['bitworkc'] : 'any';
                }
                let itemBitworkr = 'any';
                if (jsonFile['data']['args']['bitworkr']) {
                    itemBitworkr = jsonFile['data']['args']['bitworkr'] ? jsonFile['data']['args']['bitworkr'] : 'any';
                }
                const leafVector = itemName + ':' + itemBitworkc + ':' + itemBitworkr + ':' + mainName + ':' + hashedStr;
                leafItems.push({
                    itemName,
                    file,
                    leafVector,
                    hashedStr
                });
            }
            ;
            const leaves = leafItems.map(x => SHA256(x.leafVector));
            const tree = new merkletreejs_1.MerkleTree(leaves, SHA256);
            const root = tree.getRoot().toString('hex');
            let items = 0;
            for (const leafItem of leafItems) {
                const leaf = SHA256(leafItem.leafVector);
                const proof = tree.getProof(leaf);
                tree.verify(proof, leaf, root);
                jsonFiles[leafItem.itemName]['data']['args']['proof'] = (proof.map((item) => {
                    return {
                        p: item.position === 'right' ? true : item.position === 'left' ? false : null,
                        d: item.data.toString('hex')
                    };
                }));
                jsonFiles[leafItem.itemName]['targetVector'] = leafItem.leafVector;
                jsonFiles[leafItem.itemName]['targethash'] = leafItem.hashedStr;
                yield (0, file_utils_1.jsonFileWriter)(`${this.folder}/${leafItem.file}`, jsonFiles[leafItem.itemName]);
                items++;
            }
            const timestamp = (new Date()).getTime();
            const dmintFilename = 'dmint-' + timestamp + '.json';
            yield (0, file_utils_1.jsonFileWriter)(`${this.folder}/${dmintFilename}`, {
                dmint: {
                    v: "1",
                    mint_height: this.mintHeight,
                    merkle: root,
                    immutable: true,
                    items,
                    rules: [
                        {
                            p: ".*",
                            bitworkc: this.bitworkc
                        }
                    ]
                }
            });
            return {
                success: true,
                data: {
                    folder: this.folder,
                    totalItems: counter,
                }
            };
        });
    }
}
exports.CreateDmintCommand = CreateDmintCommand;
