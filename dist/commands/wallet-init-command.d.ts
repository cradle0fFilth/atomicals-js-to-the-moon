import { CommandResultInterface } from "./command-result.interface";
import { CommandInterface } from "./command.interface";
export declare class WalletInitCommand implements CommandInterface {
    private phrase;
    private path;
    private n?;
    constructor(phrase: string | undefined, path: string, n?: number | undefined);
    run(): Promise<CommandResultInterface>;
    walletExists(): Promise<true | undefined>;
}
