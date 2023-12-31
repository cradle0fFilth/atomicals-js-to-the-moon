import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class AddressInfoCommand implements CommandInterface {
    private electrumApi;
    private address;
    private verbose;
    constructor(electrumApi: ElectrumApiInterface, address: string, verbose: boolean);
    run(): Promise<any>;
}
