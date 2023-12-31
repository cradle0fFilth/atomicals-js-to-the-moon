import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveDitemCommand implements CommandInterface {
    private electrumApi;
    private options;
    private container;
    private requestDmitem;
    private manifestJsonFile;
    private address;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, container: string, requestDmitem: string, manifestJsonFile: string, address: string, fundingWIF: string);
    run(): Promise<any>;
}
