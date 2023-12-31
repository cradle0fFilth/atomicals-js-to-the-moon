import { ElectrumApiInterface } from "../api/electrum-api.interface";
import { CommandInterface } from "./command.interface";
import { ApplicableRule } from "../interfaces/atomical-status.interface";
import { BaseRequestOptions } from "../interfaces/api.interface";
export interface PendingSubrealmsCommandResultInterface {
    success: boolean;
    message?: string;
    data?: any;
    error?: any;
}
export interface PendingSummaryItemInterface {
    atomical_id: string;
    atomical_number: number;
    request_full_realm_name: string;
    full_realm_name?: string;
    status: string;
}
export interface PendingSummaryItemMapInterface {
    [key: string]: PendingSummaryItemInterface | any;
}
export interface SubrealmAwaitingPaymentItemInterface {
    atomical_id: string;
    atomical_number: number;
    request_full_realm_name: string;
    status: {
        status: string;
        pending_candidate_atomical_id?: string;
        note?: string;
    };
    make_payment_from_height?: number;
    payment_due_no_later_than_height?: number;
    applicable_rule?: ApplicableRule;
}
export declare class PendingSubrealmsCommand implements CommandInterface {
    private electrumApi;
    private options;
    private address;
    private fundingWIF;
    private satsbyte;
    private display;
    constructor(electrumApi: ElectrumApiInterface, options: BaseRequestOptions, address: string, fundingWIF: string, satsbyte: number, display: boolean);
    static isCurrentAtomicalPendingCandidate(entry: any): boolean;
    static isPendingCandidate(entry: any): boolean;
    run(): Promise<any>;
    hasSubrealmsAwaitingPayment(statusReturn: any): boolean;
    hasSubrealmsAwaitingPaymentWindow(statusReturn: any): boolean;
    calculateFundsRequired(price: any, satsbyte: any): number;
    makePayment(atomicalId: string, paymentOutputs: Array<{
        address: string;
        value: number;
    }>, fundingKeypair: any, satsbyte: number): Promise<any>;
    makePrettyMenu(statusReturn: any): void;
    promptSubrealmSelection(pendingSubrealms: any): Promise<{
        atomicalId: string;
        value: number;
    } | any>;
}
