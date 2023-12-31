import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
export declare class SplatInteractiveCommand implements CommandInterface {
    private electrumApi;
    private options;
    private locationId;
    private owner;
    private funding;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, locationId: string, owner: IWalletRecord, funding: IWalletRecord);
    run(): Promise<any>;
}
