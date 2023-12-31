import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { KeyPairInfo } from "../utils/address-keypair-path";
import { IValidatedWalletInfo } from "../utils/validate-wallet-storage";
import { BaseRequestOptions } from "../interfaces/api.interface";
export interface IAtomicalBalanceSummary {
    confirmed: number;
    type: 'FT' | 'NFT';
    atomical_number?: number;
    atomical_id?: number;
    $ticker?: string;
    $container?: string;
    $realm?: string;
    utxos: any[];
}
export interface ISelectedUtxo {
    txid: string;
    index: number;
    value: number;
    script: any;
    atomicals: string[];
}
export interface AmountToSend {
    address: string;
    value: number;
}
export interface IAtomicalsInfo {
    confirmed: number;
    type: 'FT' | 'NFT';
    utxos: Array<{
        txid: string;
        script: any;
        value: number;
        index: number;
    }>;
}
export interface TransferFtConfigInterface {
    atomicalsInfo: IAtomicalsInfo;
    selectedUtxos: ISelectedUtxo[];
    outputs: Array<AmountToSend>;
}
export declare class TransferInteractiveFtCommand implements CommandInterface {
    private electrumApi;
    private options;
    private atomicalAliasOrId;
    private currentOwnerAtomicalWIF;
    private fundingWIF;
    private validatedWalletInfo;
    private satsbyte;
    private nofunding;
    private atomicalIdReceipt?;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, atomicalAliasOrId: string, currentOwnerAtomicalWIF: string, fundingWIF: string, validatedWalletInfo: IValidatedWalletInfo, satsbyte: number, nofunding: boolean, atomicalIdReceipt?: string | undefined);
    run(): Promise<any>;
    promptTransferOptions(atomicalId: string, address: any): Promise<TransferFtConfigInterface>;
    promptIfDetectedMultipleAtomicalsAtSameUtxos(atomicalId: string, selectedUtxos: ISelectedUtxo[]): Promise<void>;
    promptUtxoSelection(info: IAtomicalBalanceSummary): Promise<ISelectedUtxo[]>;
    promptContinue(info: IAtomicalBalanceSummary, selectedUtxos: ISelectedUtxo[]): Promise<void>;
    getBalanceSummary(atomicalId: any, address: any): Promise<IAtomicalBalanceSummary>;
    promptAmountsToSend(validatedWalletInfo: IValidatedWalletInfo, availableBalance: any): Promise<AmountToSend[]>;
    buildAndSendTransaction(transferOptions: TransferFtConfigInterface, keyPairAtomical: KeyPairInfo, keyPairFunding: KeyPairInfo, satsbyte: any): Promise<any>;
    accumulateAsc(amount: number, utxos: any[]): any[];
    accumulateDesc(amount: number, utxos: any[]): any[];
}
