import { PaymentagentList, PaymentAgentListResponse } from '@deriv/api-types';

type TExtendedPaymentAgentFields = {
    phone_numbers: Array<{ phone_number: string }>;
    supported_payment_methods: Array<{ payment_method: string }>;
    urls: Array<{ url: string }>;
};

export type TExtendedPaymentAgentList = (PaymentagentList['list'][0] & TExtendedPaymentAgentFields)[];

interface TExtendedPaymentagentList extends PaymentagentList {
    list: TExtendedPaymentAgentList;
}

export interface TExtendedPaymentAgentListResponse extends PaymentAgentListResponse {
    paymentagent_list?: TExtendedPaymentagentList;
}

export type TPaymentAgentTransferConfirm = {
    amount?: string;
    client_id?: string;
    client_name?: string;
    description?: string;
};

export type TPaymentAgentTransferReceipt = {
    amount_transferred?: string;
    client_id?: string;
    client_name?: string;
};

export type TTransferLimit = {
    min_withdrawal?: null | string | number;
    max_withdrawal?: null | string | number;
};

export type TPaymentAgentTransferRequest = {
    amount: number;
    currency: string;
    description: string;
    dry_run?: number;
    transfer_to: string;
};
