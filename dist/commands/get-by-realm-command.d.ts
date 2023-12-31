import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { AtomicalsGetFetchType, CommandInterface } from "./command.interface";
export declare class GetByRealmCommand implements CommandInterface {
    private electrumApi;
    private realm;
    private fetchType;
    private verbose?;
    constructor(electrumApi: ElectrumApiInterface, realm: string, fetchType?: AtomicalsGetFetchType, verbose?: boolean | undefined);
    run(): Promise<any>;
}
