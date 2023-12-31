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
exports.getAndCheckAtomicalInfo = exports.normalizeIdentifier = exports.guessPrefixType = exports.appendMintUpdateRevealScript = exports.AtomicalsPayload = exports.encodeFiles = exports.prepareArgsMetaCtx = exports.prepareObjectfield = exports.prepareFilesDataBackup = exports.readJsonFileAsCompleteDataObjectEncodeHash = exports.readJsonFileAsCompleteDataObjectEncodeAtomicalIds = exports.prepareFilesDataAsObject = exports.readFileAsCompleteDataObject = exports.prepareFilesData = exports.readAsAtomicalFileData = exports.prepareCommitRevealConfig = exports.prepareCommitRevealConfig2 = exports.appendMintUpdateRevealScript2 = exports.calculateUtxoFundsRequired = exports.calculateFTFundsRequired = exports.calculateFundsRequired = exports.logBanner = exports.NETWORK = exports.RBF_INPUT_SEQUENCE = void 0;
const path_1 = require("path");
const mime = require("mime-types");
const file_utils_1 = require("../utils/file-utils");
const cbor = require("borc");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const protocol_tags_1 = require("../types/protocol-tags");
const resolve_command_1 = require("./resolve-command");
const command_interface_1 = require("./command.interface");
const atomical_format_helpers_1 = require("../utils/atomical-format-helpers");
const address_helpers_1 = require("../utils/address-helpers");
const dotenv = require("dotenv");
dotenv.config();
exports.RBF_INPUT_SEQUENCE = 0xfffffffd;
exports.NETWORK = process.env.NETWORK === 'testnet' ? bitcoinjs_lib_1.networks.testnet : process.env.NETWORK == "regtest" ? bitcoinjs_lib_1.networks.regtest : bitcoinjs_lib_1.networks.bitcoin;
function logBanner(text) {
    console.log("====================================================================");
    console.log(text);
    console.log("====================================================================");
}
exports.logBanner = logBanner;
const calculateFundsRequired = (additionalInputValue, atomicalSats, satsByte, mintDataLength = 0, baseTxByteLength = 300) => {
    // The default base includes assumes 1 input and 1 output with room to spare
    const estimatedTxSizeBytes = baseTxByteLength + mintDataLength;
    const expectedFee = estimatedTxSizeBytes * satsByte;
    let expectedSatoshisDeposit = expectedFee + atomicalSats - additionalInputValue;
    if (expectedSatoshisDeposit > 0 && expectedSatoshisDeposit < 546) {
        expectedSatoshisDeposit = 546;
    }
    return {
        expectedSatoshisDeposit,
        expectedFee
    };
};
exports.calculateFundsRequired = calculateFundsRequired;
const calculateFTFundsRequired = (numberOfInputs, numberOfOutputs, satsByte, mintDataLength = 0, baseTxByteLength = 300) => {
    // The default base includes assumes 1 input and 1 output with room to spare
    const estimatedTxSizeBytes = baseTxByteLength + mintDataLength;
    const baseInputSize = 36 + 4 + 64;
    const baseOutputSize = 8 + 20 + 4;
    let expectedSatoshisDeposit = (estimatedTxSizeBytes + (numberOfInputs * baseInputSize) + (numberOfOutputs * baseOutputSize)) * satsByte;
    if (expectedSatoshisDeposit > 0 && expectedSatoshisDeposit < 546) {
        expectedSatoshisDeposit = 546;
    }
    return {
        expectedSatoshisDeposit
    };
};
exports.calculateFTFundsRequired = calculateFTFundsRequired;
const calculateUtxoFundsRequired = (numberOfInputs, numberOfOutputs, satsByte, mintDataLength = 0, baseTxByteLength = 300) => {
    // The default base includes assumes 1 input and 1 output with room to spare
    const estimatedTxSizeBytes = baseTxByteLength + mintDataLength;
    const baseInputSize = 36 + 4 + 64;
    const baseOutputSize = 8 + 20 + 4;
    let expectedSatoshisDeposit = (estimatedTxSizeBytes + (numberOfInputs * baseInputSize) + (numberOfOutputs * baseOutputSize)) * satsByte;
    if (expectedSatoshisDeposit > 0 && expectedSatoshisDeposit < 546) {
        expectedSatoshisDeposit = 546;
    }
    return {
        expectedSatoshisDeposit
    };
};
exports.calculateUtxoFundsRequired = calculateUtxoFundsRequired;
const appendMintUpdateRevealScript2 = (opType, keypair, files, log = true) => {
    let ops = `${keypair.childNodeXOnlyPubkey.toString('hex')} OP_CHECKSIG OP_0 OP_IF `;
    ops += `${Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8').toString('hex')}`;
    ops += ` ${Buffer.from(opType, 'utf8').toString('hex')}`;
    const payload = {};
    for (const file of files) {
        if (file.contentType !== 'object') {
            payload[file.name] = {
                '$ct': file.contentType,
                '$b': file.data
            };
        }
        else if (file.contentType === 'object') {
            payload[file.name] = file.data;
        }
    }
    function deepEqual(x, y) {
        const ok = Object.keys, tx = typeof x, ty = typeof y;
        return x && y && tx === 'object' && tx === ty ? (ok(x).length === ok(y).length &&
            ok(x).every(key => deepEqual(x[key], y[key]))) : (x === y);
    }
    const cborEncoded = cbor.encode(payload);
    // Decode to do sanity check
    const cborDecoded = cbor.decode(cborEncoded);
    if (log) {
        console.log('CBOR Encoded', JSON.stringify(cborDecoded, null, 2));
    }
    if (!deepEqual(cborDecoded, payload)) {
        throw 'CBOR Decode error objects are not the same. Developer error';
    }
    const chunks = (0, file_utils_1.chunkBuffer)(cborEncoded, 520);
    for (let chunk of chunks) {
        ops += ` ${chunk.toString('hex')}`;
    }
    ops += ` OP_ENDIF`;
    return ops;
};
exports.appendMintUpdateRevealScript2 = appendMintUpdateRevealScript2;
const prepareCommitRevealConfig2 = (opType, keypair, filesData, log = true) => {
    const revealScript = (0, exports.appendMintUpdateRevealScript2)(opType, keypair, filesData, log);
    const hashscript = bitcoinjs_lib_1.script.fromASM(revealScript);
    const scriptTree = {
        output: hashscript,
    };
    const hash_lock_script = hashscript;
    const hashLockRedeem = {
        output: hash_lock_script,
        redeemVersion: 192,
    };
    const scriptP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: keypair.childNodeXOnlyPubkey,
        scriptTree,
        network: exports.NETWORK
    });
    const hashLockP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: keypair.childNodeXOnlyPubkey,
        scriptTree,
        redeem: hashLockRedeem,
        network: exports.NETWORK
    });
    return {
        scriptP2TR,
        hashLockP2TR
    };
};
exports.prepareCommitRevealConfig2 = prepareCommitRevealConfig2;
const prepareCommitRevealConfig = (opType, keypair, atomicalsPayload, log = true) => {
    const revealScript = (0, exports.appendMintUpdateRevealScript)(opType, keypair, atomicalsPayload, log);
    const hashscript = bitcoinjs_lib_1.script.fromASM(revealScript);
    const scriptTree = {
        output: hashscript,
    };
    const hash_lock_script = hashscript;
    const hashLockRedeem = {
        output: hash_lock_script,
        redeemVersion: 192,
    };
    const scriptP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: keypair.childNodeXOnlyPubkey,
        scriptTree,
        network: exports.NETWORK
    });
    const hashLockP2TR = bitcoinjs_lib_1.payments.p2tr({
        internalPubkey: keypair.childNodeXOnlyPubkey,
        scriptTree,
        redeem: hashLockRedeem,
        network: exports.NETWORK
    });
    return {
        scriptP2TR,
        hashLockP2TR,
        hashscript
    };
};
exports.prepareCommitRevealConfig = prepareCommitRevealConfig;
const readAsAtomicalFileData = (file, alternateName) => __awaiter(void 0, void 0, void 0, function* () {
    let expectedName = file;
    const rawbytes = yield (0, file_utils_1.fileReader)(file);
    let fileMintData = {
        name: alternateName ? alternateName : expectedName,
        contentType: mime.contentType((0, path_1.basename)(file)) || 'application/octet-stream',
        data: Buffer.from(rawbytes, 'utf8')
    };
    return fileMintData;
});
exports.readAsAtomicalFileData = readAsAtomicalFileData;
/**
 *
 * Prepare file data from a file on disk, with an optional renaming of the file
 * OR...
 * field data (ie: JSON value or object)
 *
 * Syntax:
 *
 * Case 1: Store raw file, using the filename on disk as the field name:  file.txt
 * Result: file.txt: { ... file data embedded }
 *
 * Case 2: Store raw file, but use an alternate field name: filerenamed.to.anything:file.txt
 * Result: filerenamed.to.anything: { ... file data embedded }
 *
 * Case 3: Store scalar value or object, using a specified field name: "meta={\"hello"\:\"world\"}" or meta=123 or "meta=this is a text string"
 *
 * @param files Key value array of files and names OR the field name and field data
 * @returns
 */
const prepareFilesData = (fields) => __awaiter(void 0, void 0, void 0, function* () {
    const filesData = [];
    for (const entry of fields) {
        if (entry.indexOf(',') === -1 && entry.indexOf('=') === -1) {
            filesData.push(yield (0, exports.readAsAtomicalFileData)(entry));
        }
        else if (entry.indexOf(',') !== -1) {
            const entrySplit = entry.split(',');
            const alternateName = entrySplit[0];
            filesData.push(yield (0, exports.readAsAtomicalFileData)(entrySplit[1], alternateName));
        }
        else if (entry.indexOf('=') !== -1) {
            const fieldName = entry.substring(0, entry.indexOf('='));
            const fieldValue = entry.substring(entry.indexOf('=') + 1);
            const parsedJson = JSON.parse(fieldValue);
            const fieldData = {
                name: fieldName,
                contentType: 'object',
                data: parsedJson
            };
            filesData.push(fieldData);
        }
        else {
            throw new Error('Invalid field(s) specifications. Aborting...');
        }
    }
    return filesData;
});
exports.prepareFilesData = prepareFilesData;
const readFileAsCompleteDataObject = (filePath, givenFileName) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContents = yield (0, file_utils_1.fileReader)(filePath);
    return {
        [givenFileName]: fileContents
    };
});
exports.readFileAsCompleteDataObject = readFileAsCompleteDataObject;
const prepareFilesDataAsObject = (fields, disableAutoncode = false) => __awaiter(void 0, void 0, void 0, function* () {
    let fieldDataObject = {};
    for (const entry of fields) {
        if (entry.indexOf(',') === -1 && entry.indexOf('=') === -1) {
            let filename = entry;
            if (filename.charAt(0) === '@') {
                if (!filename.endsWith('.json')) {
                    throw new Error('Use of @ for direct embeds must only be used with .json file types');
                }
                filename = entry.substring(1);
                const jsonFileContents = yield (0, file_utils_1.jsonFileReader)(filename);
                fieldDataObject = Object.assign({}, fieldDataObject, Object.assign({}, jsonFileContents));
            }
            else {
                const fileInfo = yield (0, exports.readAsAtomicalFileData)(filename);
                fieldDataObject[(0, path_1.basename)(fileInfo.name)] = fileInfo.data;
            }
        }
        else if (entry.indexOf(',') !== -1 && entry.indexOf('=') === -1) {
            const entrySplit = entry.split(',');
            const filePath = entrySplit[1];
            const alternateName = entrySplit[0];
            const isInlineJson = filePath.endsWith('.json') ? true : false;
            if (isInlineJson) {
                const jsonFileContents = yield (0, file_utils_1.jsonFileReader)(filePath);
                fieldDataObject[alternateName] = jsonFileContents;
            }
            else {
                const fileInfo = yield (0, exports.readAsAtomicalFileData)(entrySplit[1], alternateName);
                fieldDataObject[(fileInfo.name)] = {
                    '$ct': fileInfo.contentType,
                    '$b': fileInfo.data
                };
            }
        }
        else if (entry.indexOf('=') !== -1) {
            const fieldName = entry.substring(0, entry.indexOf('='));
            const fieldValue = entry.substring(entry.indexOf('=') + 1);
            try {
                const parsedJson = JSON.parse(fieldValue);
                fieldDataObject[fieldName] = parsedJson;
            }
            catch (err) {
                if (typeof fieldValue === 'string') {
                    try {
                        const num = Number(fieldValue);
                        if (!isNaN(num)) {
                            fieldDataObject[fieldName] = Number(fieldValue);
                        }
                        else {
                            fieldDataObject[fieldName] = fieldValue;
                        }
                    }
                    catch (ex) {
                        fieldDataObject[fieldName] = fieldValue;
                    }
                }
            }
        }
        else {
            throw new Error('Invalid field(s) specifications. Aborting...');
        }
    }
    return fieldDataObject;
});
exports.prepareFilesDataAsObject = prepareFilesDataAsObject;
const readJsonFileAsCompleteDataObjectEncodeAtomicalIds = (jsonFile, autoEncode = false, autoEncodePattern) => __awaiter(void 0, void 0, void 0, function* () {
    if (!jsonFile.endsWith('.json')) {
        throw new Error('Filename must end in json');
    }
    const jsonFileContents = yield (0, file_utils_1.jsonFileReader)(jsonFile);
    if (autoEncode) {
        const updatedObject = {};
        (0, atomical_format_helpers_1.encodeIds)(jsonFileContents, updatedObject, atomical_format_helpers_1.encodeAtomicalIdToBuffer, atomical_format_helpers_1.encodeHashToBuffer, autoEncodePattern);
        return updatedObject;
    }
    return jsonFileContents;
});
exports.readJsonFileAsCompleteDataObjectEncodeAtomicalIds = readJsonFileAsCompleteDataObjectEncodeAtomicalIds;
const readJsonFileAsCompleteDataObjectEncodeHash = (jsonFile, autoEncode = false, autoEncodePattern) => __awaiter(void 0, void 0, void 0, function* () {
    if (!jsonFile.endsWith('.json')) {
        throw new Error('Filename must end in json');
    }
    const jsonFileContents = yield (0, file_utils_1.jsonFileReader)(jsonFile);
    if (autoEncode) {
        const updatedObject = {};
        (0, atomical_format_helpers_1.encodeIds)(jsonFileContents, updatedObject, atomical_format_helpers_1.encodeAtomicalIdToBuffer, atomical_format_helpers_1.encodeHashToBuffer, autoEncodePattern);
        return updatedObject;
    }
    return jsonFileContents;
});
exports.readJsonFileAsCompleteDataObjectEncodeHash = readJsonFileAsCompleteDataObjectEncodeHash;
const prepareFilesDataBackup = (files, names) => __awaiter(void 0, void 0, void 0, function* () {
    let fileCount = 0;
    const nameMap = {};
    const filesData = [];
    for (const file of files) {
        let expectedName = file;
        let mimeTypeHint;
        if (names.length) {
            if (names.length !== files.length) {
                throw 'Error names argument length must match the number of files provided';
            }
            const splitted = names[fileCount].split(',');
            expectedName = splitted[0];
            mimeTypeHint = splitted[1] && splitted[1] === 'object' ? 'object' : null;
        }
        if (nameMap[expectedName]) {
            throw `Error invalid name ${expectedName} for --names. Check there are no duplicates and that '_' is also not used`;
        }
        nameMap[expectedName] = true;
        const fileIndex = fileCount + 1;
        const rawbytes = yield (0, file_utils_1.fileReader)(file);
        let fileMintData = {
            name: expectedName,
            contentType: mime.contentType(file) || 'application/octet-stream',
            data: Buffer.from(rawbytes, 'utf8')
        };
        if (mimeTypeHint === 'object') {
            const rawbytes = yield (0, file_utils_1.fileReader)(file);
            const parsedJson = JSON.parse(rawbytes);
            fileMintData = {
                name: expectedName,
                contentType: 'object',
                data: parsedJson
            };
        }
        filesData.push(fileMintData);
        console.log(`File #${fileIndex} name locally`, file);
        console.log(`File #${fileIndex} field name:`, expectedName);
        console.log(`File #${fileIndex} size:`, rawbytes.length);
        console.log(`File #${fileIndex} content type:`, fileMintData.contentType);
        console.log('-------');
        fileCount++;
    }
    console.log("Total number of files to be added in transaction:", files.length);
    return filesData;
});
exports.prepareFilesDataBackup = prepareFilesDataBackup;
const prepareObjectfield = (filesData, objectToAdd) => __awaiter(void 0, void 0, void 0, function* () {
    for (const prop in objectToAdd) {
        if (!objectToAdd.hasOwnProperty(prop)) {
            continue;
        }
        filesData.push({
            name: prop,
            contentType: 'object',
            data: isNaN(objectToAdd[prop]) ? objectToAdd[prop] : Number(objectToAdd[prop])
        });
    }
    return filesData;
});
exports.prepareObjectfield = prepareObjectfield;
const prepareArgsMetaCtx = (args = undefined, meta = undefined, ctx = undefined, log = true) => __awaiter(void 0, void 0, void 0, function* () {
    if (log) {
        console.log('Args', args);
        console.log('Meta', meta);
        console.log('Ctx', ctx);
    }
    const filesData = [];
    if (args) {
        filesData.push({
            name: 'args',
            contentType: 'object',
            data: args
        });
    }
    if (meta) {
        filesData.push({
            name: 'meta',
            contentType: 'object',
            data: meta
        });
    }
    if (ctx) {
        filesData.push({
            name: 'ctx',
            contentType: 'object',
            data: ctx
        });
    }
    return filesData;
});
exports.prepareArgsMetaCtx = prepareArgsMetaCtx;
const encodeFiles = (files) => {
    const payload = {};
    for (const file of files) {
        if (file.contentType !== 'object') {
            payload[file.name] = {
                '$ct': file.contentType,
                '$d': file.data
            };
        }
        else if (file.contentType === 'object') {
            payload[file.name] = file.data;
        }
    }
    return payload;
};
exports.encodeFiles = encodeFiles;
/**
 * Ensure provided object is restricted to the set of allowable datatypes to be CBOR atomicals friendly.
 *
 */
class AtomicalsPayload {
    constructor(originalData) {
        this.originalData = originalData;
        if (!originalData) {
            this.originalData = {};
            return;
        }
        function deepEqual(x, y) {
            const ok = Object.keys, tx = typeof x, ty = typeof y;
            return x && y && tx === 'object' && tx === ty ? (ok(x).length === ok(y).length &&
                ok(x).every(key => deepEqual(x[key], y[key]))) : (x === y);
        }
        function isAllowedtype(tc, allowBuffer = true) {
            if (tc === 'object' || tc === 'Number' || tc === 'number' || tc === 'null' || tc === 'string' || tc == 'boolean') {
                return true;
            }
            if (allowBuffer && tc === 'buffer') {
                return true;
            }
            return false;
        }
        function validateWhitelistedDatatypes(x, allowBuffer = true) {
            const ok = Object.keys;
            const tx = typeof x;
            const isAllowed = isAllowedtype(tx, allowBuffer);
            if (!isAllowed) {
                return false;
            }
            if (tx === 'object') {
                return ok(x).every(key => validateWhitelistedDatatypes(x[key], allowBuffer));
            }
            return true;
        }
        if (!validateWhitelistedDatatypes(originalData)) {
            throw new Error('Invalid payload contains disallowed data types. Use only number, string, null, or buffer');
        }
        // Also make sure that if either args, ctx, init, or meta are provided, then we never allow buffer.
        if (originalData['args']) {
            if (!validateWhitelistedDatatypes(originalData['args'], false)) {
                throw 'args field invalid due to presence of buffer type';
            }
        }
        if (originalData['ctx']) {
            if (!validateWhitelistedDatatypes(originalData['ctx'], false)) {
                throw 'ctx field invalid due to presence of buffer type';
            }
        }
        if (originalData['meta']) {
            if (!validateWhitelistedDatatypes(originalData['meta'], false)) {
                throw 'meta field invalid due to presence of buffer type';
            }
        }
        const payload = Object.assign({}, originalData);
        const cborEncoded = cbor.encode(payload);
        // Decode to do sanity check
        const cborDecoded = cbor.decode(cborEncoded);
        if (!deepEqual(cborDecoded, payload)) {
            throw 'CBOR Decode error objects are not the same. Developer error';
        }
        if (!deepEqual(originalData, payload)) {
            throw 'CBOR Payload Decode error objects are not the same. Developer error';
        }
        this.cborEncoded = cborEncoded;
    }
    get() {
        return this.originalData;
    }
    cbor() {
        return this.cborEncoded;
    }
}
exports.AtomicalsPayload = AtomicalsPayload;
const appendMintUpdateRevealScript = (opType, keypair, payload, log = true) => {
    let ops = `${keypair.childNodeXOnlyPubkey.toString('hex')} OP_CHECKSIG OP_0 OP_IF `;
    ops += `${Buffer.from(protocol_tags_1.ATOMICALS_PROTOCOL_ENVELOPE_ID, 'utf8').toString('hex')}`;
    ops += ` ${Buffer.from(opType, 'utf8').toString('hex')}`;
    const chunks = (0, file_utils_1.chunkBuffer)(payload.cbor(), 520);
    for (let chunk of chunks) {
        ops += ` ${chunk.toString('hex')}`;
    }
    ops += ` OP_ENDIF`;
    return ops;
};
exports.appendMintUpdateRevealScript = appendMintUpdateRevealScript;
const guessPrefixType = (id) => {
    if (id.startsWith('#')) {
        return id;
    }
    if (id.startsWith('+')) {
        return id;
    }
    if (id.startsWith('$')) {
        return id;
    }
    if (id.indexOf('.') !== -1) {
        return id;
    }
    return id;
};
exports.guessPrefixType = guessPrefixType;
const normalizeIdentifier = (id, expectedType) => {
    switch (expectedType) {
        case null:
            return (0, exports.guessPrefixType)(id);
        case atomical_format_helpers_1.AtomicalIdentifierType.CONTAINER_NAME:
            return id.startsWith('#') ? id : '#' + id;
        case atomical_format_helpers_1.AtomicalIdentifierType.REALM_NAME:
            return id.startsWith('+') ? id : '+' + id;
        case atomical_format_helpers_1.AtomicalIdentifierType.TICKER_NAME:
            return id.startsWith('$') ? id : '$' + id;
        default:
    }
    return id;
};
exports.normalizeIdentifier = normalizeIdentifier;
const getAndCheckAtomicalInfo = (electrumApi, atomicalAliasOrId, expectedOwnerAddress, expectedType = 'NFT', expectedSubType = null) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const getLocationCommand = new resolve_command_1.ResolveCommand(electrumApi, atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.LOCATION);
    const getLocationResponse = yield getLocationCommand.run();
    if (!getLocationResponse.success) {
        console.log(JSON.stringify(getLocationResponse, null, 2));
        throw new Error(`Error: Unable to get location.`);
    }
    const atomicalInfo = getLocationResponse.data.result;
    if (expectedType === 'NFT' && atomicalInfo.type !== expectedType) {
        console.log('atomicalInfo', atomicalInfo);
        throw `Atomical is not an type ${expectedType}. It is expected to be an ${expectedType} type. atomicalAliasOrId=${atomicalAliasOrId}`;
    }
    if (expectedType === 'FT' && atomicalInfo.type !== expectedType) {
        console.log('atomicalInfo', atomicalInfo);
        throw `Atomical is not an type ${expectedType}. It is expected to be an ${expectedType} type. atomicalAliasOrId=${atomicalAliasOrId}`;
    }
    if (expectedSubType && atomicalInfo.subtype !== expectedSubType) {
        console.log('atomicalInfo', atomicalInfo);
        throw `Atomical is not subtype ${expectedSubType}. It is expected to be an ${expectedSubType} type. atomicalAliasOrId=${atomicalAliasOrId}`;
    }
    const atomicalDecorated = (0, atomical_format_helpers_1.decorateAtomical)(atomicalInfo);
    let locationInfoObj = atomicalDecorated.location_info_obj;
    let locationInfo = locationInfoObj.locations;
    // Check to make sure that the location is controlled by the same address as supplied by the WIF
    if (!locationInfo || !locationInfo.length || locationInfo[0].address !== expectedOwnerAddress) {
        const address = (_a = locationInfo === null || locationInfo === void 0 ? void 0 : locationInfo[0]) === null || _a === void 0 ? void 0 : _a.address;
        if (address) {
            throw `Atomical is controlled by a different address (${address}) than the provided wallet (${expectedOwnerAddress})`;
        }
        else {
            throw 'Atomical is no longer controlled.';
        }
    }
    locationInfo = locationInfo[0];
    const inputUtxoPartial = (0, address_helpers_1.IsAtomicalOwnedByWalletRecord)(expectedOwnerAddress, atomicalDecorated);
    return {
        atomicalInfo,
        locationInfo,
        inputUtxoPartial
    };
});
exports.getAndCheckAtomicalInfo = getAndCheckAtomicalInfo;
