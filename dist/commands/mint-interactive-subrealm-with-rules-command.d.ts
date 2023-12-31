import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export declare class MintInteractiveSubrealmWithRulesCommand implements CommandInterface {
    private electrumApi;
    private requestSubrealm;
    private nearestParentAtomicalId;
    private address;
    private fundingWIF;
    private options;
    constructor(electrumApi: ElectrumApiInterface, requestSubrealm: string, nearestParentAtomicalId: string, address: string, fundingWIF: string, options: BaseRequestOptions);
    run(): Promise<any>;
}
