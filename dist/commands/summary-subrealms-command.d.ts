import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export interface SummarySubrealmsCommandResultInterface {
    success: boolean;
    message?: string;
    data?: any;
    error?: any;
}
export interface SubrealmSummaryItemInterface {
    atomical_id: string;
    atomical_number: number;
    request_full_realm_name: string;
    full_realm_name?: string;
    status: string;
}
export interface SubrealmSummaryItemMapInterface {
    [key: string]: SubrealmSummaryItemInterface | any;
}
export declare class SummarySubrealmsCommand implements CommandInterface {
    private electrumApi;
    private address;
    private filter?;
    constructor(electrumApi: ElectrumApiInterface, address: string, filter?: string | undefined);
    run(): Promise<any>;
}
