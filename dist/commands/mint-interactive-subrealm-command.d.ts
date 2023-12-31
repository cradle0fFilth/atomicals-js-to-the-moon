import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { AtomicalStatus } from "../interfaces/atomical-status.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
import { BaseRequestOptions } from "../interfaces/api.interface";
export interface ResolvedRealm {
    atomical: AtomicalStatus;
}
export declare class MintInteractiveSubrealmCommand implements CommandInterface {
    private electrumApi;
    private options;
    private requestSubRealm;
    private address;
    private fundingWIF;
    private owner;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, requestSubRealm: string, address: string, fundingWIF: string, owner: IWalletRecord);
    run(): Promise<any>;
}
