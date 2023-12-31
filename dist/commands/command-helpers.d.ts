/// <reference types="node" />
import { AtomicalFileData } from "../interfaces/atomical-file-data";
import { networks, payments } from "bitcoinjs-lib";
import { KeyPairInfo } from "../utils/address-keypair-path";
import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { AtomicalIdentifierType } from "../utils/atomical-format-helpers";
import { IInputUtxoPartial } from "../types/UTXO.interface";
export declare const RBF_INPUT_SEQUENCE = 4294967293;
export declare const NETWORK: networks.Network;
export declare function logBanner(text: string): void;
export declare const calculateFundsRequired: (additionalInputValue: number, atomicalSats: number, satsByte: number, mintDataLength?: number, baseTxByteLength?: number) => {
    expectedSatoshisDeposit: number;
    expectedFee: number;
};
export declare const calculateFTFundsRequired: (numberOfInputs: any, numberOfOutputs: any, satsByte: number, mintDataLength?: number, baseTxByteLength?: number) => {
    expectedSatoshisDeposit: number;
};
export declare const calculateUtxoFundsRequired: (numberOfInputs: any, numberOfOutputs: any, satsByte: number, mintDataLength?: number, baseTxByteLength?: number) => {
    expectedSatoshisDeposit: number;
};
export declare const appendMintUpdateRevealScript2: (opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt', keypair: KeyPairInfo, files: AtomicalFileData[], log?: boolean) => string;
export declare const prepareCommitRevealConfig2: (opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt', keypair: KeyPairInfo, filesData: AtomicalFileData[], log?: boolean) => {
    scriptP2TR: payments.Payment;
    hashLockP2TR: payments.Payment;
};
export declare const prepareCommitRevealConfig: (opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt' | 'dat', keypair: KeyPairInfo, atomicalsPayload: AtomicalsPayload, log?: boolean) => {
    scriptP2TR: payments.Payment;
    hashLockP2TR: payments.Payment;
    hashscript: Buffer;
};
export declare const readAsAtomicalFileData: (file: string, alternateName?: string) => Promise<AtomicalFileData>;
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
export declare const prepareFilesData: (fields: string[]) => Promise<AtomicalFileData[]>;
export declare const readFileAsCompleteDataObject: (filePath: any, givenFileName: any) => Promise<{
    [x: number]: any;
}>;
export declare const prepareFilesDataAsObject: (fields: string[], disableAutoncode?: boolean) => Promise<{}>;
export declare const readJsonFileAsCompleteDataObjectEncodeAtomicalIds: (jsonFile: any, autoEncode?: boolean, autoEncodePattern?: string) => Promise<any>;
export declare const readJsonFileAsCompleteDataObjectEncodeHash: (jsonFile: any, autoEncode?: boolean, autoEncodePattern?: string) => Promise<any>;
export declare const prepareFilesDataBackup: (files: string[], names: string[]) => Promise<AtomicalFileData[]>;
export declare const prepareObjectfield: (filesData: AtomicalFileData[], objectToAdd: any) => Promise<AtomicalFileData[]>;
export declare const prepareArgsMetaCtx: (args?: any, meta?: any, ctx?: any, log?: boolean) => Promise<AtomicalFileData[]>;
export declare const encodeFiles: (files: AtomicalFileData[]) => any;
/**
 * Ensure provided object is restricted to the set of allowable datatypes to be CBOR atomicals friendly.
 *
 */
export declare class AtomicalsPayload {
    private originalData;
    private cborEncoded;
    constructor(originalData: any);
    get(): any;
    cbor(): any;
}
export declare const appendMintUpdateRevealScript: (opType: 'nft' | 'ft' | 'dft' | 'dmt' | 'sl' | 'x' | 'y' | 'mod' | 'evt' | 'dat', keypair: KeyPairInfo, payload: AtomicalsPayload, log?: boolean) => string;
export declare const guessPrefixType: (id: any) => any;
export declare const normalizeIdentifier: (id: any, expectedType?: AtomicalIdentifierType) => any;
export declare const getAndCheckAtomicalInfo: (electrumApi: ElectrumApiInterface, atomicalAliasOrId: any, expectedOwnerAddress: string, expectedType?: string, expectedSubType?: any) => Promise<{
    atomicalInfo: any;
    locationInfo: any;
    inputUtxoPartial: IInputUtxoPartial;
}>;
