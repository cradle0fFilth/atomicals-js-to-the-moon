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
exports.chunkBuffer = exports.jsonFileExists = exports.fileWriter = exports.jsonFileWriter = exports.jsonFileReader = exports.fileReader = void 0;
const fs = require("fs");
const fileReader = (filePath, encoding) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, fileData) => {
            if (err) {
                console.log(`Error reading ${filePath}`, err);
                return reject(err);
            }
            try {
                return resolve(fileData);
            }
            catch (err) {
                console.log(`Error reading ${filePath}`, err);
                return reject(null);
            }
        });
    });
});
exports.fileReader = fileReader;
const jsonFileReader = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, fileData) => {
            if (err) {
                console.log(`Error reading ${filePath}`, err);
                return reject(err);
            }
            try {
                const object = JSON.parse(fileData);
                return resolve(object);
            }
            catch (err) {
                console.log(`Error reading ${filePath}`, err);
                return reject(null);
            }
        });
    });
});
exports.jsonFileReader = jsonFileReader;
const jsonFileWriter = (filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, Buffer.from(JSON.stringify(data, null, 2)), 'utf8', function (err) {
            if (err) {
                console.log('jsonFileWriter', err);
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
});
exports.jsonFileWriter = jsonFileWriter;
/*

export const jsonFileWriter = async (filePath, data) => {

    return new Promise(function (resolve, reject) {
        const stringifyStream = json.createStringifyStream({
            body: data
        });
        var fd = fs.openSync(filePath, 'w');

        fs.closeSync(fs.openSync(filePath, 'w'));

        stringifyStream.on('data', function (strChunk) {
            fs.appendFile(filePath, strChunk, function (err) {
                if (err) throw err;
            })
        });
        stringifyStream.on('end', function () {
            resolve(true);
        })
    });

};

const json = require('big-json');
 
// pojo will be sent out in JSON chunks written to the specified file name in the root
function makeFile(filename, pojo){

    const stringifyStream = json.createStringifyStream({
        body: pojo
    });

    stringifyStream.on('data', function(strChunk) {
        fs.appendFile(filename, strChunk, function (err) {
            if (err) throw err;
        })
    });

}

*/
const fileWriter = (filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filePath, data, 'utf8', function (err) {
            if (err) {
                console.log('fileWriter', err);
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
});
exports.fileWriter = fileWriter;
const jsonFileExists = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(function (resolve, reject) {
        fs.exists(filePath, function (exists) {
            resolve(exists);
        });
    });
});
exports.jsonFileExists = jsonFileExists;
function chunkBuffer(buffer, chunkSize) {
    assert(!isNaN(chunkSize) && chunkSize > 0, 'Chunk size should be positive number');
    const result = [];
    const len = buffer.byteLength;
    let i = 0;
    while (i < len) {
        result.push(buffer.slice(i, i += chunkSize));
    }
    return result;
}
exports.chunkBuffer = chunkBuffer;
function assert(cond, err) {
    if (!cond) {
        throw new Error(err);
    }
}
