import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { AtomicalStatus } from "../interfaces/atomical-status.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
import { BaseRequestOptions } from "../interfaces/api.interface";
export interface ResolvedRealm {
    atomical: AtomicalStatus;
}
/**
 * Mints a subrealm with the assumption that the `owner` wallet owns the parent atomical
 */
export declare class MintInteractiveSubrealmDirectCommand implements CommandInterface {
    private electrumApi;
    private requestSubrealm;
    private nearestParentAtomicalId;
    private address;
    private fundingWIF;
    private owner;
    private options;
    constructor(electrumApi: ElectrumApiInterface, requestSubrealm: string, nearestParentAtomicalId: string, address: string, fundingWIF: string, owner: IWalletRecord, options: BaseRequestOptions);
    run(): Promise<any>;
}
