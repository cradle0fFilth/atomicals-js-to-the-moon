import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class ServerVersionCommand implements CommandInterface {
    private electrumApi;
    constructor(electrumApi: ElectrumApiInterface);
    run(): Promise<any>;
}
