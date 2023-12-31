import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveDatCommand implements CommandInterface {
    private electrumApi;
    private options;
    private filepath;
    private givenFileName;
    private address;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, filepath: string, givenFileName: string, address: string, fundingWIF: string);
    run(): Promise<any>;
}
