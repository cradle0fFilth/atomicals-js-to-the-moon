import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
export declare class EnableSubrealmRulesCommand implements CommandInterface {
    private electrumApi;
    private options;
    private atomicalId;
    private file;
    private funding;
    private owner;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, atomicalId: string, file: string, funding: IWalletRecord, owner: IWalletRecord);
    run(): Promise<any>;
}
