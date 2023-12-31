import { CommandInterface } from "./command.interface";
export declare class CreateDmintCommand implements CommandInterface {
    private folder;
    private mintHeight;
    private bitworkc;
    constructor(folder: string, mintHeight: number, bitworkc: string);
    run(): Promise<any>;
}
