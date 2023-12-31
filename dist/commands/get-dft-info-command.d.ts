import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetFtInfoCommand implements CommandInterface {
    private electrumApi;
    private atomicalAliasOrId;
    constructor(electrumApi: ElectrumApiInterface, atomicalAliasOrId: string);
    run(): Promise<any>;
}
