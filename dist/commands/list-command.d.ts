import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class ListCommand implements CommandInterface {
    private electrumApi;
    private limit;
    private offset;
    private asc;
    constructor(electrumApi: ElectrumApiInterface, limit: number, offset: number, asc: boolean);
    run(): Promise<any>;
}
