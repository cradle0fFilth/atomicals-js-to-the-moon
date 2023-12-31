import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { AtomicalsGetFetchType, CommandInterface } from "./command.interface";
export declare class GetByTickerCommand implements CommandInterface {
    private electrumApi;
    private ticker;
    private fetchType;
    private verbose?;
    constructor(electrumApi: ElectrumApiInterface, ticker: string, fetchType?: AtomicalsGetFetchType, verbose?: boolean | undefined);
    run(): Promise<any>;
}
