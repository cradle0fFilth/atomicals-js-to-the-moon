export declare const decodeMnemonicPhrase: (phrase: string, path: string) => Promise<{
    phrase: string;
    address: any;
    publicKey: string;
    publicKeyXOnly: any;
    path: string;
    WIF: string;
    privateKey: string | undefined;
}>;
