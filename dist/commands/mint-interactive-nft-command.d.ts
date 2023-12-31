import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveNftCommand implements CommandInterface {
    private electrumApi;
    private options;
    private files;
    private address;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, files: string[], address: string, fundingWIF: string);
    run(): Promise<any>;
}
