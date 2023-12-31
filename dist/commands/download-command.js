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
exports.DownloadCommand = exports.writeFiles = void 0;
const cloneDeep = require("lodash.clonedeep");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const file_utils_1 = require("../utils/file-utils");
const fs = require("fs");
const mime = require("mime-types");
const writeFiles = (inputIndexToFilesMap, txDir) => __awaiter(void 0, void 0, void 0, function* () {
    const fileSummary = {};
    for (const inputIndex in inputIndexToFilesMap) {
        if (!inputIndexToFilesMap.hasOwnProperty(inputIndex)) {
            continue;
        }
        const inputTxDir = txDir + `/${inputIndex}`;
        if (!fs.existsSync(inputTxDir)) {
            fs.mkdirSync(inputTxDir);
        }
        fileSummary[inputIndex] = {
            directory: inputTxDir,
            files: {}
        };
        const rawdata = inputIndexToFilesMap[inputIndex].rawdata;
        const rawdataPath = inputTxDir + `/_rawdata.hex`;
        yield (0, file_utils_1.fileWriter)(rawdataPath, rawdata.toString('hex'));
        const decoded = inputIndexToFilesMap[inputIndex]['decoded'];
        const fulldecodedPath = inputTxDir + `/_rawdata.json`;
        const objectDecoded = Object.assign({}, {}, decoded);
        const copiedObjectDecoded = cloneDeep(objectDecoded);
        yield (0, file_utils_1.fileWriter)(fulldecodedPath, JSON.stringify((0, atomical_format_helpers_1.hexifyObjectWithUtf8)(copiedObjectDecoded, false), null, 2));
        if (decoded) {
            for (const filename in decoded) {
                if (!decoded.hasOwnProperty(filename)) {
                    continue;
                }
                const fileEntry = decoded[filename];
                if (fileEntry['$ct'] && fileEntry['$b']) {
                    const contentType = fileEntry['$ct'];
                    const detectedExtension = mime.extension(contentType) || '.dat';
                    let fileNameWithExtension = `${filename}.${detectedExtension}`;
                    const fullPath = inputTxDir + `/${fileNameWithExtension}`;
                    /* if (/utf8/.test(contentType)) {
                      await fileWriter(fullPath, fileEntry['d']);
                    } else {
                    }*/
                    yield (0, file_utils_1.fileWriter)(fullPath, fileEntry['$b']);
                    const contentLength = fileEntry['$b'].length;
                    const body = fileEntry['$b'];
                    fileSummary[inputIndex]['files'][filename] = {
                        filename,
                        fileNameWithExtension,
                        detectedExtension,
                        fullPath,
                        contentType,
                        contentLength,
                        body: body.toString('hex')
                    };
                }
                else if (fileEntry['$b']) {
                    // when there is not explicit content type with 'ct' then assume it is json
                    const contentType = 'application/json';
                    const fileNameWithExtension = `${filename}.property.json`;
                    const fullPath = inputTxDir + `/${fileNameWithExtension}`;
                    yield (0, file_utils_1.fileWriter)(fullPath, JSON.stringify(fileEntry, null, 2));
                    const contentLength = fileEntry['$b'].length;
                    const body = fileEntry['$b'];
                    fileSummary[inputIndex]['files'][filename] = {
                        filename,
                        fileNameWithExtension,
                        detectedExtension: '.json',
                        fullPath,
                        contentType,
                        contentLength,
                        body: body.toString('hex')
                    };
                }
                else {
                    // when there is not explicit content type with 'ct' then assume it is json
                    const contentType = 'application/json';
                    const fileNameWithExtension = `${filename}.property.json`;
                    const fullPath = inputTxDir + `/${fileNameWithExtension}`;
                    yield (0, file_utils_1.fileWriter)(fullPath, JSON.stringify(fileEntry, null, 2));
                    const contentLength = fileEntry.length;
                    const body = fileEntry;
                    fileSummary[inputIndex]['files'][filename] = {
                        filename,
                        fileNameWithExtension,
                        detectedExtension: '.json',
                        fullPath,
                        contentType,
                        contentLength,
                        body: body
                    };
                }
            }
        }
    }
    yield (0, file_utils_1.jsonFileWriter)(txDir + '/manifest.json', fileSummary);
    return fileSummary;
});
exports.writeFiles = writeFiles;
class DownloadCommand {
    constructor(electrumApi, atomicalIdOrTxId) {
        this.electrumApi = electrumApi;
        this.atomicalIdOrTxId = atomicalIdOrTxId;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = (0, atomical_format_helpers_1.getTxIdFromAtomicalId)(this.atomicalIdOrTxId);
            const txResult = yield this.electrumApi.getTx(txid, false);
            if (!txResult || !txResult.success) {
                throw `transaction not found ${txid}`;
            }
            const tx = txResult.tx;
            const downloadDir = `download_txs/`;
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir);
            }
            const txDir = `${downloadDir}/${txid}`;
            if (!fs.existsSync(txDir)) {
                fs.mkdirSync(txDir);
            }
            yield (0, file_utils_1.fileWriter)(txDir + `/${txid}.hex`, tx);
            const filemap = (0, atomical_format_helpers_1.buildAtomicalsFileMapFromRawTx)(tx, false, false);
            const writeResult = yield (0, exports.writeFiles)(filemap, txDir);
            return {
                success: true,
                data: {
                    txid,
                    filemap: writeResult
                }
            };
        });
    }
}
exports.DownloadCommand = DownloadCommand;
