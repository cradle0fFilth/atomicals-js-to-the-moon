import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { AtomicalsGetFetchType, CommandInterface } from "./command.interface";
export declare class GetByContainerCommand implements CommandInterface {
    private electrumApi;
    private container;
    private fetchType;
    private verbose?;
    constructor(electrumApi: ElectrumApiInterface, container: string, fetchType?: AtomicalsGetFetchType, verbose?: boolean | undefined);
    run(): Promise<any>;
}
