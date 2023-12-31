import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class SearchContainersCommand implements CommandInterface {
    private electrumApi;
    private prefix;
    private asc?;
    constructor(electrumApi: ElectrumApiInterface, prefix: string, asc?: boolean | undefined);
    run(): Promise<any>;
}
