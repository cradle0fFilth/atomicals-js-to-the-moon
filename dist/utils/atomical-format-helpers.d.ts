/// <reference types="node" />
import { AtomicalStatus } from '../interfaces/atomical-status.interface';
import { BaseRequestOptions } from '../interfaces/api.interface';
export declare enum AtomicalIdentifierType {
    ATOMICAL_ID = "ATOMICAL_ID",
    ATOMICAL_NUMBER = "ATOMICAL_NUMBER",
    REALM_NAME = "REALM_NAME",
    CONTAINER_NAME = "CONTAINER_NAME",
    TICKER_NAME = "TICKER_NAME"
}
export interface AtomicalResolvedIdentifierReturn {
    type: AtomicalIdentifierType;
    providedIdentifier: any;
    realmName?: string;
    containerName?: string;
    tickerName?: string;
}
export declare const isObject: (p: any) => boolean;
export declare const encodeAtomicalIdToBinaryElementHex: (v: any) => {
    $b: string;
};
export declare const encodeAtomicalIdToBuffer: (v: any) => any;
export declare const encodeHashToBuffer: (v: any) => Buffer;
export declare const encodeIds: (jsonObject: any, updatedObject: any, atomicalIdEncodingFunc: any, otherEncodingFunc: any, autoEncodePattern?: string) => any;
/** Checks whether a string is an atomicalId, realm/subrealm name, container or ticker */
export declare const getAtomicalIdentifierType: (providedIdentifier: any) => AtomicalResolvedIdentifierReturn;
export declare function isAtomicalId(atomicalId: any): false | {
    txid: any;
    index: number;
    atomicalId: any;
} | null;
export declare function getTxIdFromAtomicalId(atomicalId: string): string;
export declare function getIndexFromAtomicalId(atomicalId: string): number;
export declare function outpointToCompactId(outpointHex: string): string;
/** Convert a location_id or atomical_id to the outpoint (36 bytes hex string) */
export declare function compactIdToOutpoint(locationId: string): string;
export declare function compactIdToOutpointBytesAndHex(locationId: string): {
    buf: any;
    hex: string;
};
export declare function parseAtomicalsDataDefinitionOperation(opType: any, script: any, n: any, hexify?: boolean, addUtf8?: boolean): {
    opType: any;
    rawdata: any;
    decoded: {};
};
export declare function extractFileFromInputWitness(inputWitness: any[], hexify?: boolean, addUtf8?: boolean, markerSentinel?: string): any;
export declare function buildAtomicalsFileMapFromRawTx(rawtx: string, hexify?: boolean, addUtf8?: boolean, markerSentinel?: string): any;
export declare function decodePayloadCBOR(payload: any, hexify?: boolean, addUtf8?: boolean): any;
export declare const isBitworkRefBase32Prefix: (bitwork: any) => string | null;
export declare const isBitworkHexPrefix: (bitwork: any) => boolean;
export declare const isValidBitworkHex: (bitwork: any) => void;
export declare const hasAtomicalType: (type: string, atomicals: any[]) => any;
export declare const hasValidBitwork: (txid: any, bitwork: string, bitworkx: number) => boolean;
export interface BitworkInfo {
    input_bitwork: string;
    hex_bitwork: string;
    prefix: string;
    ext: number | undefined;
}
export declare const checkBaseRequestOptions: (options: any) => BaseRequestOptions;
export declare const isValidBitworkMinimum: (bitworkc: any) => void;
export declare const isValidBitworkConst: (bitwork_val: any) => boolean;
export declare const isValidBitworkString: (fullstring: any, safety?: boolean) => BitworkInfo | null;
export declare const isValidNameBase: (name: string, isTLR?: boolean) => boolean;
export declare const isValidDmitemName: (name: string) => boolean;
export declare const isValidContainerName: (name: string) => boolean;
export declare const isValidRealmName: (name: string) => boolean;
export declare const isValidSubRealmName: (name: string) => boolean;
export declare const isValidTickerName: (name: string) => boolean;
export declare function hexifyObjectWithUtf8(obj: any, utf8?: boolean): any;
export declare function expandDataDecoded(record: any, hexify?: boolean, addUtf8?: boolean): any;
export declare function expandLocationInfo(record: AtomicalStatus): AtomicalStatus;
export declare function expandMintBlockInfo(record: any): any;
export declare function decorateAtomicals(records: any, addUtf8?: boolean): any;
export declare function decorateAtomical(item: any, addUtf8?: boolean): any;
/**
 * validates that the rules matches a valid format
 * @param object The object which contains the 'rules' field
 */
export declare function validateSubrealmRulesObject(topobject: any): void;
