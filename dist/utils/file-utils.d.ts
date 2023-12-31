export declare const fileReader: (filePath: any, encoding?: any) => Promise<unknown>;
export declare const jsonFileReader: (filePath: any) => Promise<unknown>;
export declare const jsonFileWriter: (filePath: any, data: any) => Promise<unknown>;
export declare const fileWriter: (filePath: any, data: any) => Promise<unknown>;
export declare const jsonFileExists: (filePath: any) => Promise<unknown>;
export declare function chunkBuffer(buffer: any, chunkSize: number): any;
