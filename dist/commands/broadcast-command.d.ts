import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class BroadcastCommand implements CommandInterface {
    private electrumApi;
    private rawtx;
    constructor(electrumApi: ElectrumApiInterface, rawtx: string);
    run(): Promise<any>;
}
