import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export interface GetSubrealmInfoCommandResultInterface {
    success: boolean;
    data?: {};
    message?: any;
    error?: any;
}
export declare class GetRealmInfoCommand implements CommandInterface {
    private electrumApi;
    private realmOrSubrealm;
    private verbose?;
    constructor(electrumApi: ElectrumApiInterface, realmOrSubrealm: any, verbose?: boolean | undefined);
    run(): Promise<any>;
}
