import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { FileMap } from "../interfaces/filemap.interface";
export declare const writeFiles: (inputIndexToFilesMap: any, txDir: string) => Promise<FileMap>;
export declare class DownloadCommand implements CommandInterface {
    private electrumApi;
    private atomicalIdOrTxId;
    constructor(electrumApi: ElectrumApiInterface, atomicalIdOrTxId: string);
    run(): Promise<any>;
}
