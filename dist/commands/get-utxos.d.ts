import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetUtxosCommand implements CommandInterface {
    private electrumApi;
    private address;
    constructor(electrumApi: ElectrumApiInterface, address: string);
    run(): Promise<any>;
}
