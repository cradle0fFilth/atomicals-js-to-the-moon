import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { KeyPairInfo } from "../utils/address-keypair-path";
import { IValidatedWalletInfo } from "../utils/validate-wallet-storage";
import { BaseRequestOptions } from "../interfaces/api.interface";
export interface IUtxoBalanceSummary {
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
    address?: string;
    opReturn?: string;
    value: number;
}
export interface IBalanceInfo {
    utxos: Array<{
        txid: string;
        script: any;
        value: number;
        index: number;
    }>;
}
export interface TransferConfigInterface {
    balanceInfo: IBalanceInfo;
    selectedUtxos: ISelectedUtxo[];
    outputs: Array<AmountToSend>;
}
export declare class TransferInteractiveBuilderCommand implements CommandInterface {
    private electrumApi;
    private options;
    private currentOwnerAtomicalWIF;
    private fundingWIF;
    private validatedWalletInfo;
    private satsbyte;
    private nofunding;
    private atomicalIdReceipt?;
    private atomicalIdReceiptType?;
    private forceSkipValidation?;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, currentOwnerAtomicalWIF: string, fundingWIF: string, validatedWalletInfo: IValidatedWalletInfo, satsbyte: number, nofunding: boolean, atomicalIdReceipt?: string | undefined, atomicalIdReceiptType?: string | undefined, forceSkipValidation?: boolean | undefined);
    run(): Promise<any>;
    promptTransferOptions(address: any): Promise<TransferConfigInterface>;
    promptIfDetectedSomeAtomicalsAtSameUtxos(selectedUtxos: ISelectedUtxo[]): Promise<void>;
    promptUtxoSelection(info: IUtxoBalanceSummary): Promise<ISelectedUtxo[]>;
    promptContinue(info: IUtxoBalanceSummary, selectedUtxos: ISelectedUtxo[]): Promise<void>;
    getUtxoBalanceSummary(address: any): Promise<IUtxoBalanceSummary>;
    promptAmountsToSend(validatedWalletInfo: IValidatedWalletInfo, availableBalance: any): Promise<AmountToSend[]>;
    buildAndSendTransaction(transferOptions: TransferConfigInterface, keyPairAtomical: KeyPairInfo, keyPairFunding: KeyPairInfo, satsbyte: any): Promise<any>;
    accumulateAsc(amount: number, utxos: any[]): any[];
    accumulateDesc(amount: number, utxos: any[]): any[];
}
