import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class InitInteractiveDftCommand implements CommandInterface {
    private electrumApi;
    private options;
    private file;
    private address;
    private requestTicker;
    private mintAmount;
    private maxMints;
    private mintHeight;
    private mintBitworkc;
    private mintBitworkr;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, file: string, address: string, requestTicker: string, mintAmount: number, maxMints: number, mintHeight: number, mintBitworkc: string | null, mintBitworkr: string | null, fundingWIF: string);
    run(): Promise<any>;
}
