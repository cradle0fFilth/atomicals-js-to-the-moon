/**
MIT License

Copyright (c) 2023 The Atomicals Developers - atomicals.xyz

Parts of this file contains code created by the following users:
https://github.com/danieleth2/atomicals-js/commit/02e854cc71c0f6c6559ff35c2093dc8d526b5d72

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { KeyPairInfo } from "./address-keypair-path";
import { IInputUtxoPartial } from "../types/UTXO.interface";
import { IWalletRecord } from "./validate-wallet-storage";
export declare const DEFAULT_SATS_BYTE = 10;
export declare const DEFAULT_SATS_ATOMICAL_UTXO = 1000;
export declare const SEND_RETRY_SLEEP_SECONDS = 15;
export declare const SEND_RETRY_ATTEMPTS = 20;
export declare const DUST_AMOUNT = 546;
export declare const BASE_BYTES = 10.5;
export declare const INPUT_BYTES_BASE = 57.5;
export declare const OUTPUT_BYTES_BASE = 43;
export declare const MAX_SEQUENCE = 4294967295;
export declare const EXCESSIVE_FEE_LIMIT: number;
export declare enum REALM_CLAIM_TYPE {
    DIRECT = "direct",
    RULE = "rule"
}
export interface ParentInputAtomical {
    parentId: string;
    parentUtxoPartial: IInputUtxoPartial;
    parentKeyInfo: KeyPairInfo;
}
export interface FeeCalculations {
    commitAndRevealFeePlusOutputs: number;
    commitAndRevealFee: number;
    revealFeePlusOutputs: number;
    commitFeeOnly: number;
    revealFeeOnly: number;
}
export declare enum REQUEST_NAME_TYPE {
    NONE = "NONE",
    CONTAINER = "CONTAINER",
    TICKER = "TICKER",
    REALM = "REALM",
    SUBREALM = "SUBREALM",
    ITEM = "ITEM"
}
export interface AtomicalOperationBuilderOptions {
    electrumApi: ElectrumApiInterface;
    rbf?: boolean;
    satsbyte?: number;
    address: string;
    opType: "nft" | "ft" | "dft" | "dmt" | "dat" | "mod" | "evt" | "sl" | "x" | "y";
    requestContainerMembership?: string;
    bitworkc?: string;
    bitworkr?: string;
    disableMiningChalk?: boolean;
    meta?: string[] | any;
    init?: string[] | any;
    ctx?: string[] | any;
    verbose?: boolean;
    nftOptions?: {
        satsoutput: number;
    };
    datOptions?: {
        satsoutput: number;
    };
    ftOptions?: {
        fixedSupply: number;
        ticker: string;
    };
    dftOptions?: {
        maxMints: number;
        mintAmount: number;
        mintHeight: number;
        ticker: string;
        mintBitworkr?: string;
    };
    dmtOptions?: {
        mintAmount: number;
        ticker: string;
    };
    skipOptions?: {};
    splatOptions?: {
        satsoutput: number;
    };
}
export declare class AtomicalOperationBuilder {
    private options;
    private userDefinedData;
    private containerMembership;
    private bitworkInfoCommit;
    private bitworkInfoReveal;
    private requestName;
    private requestParentId;
    private requestNameType;
    private meta;
    private args;
    private init;
    private ctx;
    private parentInputAtomical;
    private inputUtxos;
    private additionalOutputs;
    constructor(options: AtomicalOperationBuilderOptions);
    setRBF(value: boolean): void;
    setRequestContainer(name: string): void;
    setRequestRealm(name: string): void;
    setRequestSubrealm(name: string, parentRealmId: string, realmClaimType: REALM_CLAIM_TYPE): void;
    setRequestItem(itemId: string, parentContainerId: string): void;
    setRequestTicker(name: string): void;
    /**
     * For each array element do:
     *
     * - determine if it's a file, or a file with an alias, or a scalar/json object type
     *
     * @param fieldTypeHints The type hint string array
     */
    static getDataObjectFromStringTypeHints(fieldTypeHints: string[]): Promise<{}>;
    setData(data: any, log?: boolean): void;
    getData(): any | null;
    setArgs(args: any): void;
    getArgs(): any;
    private setInit;
    getInit(): any;
    private setMeta;
    getMeta(): any;
    private setCtx;
    getCtx(): any;
    setContainerMembership(containerName: string | null | undefined): void;
    setBitworkCommit(bitworkString: string | undefined): void;
    setBitworkReveal(bitworkString: string | undefined): void;
    /**
     *
     * @param utxoPartial The UTXO to spend in the constructed tx
     * @param wif The signing WIF key for the utxo
     */
    addInputUtxo(utxoPartial: IInputUtxoPartial, wif: string): void;
    /**
     * Set an input parent for linking with $parent reference of the operation to an input spend
     */
    setInputParent(input: ParentInputAtomical): void;
    private getInputParent;
    /**
     * Additional output to add, to be used with addInputUtxo normally
     * @param output Output to add
     */
    addOutput(output: {
        address: string;
        value: number;
    }): void;
    isEmpty(obj: any): boolean;
    sleep(ms: number): Promise<unknown>;
    addInputCvt(input: any, tx1: any): void;
    addOutputCvt(output: any, tx1: any): void;
    toXOnly: (publicKey: any) => any;
    start(fundingWIF: string): Promise<any>;
    broadcastWithRetries(rawtx: string): Promise<any>;
    static translateFromBase32ToHex(bitwork: string): string;
    totalOutputSum(): number;
    getTotalAdditionalInputValues(): number;
    getTotalAdditionalOutputValues(): number;
    calculateAmountRequiredForReveal(hashLockP2TROutputLen?: number): number;
    calculateFeesRequiredForCommit(): number;
    getOutputValueForCommit(fees: FeeCalculations): number;
    getAdditionalFundingRequiredForReveal(): number | null;
    /**
     * Get the commit and reveal fee. The commit fee assumes it is chained together
     * @returns
     */
    calculateFeesRequiredForAccumulatedCommitAndReveal(hashLockP2TROutputLen?: number): FeeCalculations;
    /**
     * Adds an extra output at the end if it was detected there would be excess satoshis for the reveal transaction
     * @param fee Fee calculations
     * @returns
     */
    addRevealOutputIfChangeRequired(totalInputsValue: number, totalOutputsValue: number, revealFee: number, address: string): void;
    /**
     * Adds an extra output at the end if it was detected there would be excess satoshis for the reveal transaction
     * @param fee Fee calculations
     * @returns
     */
    addCommitChangeOutputIfRequired(extraInputValue: number, fee: FeeCalculations, pbst: any, address: string): void;
    /**
     * a final safety check to ensure we don't accidentally broadcast a tx with too high of a fe
     * @param psbt Partially signed bitcoin tx coresponding to the tx to calculate the total inputs values provided
     * @param tx The tx to broadcast, uses the outputs to calculate total outputs
     */
    static finalSafetyCheckForExcessiveFee(psbt: any, tx: any): void;
    /**
     * Helper function to resolve a parent atomical id and the wallet record into a format that's easily processable by setInputParent
     * @param electrumxApi
     * @param parentId
     * @param parentOwner
     */
    static resolveInputParent(electrumxApi: ElectrumApiInterface, parentId: any, parentOwner: IWalletRecord): Promise<ParentInputAtomical>;
}
