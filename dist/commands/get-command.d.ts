import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { AtomicalsGetFetchType, CommandInterface } from "./command.interface";
export declare class GetCommand implements CommandInterface {
    private electrumApi;
    private atomicalAliasOrId;
    private fetchType;
    private verbose?;
    constructor(electrumApi: ElectrumApiInterface, atomicalAliasOrId: string, fetchType?: AtomicalsGetFetchType, verbose?: boolean | undefined);
    run(): Promise<any>;
}
