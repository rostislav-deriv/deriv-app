import React from 'react';
import { Statement } from '@deriv/api-types';
import { isMobile } from '@deriv/shared';
import { AppLinkedWithWalletIcon, Text, WalletIcon } from '@deriv/components';

type StatementTransaction = DeepRequired<Statement>['transactions'][number];

type TFiatTransactionListItem = Pick<StatementTransaction, 'amount' | 'balance_after'> & {
    action_type:
        | (StatementTransaction['action_type'] & ('deposit' | 'withdrawal' | 'transfer'))
        | 'initial_fund'
        | 'reset_balance';
    account_currency: string;
    account_name: string;
    currency: string;
    icon: string;
    icon_type: string;
    platform?: string | null;
};

const FiatTransactionListItem = ({
    account_currency,
    account_name,
    action_type,
    amount,
    balance_after,
    currency,
    icon,
    icon_type,
    platform,
}: TFiatTransactionListItem) => {
    const formatAmount = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2 });

    const formatActionType = (value: string) => value[0].toUpperCase() + value.substring(1).replace(/_/, ' ');

    return (
        <div className='fiat-transaction-list__item'>
            <div>
                {platform ? (
                    <AppLinkedWithWalletIcon
                        app_icon={platform}
                        currency={account_currency}
                        type={icon_type}
                        wallet_icon={icon}
                    />
                ) : (
                    <WalletIcon currency={account_currency} icon={icon} type={icon_type} has_bg={true} size='medium' />
                )}
                <span>
                    <Text
                        size={isMobile() ? 'xxxs' : 'xxs'}
                        color='less-prominent'
                        weight='lighter'
                        line_height={isMobile() ? 's' : 'm'}
                    >
                        {formatActionType(action_type)}
                    </Text>
                    <Text
                        size={isMobile() ? 'xxxs' : 'xxs'}
                        color='prominent'
                        weight='bold'
                        line_height={isMobile() ? 's' : 'm'}
                    >
                        {account_name}
                    </Text>
                </span>
            </div>
            <span>
                <Text
                    size={isMobile() ? 'xxxs' : 'xxs'}
                    color={amount > 0 ? 'profit-success' : 'loss-danger'}
                    weight='bold'
                    line_height={isMobile() ? 's' : 'm'}
                >
                    {(amount > 0 ? '+' : '') + formatAmount(amount)} {currency}
                </Text>
                <Text
                    size={isMobile() ? 'xxxxs' : 'xxxs'}
                    color='less-prominent'
                    weight='lighter'
                    line_height={isMobile() ? 'm' : 's'}
                >
                    Balance: {formatAmount(balance_after)} {currency}
                </Text>
            </span>
        </div>
    );
};

export default FiatTransactionListItem;
