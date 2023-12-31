import { CommandInterface } from "./command.interface";
export declare class CreateDmintItemManifestsCommand implements CommandInterface {
    private folder;
    private outputName;
    constructor(folder: string, outputName: string);
    run(): Promise<any>;
}
