import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export interface SummaryRealmsCommandResultInterface {
    success: boolean;
    message?: string;
    data?: any;
    error?: any;
}
export interface RealmsSummaryItemInterface {
    atomical_id: string;
    atomical_number: number;
    request_full_realm_name: string;
    full_realm_name?: string;
    status: string;
}
export interface RealmsSummaryItemMapInterface {
    [key: string]: RealmsSummaryItemInterface | any;
}
export declare class SummaryRealmsCommand implements CommandInterface {
    private electrumApi;
    private address;
    private filter?;
    constructor(electrumApi: ElectrumApiInterface, address: string, filter?: string | undefined);
    run(): Promise<any>;
}
