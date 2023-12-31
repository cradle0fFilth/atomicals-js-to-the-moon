import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class TxCommand implements CommandInterface {
    private electrumApi;
    private txid;
    private verbose;
    constructor(electrumApi: ElectrumApiInterface, txid: string, verbose: boolean);
    run(): Promise<any>;
}
