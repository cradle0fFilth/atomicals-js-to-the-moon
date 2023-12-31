import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveContainerCommand implements CommandInterface {
    private electrumApi;
    private options;
    private requestContainer;
    private address;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, requestContainer: string, address: string, fundingWIF: string);
    run(): Promise<any>;
}
