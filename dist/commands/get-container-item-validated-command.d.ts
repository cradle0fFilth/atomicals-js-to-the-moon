import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
export declare class GetContainerItemValidatedCommand implements CommandInterface {
    private electrumApi;
    private containerName;
    private item;
    private bitworkc;
    private bitworkr;
    private main;
    private mainHash;
    private proof;
    private checkWithoutSealed;
    constructor(electrumApi: ElectrumApiInterface, containerName: any, item: any, bitworkc: any, bitworkr: any, main: string, mainHash: string, proof: string, checkWithoutSealed: boolean);
    run(): Promise<any>;
}
