export type TCryptoTransactionDetails = {
    address_hash: string;
    address_url: string;
    amount: number;
    id: string;
    is_valid_to_cancel: number;
    status_code:
        | 'confirmed'
        | 'error'
        | 'pending'
        | 'cancelled'
        | 'locked'
        | 'performing_blockchain_txn'
        | 'processing'
        | 'rejected'
        | 'sent'
        | 'verified';
    status_message: string;
    submit_date: number;
    transaction_type: 'deposit' | 'withdrawal';
    transaction_hash: string;
    transaction_url: string;
};
