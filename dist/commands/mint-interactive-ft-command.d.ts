import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveFtCommand implements CommandInterface {
    private electrumApi;
    private options;
    private file;
    private supply;
    private address;
    private requestTicker;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, file: string, supply: number, address: string, requestTicker: string, fundingWIF: string);
    run(): Promise<any>;
}
