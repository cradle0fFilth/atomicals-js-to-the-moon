import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class SealInteractiveCommand implements CommandInterface {
    private electrumApi;
    private options;
    private atomicalId;
    private owner;
    private funding;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, atomicalId: string, owner: IWalletRecord, funding: IWalletRecord);
    run(): Promise<any>;
}
