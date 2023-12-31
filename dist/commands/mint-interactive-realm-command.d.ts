import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveRealmCommand implements CommandInterface {
    private electrumApi;
    private options;
    private requestRealm;
    private address;
    private fundingWIF;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, requestRealm: string, address: string, fundingWIF: string);
    run(): Promise<any>;
}
