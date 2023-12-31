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
exports.CreateDmintItemManifestsCommand = void 0;
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const file_utils_1 = require("../utils/file-utils");
const fs = require("fs");
const path_1 = require("path");
const crypto_1 = require("bitcoinjs-lib/src/crypto");
const merkletreejs_1 = require("merkletreejs");
const SHA256 = require('crypto-js/sha256');
function isInvalidImageExtension(extName) {
    return extName !== '.jpg' && extName !== '.gif' && extName !== '.jpeg' && extName !== '.png' && extName !== '.svg' && extName !== '.webp' &&
        extName !== '.mp3' && extName !== '.mp4' && extName !== '.mov' && extName !== '.webm' && extName !== '.avi' && extName !== '.mpg';
}
class CreateDmintItemManifestsCommand {
    constructor(folder, outputName) {
        this.folder = folder;
        this.outputName = outputName;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            // Read the folder for any images
            let counter = 0;
            const files = fs.readdirSync(this.folder);
            const filemap = {};
            const leafItems = [];
            for (const file of files) {
                if (file.startsWith('.')) {
                    console.log(`Skipping ${file}...`);
                    continue;
                }
                const basePath = (0, path_1.basename)(file);
                const extName = (0, path_1.extname)(file);
                const splitBase = basePath.split('.');
                if (splitBase.length !== 2) {
                    throw new Error('Image file must have exactly with dot extension: ' + basePath);
                }
                const rawName = splitBase[0];
                if (isInvalidImageExtension(extName)) {
                    continue;
                }
                (0, atomical_format_helpers_1.isValidDmitemName)(rawName);
                filemap[rawName] = filemap[rawName] || {};
                const fileBuf = fs.readFileSync(this.folder + '/' + file);
                const hashed = (0, crypto_1.hash256)(fileBuf);
                const hashedStr = hashed.toString('hex');
                console.log(`Generating hashes for filename ${basePath} with hash ${hashedStr}`);
                const filename = 'image' + extName;
                filemap[rawName][filename] = {
                    '$b': fileBuf.toString('hex')
                };
                counter++;
                const leafVector = rawName + ':' + filename + ':' + hashedStr;
                leafItems.push({
                    id: rawName,
                    filename,
                    hashedStr,
                    leafVector,
                    fileBuf: fileBuf.toString('hex')
                });
            }
            ;
            const leaves = leafItems.map(x => SHA256(x.leafVector));
            const tree = new merkletreejs_1.MerkleTree(leaves, SHA256);
            const root = tree.getRoot().toString('hex');
            for (const leafItem of leafItems) {
                const leaf = SHA256(leafItem.leafVector);
                const proof = tree.getProof(leaf);
                tree.verify(proof, leaf, root);
                filemap[leafItem.id]['args'] = {
                    request_dmitem: leafItem.id,
                    main: leafItem.filename,
                    i: true // Default everything to immutable
                };
                filemap[leafItem.id]['leafVector'] = leafItem.leafVector;
                filemap[leafItem.id]['hash'] = leafItem.hashedStr;
                filemap[leafItem.id]['fileBuf'] = leafItem.fileBuf;
            }
            const timestamp = (new Date()).getTime();
            const dirName = this.outputName + '-' + timestamp;
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }
            for (const itemProp in filemap) {
                if (!filemap.hasOwnProperty(itemProp)) {
                    continue;
                }
                yield (0, file_utils_1.jsonFileWriter)(`${dirName}/item-${itemProp}.json`, {
                    "mainHash": filemap[itemProp].hash,
                    "data": {
                        args: {
                            request_dmitem: itemProp,
                            main: filemap[itemProp].args.main,
                            i: filemap[itemProp].args.i,
                            proof: filemap[itemProp].args.proof
                        },
                        [filemap[itemProp].args.main]: {
                            '$b': filemap[itemProp].fileBuf
                        },
                    }
                });
            }
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
exports.CreateDmintItemManifestsCommand = CreateDmintItemManifestsCommand;
