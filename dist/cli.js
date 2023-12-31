#!/usr/bin/env node

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const _1 = require(".");
const dotenv = require("dotenv");
const electrum_api_1 = require("./api/electrum-api");
const validate_cli_inputs_1 = require("./utils/validate-cli-inputs");
const validate_wallet_storage_1 = require("./utils/validate-wallet-storage");
const qrcode = require("qrcode-terminal");
const address_helpers_1 = require("./utils/address-helpers");
const command_interface_1 = require("./commands/command.interface");
const file_utils_1 = require("./utils/file-utils");
const atomical_format_helpers_1 = require("./utils/atomical-format-helpers");
const quotes = require("success-motivational-quotes");
const chalk = require("chalk");
dotenv.config();
/////////////////////////////////////////////////////////////////////////////////////////////
// General Helper Functions
/////////////////////////////////////////////////////////////////////////////////////////////
function printSuccess(data, showDonation) {
    console.log(JSON.stringify(data, null, 2));
    if (!showDonation) {
        return;
    }
    if (process.env.DISABLE_DONATE_QUOTE && process.env.DISABLE_DONATE_QUOTE === 'true') {
        return;
    }
    console.log(chalk.blue("\n\n------------------------------------------------------------------------------"));
    let q = 'Recommend to your children virtue; that alone can make them happy, not gold.';
    let by = 'Ludwig van Beethoven';
    try {
        const quoteObj = quotes.getTodaysQuote();
        q = quoteObj.body;
        by = quoteObj.by;
    }
    catch (ex) {
        // Lib not installed
    }
    console.log(chalk.green(q));
    console.log(chalk.green('- ' + by));
    console.log(chalk.blue("------------------------------------------------------------------------------\n"));
    const donate = 'bc1pl6k2z5ra403zfeyevzsu7llh0mdqqn4802p4uqfhz6l7qzddq2mqduqvc6';
    console.log('Thank you for your support and contributions to Atomicals CLI development! ❤️');
    console.log(`Donation address: ${donate}\n`);
    console.log(`Even a little goes a long way!\n`);
    console.log(`Scan QR Code to Donate:`);
    qrcode.generate(donate, { small: true });
}
function printFailure(data) {
    console.log(JSON.stringify(data, null, 2));
}
function handleResultLogging(result, showDonation) {
    if (!result || !result.success || !result.data) {
        printFailure(result);
    }
    else {
        printSuccess(result.data, showDonation);
    }
}
function getRandomBitwork4() {
    const r = Math.floor(1000 + Math.random() * 9000);
    return r + '';
}
function groupAtomicalsUtxosByAtomicalId(atomical_utxos) {
    const sorted = {};
    // console.log('atomical_utxos', JSON.stringify(atomical_utxos, null, 2));
    for (const utxo of atomical_utxos) {
        for (const atomicalId of utxo['atomicals']) {
            sorted[atomicalId] = sorted[atomicalId] || [];
            sorted[atomicalId].push(Object.assign(Object.assign({}, utxo), { atomicals: undefined }));
        }
    }
    return sorted;
}
function showWalletFTBalancesDetails(obj, showutxos = false, accumulated) {
    const atomicalsUtxosByAtomicalId = groupAtomicalsUtxosByAtomicalId(obj.atomicals_utxos);
    for (const atomicalId in obj.atomicals_balances) {
        if (!obj.atomicals_balances.hasOwnProperty(atomicalId)) {
            continue;
        }
        const atomical = obj.atomicals_balances[atomicalId];
        if (atomical['type'] !== 'FT') {
            continue;
        }
        console.log('-----');
        console.log('Atomical id:', atomicalId);
        console.log('Atomical number:', atomical['atomical_number']);
        console.log('Atomical type:', atomical['type']);
        console.log('Atomical subtype:', atomical['subtype']);
        console.log('Requested ticker:', atomical['request_ticker']);
        console.log('Requested ticker status:', atomical['request_ticker_status']['status']);
        console.log('Ticker:', atomical['ticker']);
        console.log('Confirmed balance:', atomical['confirmed']);
        console.log('UTXOs for Atomical:', atomicalsUtxosByAtomicalId[atomicalId].length);
        accumulated[atomical['ticker']] = accumulated[atomical['ticker']] || 0;
        accumulated[atomical['ticker']] += atomical['confirmed'];
        if (showutxos)
            console.log(JSON.stringify(atomicalsUtxosByAtomicalId[atomicalId], null, 2));
    }
    return accumulated;
}
function showWalletDetails(obj, type, showExtra = false, showBalancesOnly = false) {
    if (showBalancesOnly) {
        const atomicalsUtxosByAtomicalId = groupAtomicalsUtxosByAtomicalId(obj.atomicals_utxos);
        for (const atomicalId in obj.atomicals_balances) {
            if (!obj.atomicals_balances.hasOwnProperty(atomicalId)) {
                continue;
            }
            const atomical = obj.atomicals_balances[atomicalId];
            if (atomical['type'] !== 'FT') {
                continue;
            }
            console.log('-----');
            console.log('Atomical id:', atomicalId);
            console.log('Atomical number:', atomical['atomical_number']);
            console.log('Atomical type:', atomical['type']);
            console.log('Atomical subtype:', atomical['subtype']);
            console.log('Requested ticker:', atomical['request_ticker']);
            console.log('Requested ticker status:', atomical['request_ticker_status']['status']);
            console.log('Ticker:', atomical['ticker']);
            console.log('Confirmed balance:', atomical['confirmed']);
            console.log('UTXOs for Atomical:', atomicalsUtxosByAtomicalId[atomicalId].length);
        }
        return;
    }
    if (showExtra) {
        console.log(JSON.stringify(obj, null, 2));
    }
    else {
        const atomicals_balances_summarized = {};
        for (const prop in obj.atomicals_balances) {
            if (!obj.atomicals_balances.hasOwnProperty(prop)) {
                continue;
            }
            atomicals_balances_summarized[prop] = Object.assign(Object.assign({}, obj.atomicals_balances[prop]), { data: undefined });
        }
        const summaryOnly = {
            address: obj.address,
            scripthash: obj.scripthash,
            atomicals_count: obj.atomicals_count,
            // atomicals_utxos: obj.atomicals_utxos,
            atomicals_balances: atomicals_balances_summarized,
            total_confirmed: obj.total_confirmed,
            total_unconfirmed: obj.total_unconfirmed,
            atomicals_confirmed: obj.atomicals_confirmed,
            atomicals_unconfirmed: obj.atomicals_unconfirmed,
            regular_confirmed: obj.regular_confirmed,
            regular_unconfirmed: obj.regular_unconfirmed,
            regular_utxo_count: obj.regular_utxo_count,
            // regular_utxos: obj.regular_utxos,
        };
        console.log(JSON.stringify(summaryOnly, null, 2));
    }
}
function resolveWalletAliasNew(walletInfo, alias, defaultValue) {
    if (!alias) {
        return defaultValue;
    }
    if (walletInfo[alias]) {
        return walletInfo[alias];
    }
    if (walletInfo.imported[alias]) {
        return walletInfo.imported[alias];
    }
    throw 'No wallet alias or valid address found: ' + alias;
}
function resolveAddress(walletInfo, alias, defaultValue) {
    if (!alias) {
        return defaultValue;
    }
    if (walletInfo[alias]) {
        return walletInfo[alias];
    }
    if (walletInfo.imported[alias]) {
        return walletInfo.imported[alias];
    }
    // As a last effort try and return the address
    try {
        (0, address_helpers_1.detectAddressTypeToScripthash)(alias);
        return {
            address: alias
        };
    }
    catch (err) {
        // Do nothing, but at least we tried
    }
    throw 'No wallet alias or valid address found: ' + alias;
}
/////////////////////////////////////////////////////////////////////////////////////////////
// Start of Command Line Options Definitions
/////////////////////////////////////////////////////////////////////////////////////////////
const program = new commander_1.Command();
program
    .name('Atomicals CLI Utility')
    .description('Command line utility for interacting with Atomicals')
    .version(require('../package.json').version);
program.command('server-version')
    .description('Get electrumx server version info')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.serverVersion();
        console.log('result', result);
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Wallet and Local Wallet Commands
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('wallet-create')
    .description('Creates and displays new 12-word secret mnemonic phrase along with the primary and funding addresses')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield _1.Atomicals.walletCreate();
    console.log('Generated mnemonic phrase:', result);
    console.log(`phrase: ${result.data.wallet.phrase}`);
    console.log(`Primary address (P2TR): ${result.data.wallet.primary.address}`);
    console.log(`Primary address WIF: ${result.data.wallet.primary.WIF}`);
    console.log(`Primary address path: ${result.data.wallet.primary.path}`);
    console.log(`Funding address (P2TR): ${result.data.wallet.funding.address}`);
    console.log(`Funding address WIF: ${result.data.wallet.funding.WIF}`);
    console.log(`Funding address path: ${result.data.wallet.funding.path}`);
    console.log(JSON.stringify(result, null, 2));
    console.log(`------------------------------------------------------`);
}));
program.command('wallet-decode')
    .description('Decode secret mnemonic phrase to display derive address and key at provided path')
    .argument('<phrase>', 'string')
    .option('-p, --path <string>', 'Derivation path to use', `m/44'/0'/0'/0/0`)
    .action((phrase, options) => __awaiter(void 0, void 0, void 0, function* () {
    let path = options.path;
    const result = yield _1.Atomicals.walletPhraseDecode(phrase, path);
    console.log('Provided mnemonic phrase:');
    console.log(`phrase: ${result.data.phrase}`);
    console.log(`Requested Derivation Path: ${path}`);
    console.log(`Address: ${result.data.address}`);
    console.log(`Address path: ${result.data.path}`);
    console.log(`Address WIF: ${result.data.WIF}`);
    console.log(result);
    console.log(`------------------------------------------------------`);
}));
program.command('wallet-init')
    .description('Initializes a new wallet at wallet.json')
    .option('--phrase <string>', 'Provide a wallet phrase')
    .option('--path <string>', 'Provide a path base', `m/86'/0'/0'`)
    .option('--n <number>', 'Provider number of alias')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield _1.Atomicals.walletInit(options.phrase, options.path, options.n ? parseInt(options.n, 10) : undefined);
        console.log('Wallet created at wallet.json');
        console.log(`phrase: ${result.data.phrase}`);
        console.log(`Primary address (P2TR): ${result.data.primary.address}`);
        console.log(`Primary address WIF: ${result.data.primary.WIF}`);
        console.log(`Primary address path: ${result.data.primary.path}`);
        console.log(`Funding address (P2TR): ${result.data.funding.address}`);
        console.log(`Funding address WIF: ${result.data.funding.WIF}`);
        console.log(`Funding address path: ${result.data.funding.path}`);
        console.log(`Full Data: ${JSON.stringify(result.data, null, 2)}`);
        console.log(`------------------------------------------------------`);
    }
    catch (err) {
        console.log('Error', err);
    }
}));
program.command('wallet-import')
    .description('Import a wallet by WIF and assign it to provided alias')
    .argument('<wif>', 'string')
    .argument('<alias>', 'string')
    .action((wif, alias, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        yield _1.Atomicals.walletImport(wif, alias);
        console.log('Success! wallet.json updated');
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('address-script')
    .description('Encodes an address or wallet alias as the hex output script')
    .argument('<addressOrAlias>', 'string')
    .action((addressOrAlias, options) => __awaiter(void 0, void 0, void 0, function* () {
    const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
    const result = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, addressOrAlias || undefined);
    console.log('Address:', result.address);
    console.log('Script:', result.output.toString('hex'));
    console.log(`------------------------------------------------------`);
}));
program.command('script-address')
    .description('Decodes a script as an address')
    .argument('<script>', 'string')
    .action((script, options) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, address_helpers_1.detectScriptToAddressType)(script);
    console.log('Address:', result);
    console.log(`------------------------------------------------------`);
}));
program.command('outpoint-compact')
    .description('Decodes hex outpoint to compact location id form')
    .argument('<hex>', 'string')
    .action((hex, options) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, atomical_format_helpers_1.outpointToCompactId)(hex);
    console.log('result:', result);
    console.log(`------------------------------------------------------`);
}));
program.command('compact-outpoint')
    .description('Encodes the compact id to outpoint hex format')
    .argument('<compactId>', 'string')
    .action((compactId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, atomical_format_helpers_1.compactIdToOutpoint)(compactId);
    console.log('result:', result);
    console.log(`------------------------------------------------------`);
}));
program.command('address')
    .description('Get balances and Atomicals stored at an address')
    .argument('<address>', 'string')
    .option('--history', 'Verbose output to include history or not')
    .action((address, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const history = options.history ? true : false;
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const receive = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, address || undefined);
        const result = yield atomicals.addressInfo(receive.address, history);
        qrcode.generate((_a = result.data) === null || _a === void 0 ? void 0 : _a.address, { small: false });
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('wallets')
    .description('Get balances and atomicals stored at internal wallets')
    .option('--history', 'Shows history of txids for each wallet if enabled')
    .option('--all', 'Shows all loaded wallets and not just the primary and funding')
    .option('--extra', 'Show extended wallet information such as specific utxos. Default is to only show a summary.')
    .option('--balances', 'Show FT token balances')
    .option('--noqr', 'Hide QR codes')
    .option('--alias <string>', 'Restrict to only showing one of the imported wallets identified by the alias')
    .option('--type <string>', 'Show NFT or FT types only. By default shows both')
    .option('--identify <string>', 'Restrict to only showing one of the imported wallets identified by the address (if it is found)')
    .option('--address <string>', 'Show the data and a QR code for an arbitrary address. Not expected to be loaded into local wallets.')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const all = options.all ? true : false;
        const history = options.history ? true : false;
        const alias = options.alias ? options.alias : null;
        const extra = options.extra ? options.extra : null;
        const address = options.address ? options.address : null;
        const noqr = options.noqr ? options.noqr : null;
        const balancesOnly = options.balances ? options.balances : null;
        const identify = options.identify ? options.identify : null;
        const show = options.address ? options.address : null;
        const type = options.type ? options.type : 'all';
        if (type && (type.toLowerCase() !== 'all' && type.toLowerCase() !== 'nft' && type.toLowerCase() != 'ft')) {
            throw `Invalid type ${type}`;
        }
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const electrum = electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || '');
        const atomicals = new _1.Atomicals(electrum);
        const keepElectrumAlive = true;
        if (alias) {
            if (!walletInfo.imported || !walletInfo.imported[alias]) {
                throw `No wallet with alias ${alias}`;
            }
            let result = yield atomicals.walletInfo(walletInfo.imported[alias].address, history, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`Wallet Information - ${alias} Address - ${(_b = result.data) === null || _b === void 0 ? void 0 : _b.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_c = result.data) === null || _c === void 0 ? void 0 : _c.address, { small: false });
            }
            showWalletDetails(result.data, type, extra, balancesOnly);
        }
        else if (identify) {
            console.log("\n========================================================================================================");
            console.log(`Request Identify Wallet: ${identify}`);
            console.log("========================================================================================================");
            let foundWallet = false;
            for (const walletAlias in walletInfo.imported) {
                if (!walletInfo.imported[walletAlias]) {
                    continue;
                }
                if (walletInfo.imported[walletAlias].address === identify) {
                    foundWallet = true;
                    let result = yield atomicals.walletInfo(walletInfo.imported[walletAlias].address, history, keepElectrumAlive);
                    console.log("\n========================================================================================================");
                    console.log(`Wallet Information - ${walletAlias} Address`);
                    console.log("========================================================================================================");
                    if (!noqr) {
                        qrcode.generate((_d = result.data) === null || _d === void 0 ? void 0 : _d.address, { small: false });
                    }
                    showWalletDetails(result.data, type, extra, balancesOnly);
                }
            }
            if (!foundWallet) {
                console.log(`No imported wallet found with address ${identify}`);
            }
        }
        else if (show) {
            console.log("\n========================================================================================================");
            console.log(`Request Show Address: ${show}`);
            console.log("========================================================================================================");
            let result = yield atomicals.walletInfo(show, history, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`Address Information - ${show} Address - ${(_e = result.data) === null || _e === void 0 ? void 0 : _e.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_f = result.data) === null || _f === void 0 ? void 0 : _f.address, { small: false });
            }
            showWalletDetails(result.data, type, extra, balancesOnly);
        }
        else {
            // Just show the primary and funding address
            let result = yield atomicals.walletInfo(walletInfo.primary.address, history, keepElectrumAlive);
            console.log('walletInfo result', result);
            console.log("\n========================================================================================================");
            console.log(`1. Wallet Information - Primary Address - ${(_g = result.data) === null || _g === void 0 ? void 0 : _g.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_h = result.data) === null || _h === void 0 ? void 0 : _h.address, { small: false });
            }
            showWalletDetails(result.data, type, extra, balancesOnly);
            result = yield atomicals.walletInfo(walletInfo.funding.address, history, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`2. Wallet Information - Funding Address - ${(_j = result.data) === null || _j === void 0 ? void 0 : _j.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_k = result.data) === null || _k === void 0 ? void 0 : _k.address, { small: false });
            }
            showWalletDetails(result.data, type, extra, balancesOnly);
            if (all) {
                let counter = 3;
                if (walletInfo.imported) {
                    for (const walletAlias in walletInfo.imported) {
                        if (!walletInfo.imported.hasOwnProperty(walletAlias)) {
                            continue;
                        }
                        result = yield atomicals.walletInfo(walletInfo.imported[walletAlias].address, history, keepElectrumAlive);
                        console.log("\n========================================================================================================");
                        console.log(`${counter}. Wallet Information - ${walletAlias} Address - ${(_l = result.data) === null || _l === void 0 ? void 0 : _l.address}`);
                        console.log("========================================================================================================");
                        if (!noqr) {
                            qrcode.generate((_m = result.data) === null || _m === void 0 ? void 0 : _m.address, { small: false });
                        }
                        showWalletDetails(result.data, type, extra, balancesOnly);
                        counter++;
                    }
                }
            }
        }
        console.log("\n\n");
        yield electrum.close();
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('balances')
    .description('Get balances and atomicals stored at internal wallets')
    .option('--noqr', 'Hide QR codes')
    .option('--utxos', 'Show utxos too')
    .option('--all', 'Shows all loaded wallets and not just the primary and funding')
    .option('--alias <string>', 'Restrict to only showing one of the imported wallets identified by the alias')
    .option('--address <string>', 'Restrict to only showing by address. Using this option with --alias has no effect.')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    try {
        const alias = options.alias ? options.alias : null;
        const noqr = options.noqr ? options.noqr : null;
        const address = options.address ? options.address : null;
        const all = options.all ? true : false;
        const utxos = options.utxos ? true : false;
        const balancesOnly = true;
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const electrum = electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || '');
        const atomicals = new _1.Atomicals(electrum);
        const keepElectrumAlive = true;
        let accumulated = {};
        if (alias) {
            if (!walletInfo.imported || !walletInfo.imported[alias]) {
                throw `No wallet with alias ${alias}`;
            }
            let result = yield atomicals.walletInfo(walletInfo.imported[alias].address, false, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`Wallet Information - ${alias} Address - ${(_o = result.data) === null || _o === void 0 ? void 0 : _o.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_p = result.data) === null || _p === void 0 ? void 0 : _p.address, { small: false });
            }
            accumulated = showWalletFTBalancesDetails(result.data, utxos, accumulated);
        }
        else if (address) {
            let result = yield atomicals.walletInfo(address, false, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`Wallet Information - Address - ${(_q = result.data) === null || _q === void 0 ? void 0 : _q.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_r = result.data) === null || _r === void 0 ? void 0 : _r.address, { small: false });
            }
            accumulated = showWalletFTBalancesDetails(result.data, utxos, accumulated);
        }
        else {
            // Just show the primary and funding address
            let result = yield atomicals.walletInfo(walletInfo.primary.address, false, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`1. Wallet Information - Primary Address - ${(_s = result.data) === null || _s === void 0 ? void 0 : _s.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_t = result.data) === null || _t === void 0 ? void 0 : _t.address, { small: false });
            }
            accumulated = showWalletFTBalancesDetails(result.data, utxos, accumulated);
            result = yield atomicals.walletInfo(walletInfo.funding.address, false, keepElectrumAlive);
            console.log("\n========================================================================================================");
            console.log(`2. Wallet Information - Funding Address - ${(_u = result.data) === null || _u === void 0 ? void 0 : _u.address}`);
            console.log("========================================================================================================");
            if (!noqr) {
                qrcode.generate((_v = result.data) === null || _v === void 0 ? void 0 : _v.address, { small: false });
            }
            accumulated = showWalletFTBalancesDetails(result.data, utxos, accumulated);
            if (all) {
                let counter = 3;
                if (walletInfo.imported) {
                    for (const walletAlias in walletInfo.imported) {
                        if (!walletInfo.imported.hasOwnProperty(walletAlias)) {
                            continue;
                        }
                        result = yield atomicals.walletInfo(walletInfo.imported[walletAlias].address, false, keepElectrumAlive);
                        console.log("\n========================================================================================================");
                        console.log(`${counter}. Wallet Information - ${walletAlias} Address - ${(_w = result.data) === null || _w === void 0 ? void 0 : _w.address}`);
                        console.log("========================================================================================================");
                        if (!noqr) {
                            qrcode.generate((_x = result.data) === null || _x === void 0 ? void 0 : _x.address, { small: false });
                        }
                        accumulated = showWalletFTBalancesDetails(result.data, utxos, accumulated);
                        counter++;
                    }
                }
            }
        }
        console.log("\n\n");
        console.log(accumulated);
        yield electrum.close();
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('address-utxos')
    .description('List all utxos owned by an address')
    .argument('<address>', 'string')
    .action((address, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        // address = performAddressAliasReplacement(walletInfo, address);
        const receive = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, address || undefined);
        const result = yield atomicals.getUtxos(receive.address);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('address-history')
    .description('List address history of an address')
    .argument('<address>', 'string')
    .action((address, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const receive = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, address || undefined);
        const result = yield atomicals.getHistory(receive.address);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('tx')
    .description('Get any transaction')
    .argument('<txid>', 'string')
    .option('--verbose', 'Verbose output')
    .action((txid, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const verbose = options.verbose ? true : false;
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getTx(txid, verbose);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Name Retrieval Commands (Tickers, (Sub)Realms, Containers)
/////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Resolve a realm or subrealm
 *
 * @param realm_or_subrealm Realm or subrealm to resolve
 * @param options
 */
const resolveRealmAction = (realm_or_subrealm, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalByRealm(realm_or_subrealm);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
});
program.command('get-ticker')
    .description('Get Atomical by ticker name')
    .argument('<ticker>', 'string')
    .option('--verbose', 'Verbose to show extended information.')
    .action((ticker, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalByTicker(ticker);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('get-container')
    .description('Get Atomical by container name')
    .argument('<container>', 'string')
    .option('--verbose', 'Verbose to show extended information.')
    .action((container, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalByContainer(container);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('get-container-items')
    .description('Get the items in the container')
    .argument('<container>', 'string')
    .argument('<limit>', 'number')
    .argument('<offset>', 'number')
    .option('--verbose', 'Verbose output')
    .action((container, limit, offset, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getContainerItems(container, parseInt(limit, 10), parseInt(offset, 10));
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('get-container-item')
    .description('Get an item in the container')
    .argument('<container>', 'string')
    .argument('<itemId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((container, itemId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const modifiedStripped = container.indexOf('#') === 0 ? container.substring(1) : container;
        const result = yield atomicals.getAtomicalByContainerItem(modifiedStripped, itemId);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('validate-container-item')
    .description('Validate a container item from the manifest')
    .argument('<containerName>', 'string')
    .argument('<itemName>', 'string')
    .argument('<manifestFile>', 'string')
    .action((containerName, itemName, manifestFile, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalByContainerItemValidated(containerName, itemName, manifestFile);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('resolve')
    .description(`Resolve a realm or subrealm. Alias for 'get-realm'`)
    .argument('<realm_or_subrealm>', 'string')
    .option('--verbose', 'Verbose to show extended information.')
    .action((realm_or_subrealm, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield resolveRealmAction(realm_or_subrealm, options);
}));
program.command('get-realm')
    .description(`Resolve a realm or subrealm. Alias for 'resolve'`)
    .argument('<realm_or_subrealm>', 'string')
    .option('--verbose', 'Verbose to show extended information.')
    .action((realm_or_subrealm, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield resolveRealmAction(realm_or_subrealm, options);
}));
program.command('realm-info')
    .description('Get realm and subrealm information of an atomical')
    .argument('<atomicalIdAlias>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const modifiedStripped = atomicalAliasOrId.indexOf('+') === 0 ? atomicalAliasOrId.substring(1) : atomicalAliasOrId;
        const result = yield atomicals.getRealmInfo(modifiedStripped, verbose);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('summary-subrealms')
    .description('Show summary of owned subrealms by wallet')
    .option('--owner <string>', 'Provide alternate wallet alias to query')
    .option('--filter <string>', 'Filter by status')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const filter = options.filter ? options.filter : undefined;
        const result = yield atomicals.summarySubrealms(ownerWalletRecord.address, filter);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('summary-containers')
    .description('Show summary of owned containers by wallet')
    .option('--owner <string>', 'Provide alternate wallet alias to query')
    .option('--filter <string>', 'Filter by status')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const filter = options.filter ? options.filter : undefined;
        const result = yield atomicals.summaryContainers(ownerWalletRecord.address, filter);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('summary-realms')
    .description('Show summary of owned realms by wallet')
    .option('--owner <string>', 'Provide alternate wallet alias to query')
    .option('--filter <string>', 'Filter by status')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const filter = options.filter ? options.filter : undefined;
        const result = yield atomicals.summaryRealms(ownerWalletRecord.address, filter);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('summary-tickers')
    .description('Show summary of owned tokens by tickers by wallet')
    .option('--owner <string>', 'Provide alternate wallet alias to query')
    .option('--filter <string>', 'Filter by status')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const filter = options.filter ? options.filter : undefined;
        const result = yield atomicals.summaryTickers(ownerWalletRecord.address, filter);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('find-tickers')
    .description('Search tickers')
    .option('--q <string>', 'Search query')
    .option('--asc <string>', 'Sort by ascending', 'true')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const q = options.q ? options.q : null;
        const asc = options.asc === 'true' ? true : false;
        const result = yield atomicals.searchTickers(q, verbose, asc);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('find-realms')
    .description('Search realms')
    .option('--q <string>', 'Search query')
    .option('--asc <string>', 'Sort by ascending', 'true')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const q = options.q ? options.q : null;
        const asc = options.asc === 'true' ? true : false;
        const result = yield atomicals.searchRealms(q, verbose, asc);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('find-containers')
    .description('Search containers')
    .option('--q <string>', 'Search query')
    .option('--asc <string>', 'Sort by ascending', 'true')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const q = options.q ? options.q : null;
        const asc = options.asc === 'true' ? true : false;
        const result = yield atomicals.searchContainers(q, verbose, asc);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Modify, Updates, Events, Delete...
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('set')
    .description('Set (update) an existing Atomical with data.')
    .argument('<atomicalIdAlias>', 'string')
    .argument('<jsonFilename>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--disableautoencode', 'Disables auto encoding of $b variables')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .action((atomicalId, jsonFilename, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.setInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
            disableautoencode: !!options.disableautoencode,
            bitworkc: options.bitworkc ? options.bitworkc : '8',
        }, atomicalId, jsonFilename, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('set-container-data')
    .description('Update container data with json file contents')
    .argument('<containerName>', 'string')
    .argument('<jsonFilename>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--disableautoencode', 'Disables auto encoding of $b variables')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .action((containerName, jsonFilename, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        containerName = containerName.startsWith('#') ? containerName : '#' + containerName;
        const result = yield atomicals.setContainerDataInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
            disableautoencode: !!options.disableautoencode,
            bitworkc: options.bitworkc,
        }, containerName, jsonFilename, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('prepare-dmint-items')
    .description('Prepare the dmint config and item manifest from a folder of images')
    .argument('<folder>', 'string')
    .argument('<outputFolderName>', 'string')
    .action((folder, outputFolderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield _1.Atomicals.createDmintItemManifests(folder, outputFolderName);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('prepare-dmint')
    .description('Prepare the dmint config and item manifest from a folder of images')
    .argument('<folder>', 'string')
    .argument('<mintHeight>', 'number')
    .argument('<bitworkc>', 'string')
    .action((folder, mintHeight, bitworkc) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield _1.Atomicals.createDmint(folder, parseInt(mintHeight, 10), bitworkc);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('enable-dmint')
    .description('Enable dmint for a container with the dmint config file produced from the prepare-dmint command')
    .argument('<container>', 'string')
    .argument('<jsonFilename>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .action((containerName, jsonFilename, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        containerName = containerName.startsWith('#') ? containerName : '#' + containerName;
        const result = yield atomicals.setContainerDmintInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
            disableautoencode: !!options.disableautoencode,
            bitworkc: options.bitworkc || '7',
        }, containerName, jsonFilename, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-item')
    .description('Mint item non-fungible token (NFT) Atomical from a decentralized container')
    .argument('<containerName>', 'string')
    .argument('<itemName>', 'string')
    .argument('<manifestFile>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Owner of the parent Atomical. Used for direct subrealm minting.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the minted atomical', '1000')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--container <string>', 'Name of the container to request')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((containerName, itemName, manifestFile, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerAddress = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintContainerItemInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            disableMiningChalk: options.disablechalk,
        }, containerName, itemName, manifestFile, initialOwnerAddress.address, fundingRecord.WIF, ownerWalletRecord);
        handleResultLogging(result, true);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('emit')
    .description('Emit an event for an existing Atomical with data.')
    .argument('<atomicalIdAlias>', 'string')
    .argument('<data...>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .action((atomicalId, data, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.emitInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
        }, atomicalId, data, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('set-relation')
    .description('Set relationship an existing Atomical with data.')
    .argument('<atomicalId>', 'string')
    .argument('<relationName>', 'string')
    .argument('<relationValues...>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .action((atomicalId, relationName, values, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.setRelationInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
        }, atomicalId, relationName, values, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('delete')
    .description('Delete keys for existing Atomical.')
    .argument('<atomicalIdAlias>', 'string')
    .argument('<filesToDelete...>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .option('--bitworkr <string>', 'Whether to add any bitwork proof of work to the reveal tx.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((atomicalId, filesToDelete, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.deleteInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
            bitworkc: options.bitworkc ? options.bitworkc : '8',
            bitworkr: options.bitworkr,
            disableMiningChalk: options.disablechalk,
        }, atomicalId, filesToDelete, ownerWalletRecord, fundingWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('seal')
    .description('Seal any NFT Atomical type permanently so that it can never be updated or transferred ever again.')
    .argument('<atomicalIdAlias>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .action((atomicalId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.sealInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte),
            bitworkc: options.bitworkc || '1',
        }, atomicalId, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('splat')
    .description('Extract an NFT Atomical from a UTXO which contains multiple Atomicals')
    .argument('<locationId>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into each output', '1000')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .action((locationId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const result = yield atomicals.splatInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            bitworkc: options.bitworkc || '1',
        }, locationId, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
/*
program.command('split')
  .description('Split operation to separate the FT Atomicals at a single UTXOs.')
  .argument('<locationId>', 'string')
  .option('--rbf', 'Whether to enable RBF for transactions.')
  .option('--funding <string>', 'Use wallet alias wif key to be used for funding')
  .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
  .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
  .action(async (locationId, options) => {
    try {
      const walletInfo = await validateWalletStorage();
      const config: ConfigurationInterface = validateCliInputs();
      const atomicals = new Atomicals(ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
      let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
      let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
      const result: any = await atomicals.splitItneractive({
        rbf: options.rbf,
        satsbyte: parseInt(options.satsbyte),
      }, locationId, fundingWalletRecord, ownerWalletRecord);
      handleResultLogging(result);
    } catch (error) {
      console.log(error);
    }
  });
*/
program.command('get')
    .description('Get the status of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.GET, undefined, verbose);
        handleResultLogging(result, true);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('global')
    .description('Get global status')
    .option('--hashes <number>', 'How many atomicals block hashes to retrieve', '10')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const headersCount = parseInt(options.hashes, 10);
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.global(headersCount);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('dump')
    .description('dump')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.dump();
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('location')
    .description('Get locations of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.LOCATION, undefined, options.verbose);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('ftinfo')
    .description('Get FT specific info for an FT atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalFtInfo(atomicalAliasOrId);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('state')
    .description('Get the state of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.STATE, verbose);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('state-history')
    .description('Get the state history of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.STATE_HISTORY, undefined, verbose);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('events')
    .description('Get the event state history of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.EVENT_HISTORY, undefined, verbose);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Subrealm Minting and Payments Management Operations
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('enable-subrealms')
    .description('Set and enable subrealm minting rules for a realm or subrealm')
    .argument('<realmOrSubRealm>', 'string')
    .argument('<file>')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .option('--bitworkr <string>', 'Whether to add any bitwork proof of work to the reveal tx.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((realmOrSubRealm, file, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const realmOrSubRealmAdded = realmOrSubRealm.indexOf('+') === 0 ? realmOrSubRealm : '+' + realmOrSubRealm;
        const result = yield atomicals.enableSubrealmRules({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            disableMiningChalk: options.disablechalk,
        }, realmOrSubRealmAdded, file, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('disable-subrealms')
    .description('Delete the subrealm minting rules for a realm or subrealm')
    .argument('<realmOrSubRealm>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--bitworkc <string>', 'Whether to add any bitwork proof of work to the commit tx')
    .option('--bitworkr <string>', 'Whether to add any bitwork proof of work to the reveal tx.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((realmOrSubRealm, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const realmOrSubRealmAdded = realmOrSubRealm.indexOf('+') === 0 ? realmOrSubRealm : '+' + realmOrSubRealm;
        const result = yield atomicals.disableSubrealmRules({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            disableMiningChalk: options.disablechalk,
        }, realmOrSubRealmAdded, fundingWalletRecord, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('pending-subrealms')
    .description('Display pending subrealm Atomical requests and make payments')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Show pending subrealms for an address or wallet')
    .option('--display', 'Show pending subrealms for an address or wallet')
    .option('--verbose', 'Show verbose raw output')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '300')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        const display = options.display ? true : false;
        const satsbyte = parseInt(options.satsbyte);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.pendingSubrealms(options, ownerWalletRecord.address, fundingWalletRecord, satsbyte, display);
        if (options.verbose) {
            handleResultLogging(result);
        }
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Mint NFTs, FTs Operations
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('mint-ft')
    .description('Mint fungible token (FT) Atomical in direct issuance mode')
    .argument('<ticker>', 'string')
    .argument('<supply>', 'number')
    .argument('<file>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((ticker, supply, file, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const requestTicker = ticker.toLowerCase();
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerRecord = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        if (isNaN(supply)) {
            throw 'supply must be an integer';
        }
        const result = yield atomicals.mintFtInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            container: options.container,
            bitworkc: options.bitworkc ? options.bitworkc : getRandomBitwork4(),
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk,
        }, file, parseInt(supply), initialOwnerRecord.address, requestTicker, fundingRecord.WIF);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('init-dft')
    .description('Initialize fungible token (FT) atomical in decentralized issuance mode')
    .argument('<ticker>', 'string')
    .argument('<mint_amount>', 'number')
    .argument('<max_mints>', 'number')
    .argument('<mint_height>', 'number')
    .argument('<file>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--funding <string>', 'Use wallet alias wif key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--mintbitworkc <string>', 'Whether to require any bitwork proof of work to mint. Applies to the commit transaction.')
    .option('--mintbitworkr <string>', 'Whether to require any bitwork proof of work to mint. Applies to the reveal transaction.')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for Bitwork mining. Improvements mining performance to set this flag')
    .action((ticker, mintAmount, maxMints, mintHeight, file, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const requestTicker = ticker.toLowerCase();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let walletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const mintBitworkc = options.mintbitworkc ? options.mintbitworkc : getRandomBitwork4();
        const result = yield atomicals.initDftInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc ? options.bitworkc : getRandomBitwork4(),
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk,
        }, file, walletRecord.address, requestTicker, mintAmount, maxMints, mintHeight, mintBitworkc, options.mintbitworkr, fundingRecord.WIF);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-dft')
    .description('Mint coins for a decentralized fungible token (FT)')
    .argument('<ticker>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Assign claimed tokens into this address')
    .option('--funding <string>', 'Use wallet alias wif key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for Bitwork mining. Improvements mining performance to set this flag')
    .action((ticker, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        ticker = ticker.toLowerCase();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let walletRecord = resolveWalletAliasNew(walletInfo, options.initialowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintDftInteractive({
            rbf: options.rbf,
            satsbyte: parseInt(options.satsbyte),
            disableMiningChalk: options.disablechalk,
        }, walletRecord.address, ticker, fundingRecord.WIF);
        handleResultLogging(result, true);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-nft')
    .description('Mint non-fungible token (NFT) Atomical')
    .argument('<files...>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the minted atomical', '1000')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--container <string>', 'Name of the container to request')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((files, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerAddress = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintNftInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk,
        }, files, initialOwnerAddress.address, fundingRecord.WIF);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-realm')
    .description('Mint top level Realm non-fungible token (NFT) Atomical')
    .argument('<realm>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the minted atomical', '1000')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--container <string>', 'Name of the container to request')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((realm, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerAddress = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintRealmInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc ? options.bitworkc : getRandomBitwork4(),
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk,
        }, realm, initialOwnerAddress.address, fundingRecord.WIF);
        handleResultLogging(result, true);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-subrealm')
    .description('Mint subrealm non-fungible token (NFT) Atomical')
    .argument('<realm>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Owner of the parent Atomical. Used for direct subrealm minting.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the minted atomical', '1000')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--container <string>', 'Name of the container to request')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((subrealm, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerAddress = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintSubrealmInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            disableMiningChalk: options.disablechalk,
        }, subrealm, initialOwnerAddress.address, fundingRecord.WIF, ownerWalletRecord);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('mint-container')
    .description('Mint container non-fungible token (NFT) Atomical')
    .argument('<container>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the minted atomical', '1000')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--container <string>', 'Name of the container to request to be a member of. Not to be confused with the \'mint-container\' command to create a new container')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((container, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let initialOwnerAddress = resolveAddress(walletInfo, options.initialowner, walletInfo.primary);
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        let fundingRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mintContainerInteractive({
            rbf: options.rbf,
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte),
            satsoutput: parseInt(options.satsoutput),
            container: options.container,
            bitworkc: options.bitworkc ? options.bitworkc : getRandomBitwork4(),
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk
        }, container, initialOwnerAddress.address, fundingRecord.WIF);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// Transfer NFTs and FTs Operations
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('transfer-nft')
    .description('Transfer Atomical NFT to new address')
    .argument('<atomicalId>', 'string')
    .argument('<address>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into the transferred atomical', '546')
    .action((atomicalId, address, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const satsbyte = parseInt(options.satsbyte);
        const satsoutput = parseInt(options.satsoutput);
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const receive = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, address);
        const result = yield atomicals.transferInteractiveNft(options, atomicalId, ownerWalletRecord, fundingWalletRecord, receive.address, satsbyte, satsoutput);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('transfer-ft')
    .description('Transfer Atomical FT to other addresses')
    .argument('<atomicalId>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--nofunding', 'Do not ask for separate funding, use existing utxo')
    .option('--atomicalreceipt <string>', 'Attach an atomical id to a pay receipt')
    .action((atomicalId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const satsbyte = parseInt(options.satsbyte);
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const atomicalIdReceipt = options.atomicalreceipt;
        const result = yield atomicals.transferInteractiveFt(options, atomicalId, ownerWalletRecord, fundingWalletRecord, walletInfo, satsbyte, options.nofunding, atomicalIdReceipt);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('transfer-builder')
    .description('Transfer plain regular UTXOs to another addresses')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--nofunding', 'Do not ask for seperate funding, use existing utxo')
    .option('--skipvalidation', 'Do not do FT transfer validation on broadcast (danger)')
    .option('--atomicalreceipt <string>', 'Attach an atomical id to a pay receipt')
    .option('--atomicalreceipttype <string>', 'Attach receipt type p or d')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const satsbyte = parseInt(options.satsbyte);
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const atomicalIdReceipt = options.atomicalreceipt;
        const atomicalIdReceiptType = options.atomicalreceipttype || 'p';
        const result = yield atomicals.transferInteractiveBuilder(options, ownerWalletRecord, fundingWalletRecord, walletInfo, satsbyte, options.nofunding, atomicalIdReceipt, atomicalIdReceiptType, options.skipvalidation);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('transfer-utxos')
    .description('Transfer plain regular UTXOs to another addresses')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomical')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--nofunding', 'Do not ask for separate funding, use existing utxo')
    .option('--atomicalreceipt <string>', 'Attach an atomical id to a pay receipt')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const satsbyte = parseInt(options.satsbyte);
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const atomicalIdReceipt = options.atomicalreceipt;
        const result = yield atomicals.transferInteractiveUtxos(options, ownerWalletRecord, fundingWalletRecord, walletInfo, satsbyte, options.nofunding, atomicalIdReceipt);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('merge-atomicals')
    .description('Merge Atomicals UTXOs together for test purposes')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--owner <string>', 'Use wallet alias WIF key to move the Atomicals')
    .option('--funding <string>', 'Use wallet alias WIF key to be used for funding and change')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const satsbyte = parseInt(options.satsbyte, 10);
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let ownerWalletRecord = resolveWalletAliasNew(walletInfo, options.owner, walletInfo.primary);
        let fundingWalletRecord = resolveWalletAliasNew(walletInfo, options.funding, walletInfo.funding);
        const result = yield atomicals.mergeInteractiveUtxos(options, ownerWalletRecord, fundingWalletRecord, walletInfo, satsbyte);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('tx-history')
    .description('Get the history of an Atomical')
    .argument('<atomicalAliasOrId>', 'string')
    .option('--verbose', 'Verbose output')
    .action((atomicalAliasOrId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const verbose = options.verbose ? true : false;
        const result = yield atomicals.resolveAtomical(atomicalAliasOrId, command_interface_1.AtomicalsGetFetchType.TX_HISTORY, undefined, verbose);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('list')
    .description('List feed of Atomicals minted globally')
    .option('--limit <number>', 'Limit the number of results', '20')
    .option('--offset <number>', 'Offset for pagination', '-20')
    .option('--asc <string>', 'Whether to sort by ascending or descending', 'true')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = options.limit;
        const offset = options.offset;
        const asc = options.asc === 'true' ? true : false;
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.list(parseInt(limit, 10), parseInt(offset, 10), asc);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('address-atomicals')
    .description('List all atomicals owned by an address')
    .argument('<address>', 'string')
    .action((address, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        // address = performAddressAliasReplacement(walletInfo, address);
        const receive = (0, address_helpers_1.performAddressAliasReplacement)(walletInfo, address || undefined);
        const result = yield atomicals.getAtomicals(receive.address);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('at-location')
    .description('Get Atomicals at a utxo location')
    .argument('<location>', 'string')
    .action((location, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.getAtomicalsAtLocation(location);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////
// General Data Storage and Retrieval (Non-Atomicals)
/////////////////////////////////////////////////////////////////////////////////////////////
program.command('store-file')
    .description('Store general immutable data transaction that is not an NFT or FT')
    .argument('<filepath>', 'string')
    .argument('<givenFileName>', 'string')
    .option('--rbf', 'Whether to enable RBF for transactions.')
    .option('--initialowner <string>', 'Initial owner wallet alias to mint the Atomical into')
    .option('--satsbyte <number>', 'Satoshis per byte in fees', '15')
    .option('--satsoutput <number>', 'Satoshis to put into output', '1000')
    .option('--bitworkc <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the commit transaction.')
    .option('--bitworkr <string>', 'Whether to put any bitwork proof of work into the token mint. Applies to the reveal transaction.')
    .option('--parent <string>', 'Whether to require a parent atomical to be spent along with the mint.')
    .option('--parentowner <string>', 'Wallet owner of the parent to spend along with the mint.')
    .option('--disablechalk', 'Whether to disable the real-time chalked logging of each hash for mining. Improvements mining performance to set this flag')
    .action((filepath, givenFileName, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletInfo = yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        let walletRecord = resolveWalletAliasNew(walletInfo, options.initialowner, walletInfo.primary);
        let parentOwnerRecord = resolveWalletAliasNew(walletInfo, options.parentowner, walletInfo.primary);
        const result = yield atomicals.mintDatInteractive({
            meta: options.meta,
            ctx: options.ctx,
            init: options.init,
            satsbyte: parseInt(options.satsbyte, 10),
            satsoutput: parseInt(options.satsoutput, 10),
            bitworkc: options.bitworkc,
            bitworkr: options.bitworkr,
            parent: options.parent,
            parentOwner: parentOwnerRecord,
            disableMiningChalk: options.disablechalk,
            rbf: options.rbf,
        }, filepath, givenFileName, walletRecord.address, walletRecord.WIF);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('download')
    .description('Download a file from a locationId or atomicalId')
    .argument('<locationIdOrTxId>', 'string')
    .option('--body', 'Whether to include the body bytes in the print out or suppress it')
    .action((locationIdOrTxId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.download(locationIdOrTxId);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.command('broadcast')
    .description('broadcast a rawtx')
    .option('--rawtx <string>', 'Rawtx')
    .option('--rawtxfile <string>', 'File path to the rawtx')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, validate_wallet_storage_1.validateWalletStorage)();
        const config = (0, validate_cli_inputs_1.validateCliInputs)();
        if (!options.rawtx && !options.rawtxfile) {
            throw new Error("must specify either rawtx or rawtxfile");
        }
        let rawtx = options.rawtx;
        if (!rawtx) {
            rawtx = options.rawtxfile;
            rawtx = yield (0, file_utils_1.fileReader)(rawtx, 'utf8');
        }
        const atomicals = new _1.Atomicals(electrum_api_1.ElectrumApi.createClient(process.env.ELECTRUMX_PROXY_BASE_URL || ''));
        const result = yield atomicals.broadcast(rawtx);
        handleResultLogging(result);
    }
    catch (error) {
        console.log(error);
    }
}));
program.parse();
