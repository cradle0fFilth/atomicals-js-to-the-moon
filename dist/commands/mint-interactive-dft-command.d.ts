import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveDftCommand implements CommandInterface {
    private electrumApi;
    private options;
    private address;
    private ticker;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, address: string, ticker: string, fundingWIF: string);
    run(): Promise<any>;
}
