import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class AddressHistoryCommand implements CommandInterface {
    private electrumApi;
    private address;
    constructor(electrumApi: ElectrumApiInterface, address: string);
    run(): Promise<any>;
}
