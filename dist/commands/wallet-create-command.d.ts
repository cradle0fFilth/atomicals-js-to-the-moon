import { CommandResultInterface } from "./command-result.interface";
import { CommandInterface } from "./command.interface";
export declare class WalletCreateCommand implements CommandInterface {
    run(): Promise<CommandResultInterface>;
}
