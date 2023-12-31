import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetGlobalCommand implements CommandInterface {
    private electrumApi;
    private hashes;
    constructor(electrumApi: ElectrumApiInterface, hashes: number);
    run(): Promise<any>;
}
