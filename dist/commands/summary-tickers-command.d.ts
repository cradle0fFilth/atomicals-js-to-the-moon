import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export interface SummaryTickersCommandResultInterface {
    success: boolean;
    message?: string;
    data?: any;
    error?: any;
}
export interface TickersSummaryItemInterface {
    atomical_id: string;
    atomical_number: number;
    ticker?: string;
    status: string;
}
export interface TickersSummaryItemMapInterface {
    [key: string]: TickersSummaryItemInterface | any;
}
export declare class SummaryTickersCommand implements CommandInterface {
    private electrumApi;
    private address;
    private filter?;
    constructor(electrumApi: ElectrumApiInterface, address: string, filter?: string | undefined);
    run(): Promise<any>;
}
