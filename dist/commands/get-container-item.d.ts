import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetContainerItemCommand implements CommandInterface {
    private electrumApi;
    private containerName;
    private item;
    constructor(electrumApi: ElectrumApiInterface, containerName: any, item: any);
    run(): Promise<any>;
}
