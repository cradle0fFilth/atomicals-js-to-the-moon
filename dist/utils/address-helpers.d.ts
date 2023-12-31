/// <reference types="node" />
import { IValidatedWalletInfo } from "./validate-wallet-storage";
import { AtomicalStatus, Location } from "../interfaces/atomical-status.interface";
import { IInputUtxoPartial } from "../types/UTXO.interface";
import { Network } from "bitcoinjs-lib";
export declare function detectAddressTypeToScripthash(address: string): {
    output: string;
    scripthash: string;
    address: string;
};
export declare function detectScriptToAddressType(script: string): string;
export declare function addressToScripthash(address: string): string;
export declare function addressToP2PKH(address: string): string;
export declare function addressToHash160(address: string): string;
export declare function hash160BufToAddress(hash160: Buffer): string;
export declare function hash160HexToAddress(hash160: string): string;
export declare function performAddressAliasReplacement(walletInfo: IValidatedWalletInfo, address: string): any;
/**
 * Whether the atomical for the mint is owned by the provided wallet or not
 * @param ownerRecord The proposed wallet that owns the atomical
 * @param atomical
 * @returns
 */
export declare function IsAtomicalOwnedByWalletRecord(address: string, atomical: AtomicalStatus): IInputUtxoPartial | null;
export declare function GetUtxoPartialFromLocation(addressToCheck: string, location: Location, throwOnMismatch?: boolean): IInputUtxoPartial | null;
export declare enum AddressTypeString {
    p2pkh = "p2pkh",
    p2tr = "p2tr",
    p2sh = "p2sh",
    p2wpkh = "p2wpkh",
    p2wpkh_testnet = "p2wpkh_testnet",
    p2tr_testnet = "p2tr_testnet",
    p2sh_testnet = "p2sh_testnet",
    p2pkh_testnet = "p2pkh_testnet",
    p2tr_regtest = "p2tr_regtest",
    unknown = "unknown"
}
export declare function getAddressType(address: string): AddressTypeString;
export declare function utxoToInput(utxo: any, address: string, publicKey: string, option: {
    override: {
        vout?: number;
        script?: string | Buffer;
    };
}): {
    hash: any;
    index: any;
    witnessUtxo: {
        value: any;
        script: any;
    };
    redeemScript: any;
    tapInternalKey?: undefined;
} | {
    hash: any;
    index: any;
    witnessUtxo: {
        value: any;
        script: any;
    };
    redeemScript?: undefined;
    tapInternalKey?: undefined;
} | {
    hash: any;
    index: any;
    witnessUtxo: {
        value: any;
        script: any;
    };
    tapInternalKey: any;
    redeemScript?: undefined;
} | undefined;
export declare function getNetwork(network?: Network | string): any;
export declare function detectAddressTypeToScripthash2(address: string, network?: Network | string): {
    output: string | Buffer;
    scripthash: string;
    address: string;
};
