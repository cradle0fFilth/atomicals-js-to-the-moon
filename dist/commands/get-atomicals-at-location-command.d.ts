import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetAtomicalsAtLocationCommand implements CommandInterface {
    private electrumApi;
    private location;
    constructor(electrumApi: ElectrumApiInterface, location: string);
    run(): Promise<any>;
}
