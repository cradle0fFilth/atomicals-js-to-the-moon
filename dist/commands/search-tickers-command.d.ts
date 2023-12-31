import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class SearchTickersCommand implements CommandInterface {
    private electrumApi;
    private prefix;
    private asc?;
    constructor(electrumApi: ElectrumApiInterface, prefix: string | null, asc?: boolean | undefined);
    run(): Promise<any>;
}
