import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
import { IWalletRecord } from "../utils/validate-wallet-storage";
interface DmintManifestInteface {
    v: string;
    mint_height: number;
    items: number;
    rules: {
        o?: {
            [script: string]: {
                v: number;
                id?: string;
            };
        };
        p: string;
        bitworkc?: string;
        bitworkr?: string;
    }[];
}
export declare function validateDmint(obj: {
    dmint?: DmintManifestInteface;
} | undefined): boolean;
export declare class SetContainerDmintInteractiveCommand implements CommandInterface {
    private electrumApi;
    private options;
    private containerName;
    private filename;
    private owner;
    private funding;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, containerName: string, filename: string, owner: IWalletRecord, funding: IWalletRecord);
    run(): Promise<any>;
}
export {};
