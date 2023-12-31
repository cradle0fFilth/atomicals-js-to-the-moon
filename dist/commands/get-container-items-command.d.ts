import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetContainerItems implements CommandInterface {
    private electrumApi;
    private container;
    private limit;
    private offset;
    constructor(electrumApi: ElectrumApiInterface, container: string, limit: number, offset: number);
    run(): Promise<any>;
}
