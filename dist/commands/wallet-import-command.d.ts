import { CommandResultInterface } from "./command-result.interface";
import { CommandInterface } from "./command.interface";
export declare class WalletImportCommand implements CommandInterface {
    private wif;
    private alias;
    constructor(wif: string, alias: string);
    run(): Promise<CommandResultInterface>;
    walletExists(): Promise<true | undefined>;
}
