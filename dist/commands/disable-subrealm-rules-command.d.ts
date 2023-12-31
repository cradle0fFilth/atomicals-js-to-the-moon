import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
export declare class DisableSubrealmRulesInteractiveCommand implements CommandInterface {
    private electrumApi;
    private options;
    private atomicalId;
    private funding;
    private owner;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, atomicalId: string, funding: IWalletRecord, owner: IWalletRecord);
    run(): Promise<any>;
}
