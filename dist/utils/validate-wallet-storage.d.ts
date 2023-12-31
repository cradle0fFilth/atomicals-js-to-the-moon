export interface IWalletRecord {
    address: string;
    WIF: string;
    childNode?: any;
}
export interface IValidatedWalletInfo {
    primary: IWalletRecord;
    funding: IWalletRecord;
    imported: {
        [alias: string]: IWalletRecord;
    };
}
export declare const validateWalletStorage: () => Promise<IValidatedWalletInfo>;
