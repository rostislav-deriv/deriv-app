import React from 'react';
import { Loading, SideNote } from '@deriv/components';
import { useCurrentCurrencyConfig } from '@deriv/hooks';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { PageContainer } from 'Components/page-container';
import Error from '../../components/error';
import NoBalance from '../../components/no-balance';
import { CryptoTransactionsSideNoteRecentTransaction } from '../../modules/crypto-transactions/components';
import { useCashierStore } from '../../stores/useCashierStores';
import CryptoWithdrawal from './crypto-withdrawal';
import Withdraw from './withdraw';
import WithdrawalLocked from './withdrawal-locked';
import WithdrawalVerificationEmail from './withdrawal-verification-email';

const WithdrawalSideNotes = observer(() => {
    const currency_config = useCurrentCurrencyConfig();

    return (
        <>
            {currency_config.is_crypto && <CryptoTransactionsSideNoteRecentTransaction transaction_type='withdrawal' />}
            <SideNote title={localize('Note')}>
                <li>
                    {localize(
                        'Do not enter an address linked to an ICO purchase or crowdsale. If you do, the ICO tokens will not be credited into your account.'
                    )}
                </li>
                <li>
                    {localize(
                        'Please note that your maximum and minimum withdrawal limits aren’t fixed. They change due to the high volatility of cryptocurrency.'
                    )}
                </li>
                {currency_config.is_fiat && (
                    <li>{localize("We'll send you an email once your transaction has been processed.")}</li>
                )}
            </SideNote>
        </>
    );
});

const WithdrawalPageContent = observer(() => {
    const { client } = useStore();
    const {
        verification_code: { payment_withdraw: verification_code },
    } = client;
    const { iframe, withdraw, transaction_history } = useCashierStore();
    const { iframe_url } = iframe;
    const { is_withdraw_confirmed } = withdraw;
    const { is_crypto_transactions_visible } = transaction_history;
    const currency_config = useCurrentCurrencyConfig();

    if (!currency_config.is_crypto && (verification_code || iframe_url))
        return (
            <PageContainer hide_breadcrumb>
                <Withdraw />
            </PageContainer>
        );

    if (currency_config.is_crypto && (verification_code || is_withdraw_confirmed || is_crypto_transactions_visible))
        return (
            <PageContainer hide_breadcrumb right={<WithdrawalSideNotes />}>
                <CryptoWithdrawal />
            </PageContainer>
        );

    return (
        <PageContainer hide_breadcrumb right={currency_config.is_crypto ? <WithdrawalSideNotes /> : undefined}>
            <WithdrawalVerificationEmail />
        </PageContainer>
    );
});

const Withdrawal = observer(() => {
    const { client } = useStore();
    const {
        balance,
        is_switching,
        verification_code: { payment_withdraw: verification_code },
        setVerificationCode,
    } = client;
    const { withdraw } = useCashierStore();

    const {
        check10kLimit,
        error: { setErrorMessage },
        willMountWithdraw,
        error,
        is_10k_withdrawal_limit_reached,
        is_withdrawal_locked,
    } = withdraw;

    React.useEffect(() => {
        return () => {
            setErrorMessage({ code: '', message: '' });
        };
    }, [setErrorMessage]);

    React.useEffect(() => {
        check10kLimit();
    }, [check10kLimit]);

    React.useEffect(() => {
        return () => setVerificationCode('', 'payment_withdraw');
    }, [setVerificationCode]);

    React.useEffect(() => {
        return () => willMountWithdraw(verification_code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [willMountWithdraw]);

    if (is_switching || is_10k_withdrawal_limit_reached === undefined) return <Loading is_fullscreen={false} />;

    if (is_withdrawal_locked || is_10k_withdrawal_limit_reached)
        return (
            <PageContainer hide_breadcrumb>
                <WithdrawalLocked />
            </PageContainer>
        );

    if (!Number(balance))
        return (
            <PageContainer hide_breadcrumb>
                <NoBalance />
            </PageContainer>
        );

    if (error.is_show_full_page && error.message)
        return (
            <PageContainer hide_breadcrumb>
                <Error error={error} />
            </PageContainer>
        );

    return <WithdrawalPageContent />;
});

export default Withdrawal;
