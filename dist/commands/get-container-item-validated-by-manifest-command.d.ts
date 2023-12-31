import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { AtomicalStatus } from "../interfaces/atomical-status.interface";
export interface ResolvedRealm {
    atomical: AtomicalStatus;
}
export declare class GetContainerItemValidatedByManifestCommand implements CommandInterface {
    private electrumApi;
    private container;
    private requestDmitem;
    private manifestJsonFile;
    constructor(electrumApi: ElectrumApiInterface, container: string, requestDmitem: string, manifestJsonFile: string);
    run(): Promise<any>;
}
