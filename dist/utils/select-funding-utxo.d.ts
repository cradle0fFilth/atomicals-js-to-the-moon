import { type ElectrumApiInterface } from "../api/electrum-api.interface";
import { type UTXO } from "../types/UTXO.interface";
export declare const getInputUtxoFromTxid: (utxo: UTXO, electrumx: ElectrumApiInterface) => Promise<UTXO>;
export declare const getFundingSelectedUtxo: (address: string, minFundingSatoshis: number, electrumx: ElectrumApiInterface) => Promise<any>;
/**
     * Gets a funding UTXO and also displays qr code for quick deposit
     * @param electrumxApi
     * @param address
     * @param amount
     * @returns
     */
export declare const getFundingUtxo: (electrumxApi: any, address: string, amount: number, suppressDepositAddressInfo?: boolean, seconds?: number) => Promise<any>;
