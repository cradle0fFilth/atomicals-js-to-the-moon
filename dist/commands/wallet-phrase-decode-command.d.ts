import { CommandResultInterface } from "./command-result.interface";
import { CommandInterface } from "./command.interface";
export declare class WalletPhraseDecodeCommand implements CommandInterface {
    private phrase;
    private path;
    constructor(phrase: any, path: any);
    run(): Promise<CommandResultInterface>;
}
