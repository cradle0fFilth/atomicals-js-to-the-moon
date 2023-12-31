import { CommandInterface } from "./command.interface";
import { FileMap } from "../interfaces/filemap.interface";
export declare function isImage(contentType: string): boolean;
export declare function isText(contentType: string): boolean;
export declare class RenderPreviewsCommand implements CommandInterface {
    private filesmap;
    private body;
    constructor(filesmap: FileMap, body: boolean);
    run(): Promise<any>;
}
