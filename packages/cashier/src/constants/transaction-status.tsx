import React, { ReactNode } from 'react';
import { StaticUrl } from '@deriv/components';
import { localize, Localize } from '@deriv/translations';
import { TStatusCode, TTransactionType } from 'Types';

export const getStatus = (transaction_hash: string, transaction_type: TTransactionType, status_code: TStatusCode) => {
    const formatted_transaction_hash = transaction_hash
        ? `${transaction_hash.substring(0, 4)}....${transaction_hash.substring(transaction_hash.length - 4)}`
        : localize('Pending');
    const status_list = {
        deposit: {
            confirmed: {
                name: localize('Successful'),
                description: localize('Your deposit is successful.'),
                renderer: 'successful',
                transaction_hash: formatted_transaction_hash,
            },
            error: {
                name: localize('Unsuccessful'),
                description: localize(
                    'Your deposit is unsuccessful due to an error on the blockchain. Please contact your crypto wallet service provider for more info.'
                ),
                renderer: 'unsuccessful',
                transaction_hash: localize('NA'),
            },
            pending: {
                name: localize('In process'),
                description: localize('We’ve received your request and are waiting for more blockchain confirmations.'),
                renderer: 'in-process',
                transaction_hash: formatted_transaction_hash,
            },
        },
        withdrawal: {
            cancelled: {
                name: localize('Cancelled'),
                description: localize('You’ve cancelled your withdrawal request.'),
                renderer: 'unsuccessful',
                transaction_hash: localize('NA'),
            },
            error: {
                name: localize('Unsuccessful'),
                description: (
                    <Localize
                        key={0}
                        i18n_default_text='Your withdrawal is unsuccessful due to an error on the blockchain. Please <0>contact us</0> via live chat for more info.'
                        values={{
                            interpolation: { escapeValue: false },
                        }}
                        components={[<StaticUrl key={0} className='link' href='contact-us/?is_livechat_open=true' />]}
                    />
                ),
                renderer: 'unsuccessful',
                transaction_hash: localize('NA'),
            },
            locked: {
                name: localize('In review'),
                description: localize(
                    "We're reviewing your withdrawal request. You may still cancel this transaction if you wish. Once we start processing, you won't be able to cancel."
                ),
                renderer: 'in-review',
                transaction_hash: formatted_transaction_hash,
            },
            performing_blockchain_txn: {
                name: localize('In process'),
                description: localize('We’re sending your request to the blockchain.'),
                renderer: 'in-process',
                transaction_hash: formatted_transaction_hash,
            },
            processing: {
                name: localize('In process'),
                description: localize('We’re awaiting confirmation from the blockchain.'),
                renderer: 'in-process',
                transaction_hash: formatted_transaction_hash,
            },
            rejected: {
                name: localize('Unsuccessful'),
                description: localize(
                    "Your withdrawal is unsuccessful. We've sent you an email with more information."
                ),
                renderer: 'unsuccessful',
                transaction_hash: localize('NA'),
            },
            sent: {
                name: localize('Successful'),
                description: localize('Your withdrawal is successful.'),
                renderer: 'successful',
                transaction_hash: formatted_transaction_hash,
            },
            verified: {
                name: localize('In process'),
                description: localize('We’re processing your withdrawal.'),
                renderer: 'in-process',
                transaction_hash: formatted_transaction_hash,
            },
        },
    };

    let transaction_status;
    if (
        transaction_type === 'deposit' &&
        (status_code === 'confirmed' || status_code === 'error' || status_code === 'pending')
    ) {
        transaction_status = status_list[transaction_type][status_code];
    } else if (
        transaction_type === 'withdrawal' &&
        (status_code === 'cancelled' ||
            status_code === 'error' ||
            status_code === 'locked' ||
            status_code === 'performing_blockchain_txn' ||
            status_code === 'processing' ||
            status_code === 'rejected' ||
            status_code === 'sent' ||
            status_code === 'verified')
    ) {
        transaction_status = status_list[transaction_type][status_code];
    }

    return transaction_status as { name: string; description: ReactNode; renderer: string; transaction_hash: string };
};
