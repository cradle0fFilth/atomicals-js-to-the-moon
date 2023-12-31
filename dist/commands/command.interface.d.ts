import { CommandResultInterface } from "./command-result.interface";
export declare enum AtomicalsGetFetchType {
    GET = "GET",
    LOCATION = "LOCATION",
    STATE = "STATE",
    STATE_HISTORY = "STATE_HISTORY",
    EVENT_HISTORY = "EVENT_HISTORY",
    TX_HISTORY = "TX_HISTORY"
}
export interface CommandInterface {
    run: () => Promise<CommandResultInterface>;
}
