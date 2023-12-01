import { useCallback } from 'react';
import { useAccountLimits, useAuthorize, useExchangeRate, usePOI } from '@deriv/api';
import { displayMoney as displayMoney_ } from '@deriv/api/src/utils';
import { TAccount, TInitialTransferFormValues } from '../types';

type TMessageFnOptions = {
    displayMoney?: (amount: number, currency: string, fractionalDigits: number) => string;
    exchangeRates?: ReturnType<typeof useExchangeRate>['data'];
    limits?: ReturnType<typeof useAccountLimits>['data'];
};

const unverifiedFirstTransferBetweenWalletsMessageFn = (
    fromAccount: NonNullable<TAccount>,
    toAccount: NonNullable<TAccount>,
    sourceAmount: number,
    options?: TMessageFnOptions
) => {
    const sourceWalletType = fromAccount.account_type === 'crypto' ? 'crypto' : 'fiat';
    const targetWalletType = toAccount.account_type === 'crypto' ? 'crypto' : 'fiat';
    const limitsCaseKey = `${sourceWalletType}_to_${targetWalletType}` as const;

    //@ts-expect-error needs backend type
    const allowedSumUSD = options?.limits?.lifetime_transfers?.[limitsCaseKey].allowed as number;
    //@ts-expect-error needs backend type
    const availableSumUSD = options?.limits?.lifetime_transfers?.[limitsCaseKey].available as number;

    const formattedAvailableSumUSD = options?.displayMoney?.(availableSumUSD, 'USD', 2);
    const formattedAvailableSumSourceCurrency = options?.displayMoney?.(
        allowedSumUSD / (options?.exchangeRates?.rates?.[fromAccount?.currency ?? 'USD'] ?? 1),
        fromAccount.currencyConfig?.display_code ?? '',
        fromAccount.currencyConfig?.fractional_digits ?? 2
    );

    const condition =
        fromAccount?.account_category === 'wallet' &&
        toAccount?.account_category === 'wallet' &&
        allowedSumUSD === availableSumUSD;
    const message = {
        text: `The lifetime transfer limit between cryptocurrency Wallets is up to ${formattedAvailableSumUSD} (${formattedAvailableSumSourceCurrency})`,
        type: 'success' as const,
    };
    return condition ? message : null;
};

const verifiedFirstTransferBetweenWalletsMessageFn = (
    sourceAccount: NonNullable<TAccount>,
    targetAccount: NonNullable<TAccount>,
    sourceAmount: number,
    options?: TMessageFnOptions
) => {
    //@ts-expect-error needs backend type
    const allowedSumUSD = options?.limits?.daily_cumulative_amount_transfers?.wallets.allowed;
    //@ts-expect-error needs backend type
    const availableSumUSD = options?.limits?.daily_cumulative_amount_transfers?.wallets.available;

    const sourceCurrencyLimit = allowedSumUSD / (options?.exchangeRates?.rates?.[sourceAccount.currency ?? 'USD'] ?? 1);
    const targetCurrencyLimit = allowedSumUSD / (options?.exchangeRates?.rates?.[targetAccount.currency ?? 'USD'] ?? 1);

    const formattedSourceCurrencyLimit = options?.displayMoney?.(
        sourceCurrencyLimit,
        sourceAccount.currencyConfig?.display_code ?? 'USD',
        sourceAccount.currencyConfig?.fractional_digits ?? 2
    );
    const formattedTargetCurrencyLimit = options?.displayMoney?.(
        targetCurrencyLimit,
        targetAccount.currencyConfig?.display_code ?? 'USD',
        targetAccount.currencyConfig?.fractional_digits ?? 2
    );

    const condition =
        sourceAccount.account_category === 'wallet' &&
        targetAccount.account_category === 'wallet' &&
        allowedSumUSD === availableSumUSD;
    const message = {
        text: `The daily transfer limit between your Wallets is ${formattedSourceCurrencyLimit} (${formattedTargetCurrencyLimit}).`,
        type: sourceAmount > sourceCurrencyLimit ? ('error' as const) : ('success' as const),
    };
    return condition ? message : null;
};

const UNVERIFIED_ACCOUNT_MESSAGE_FUNCTIONS = [unverifiedFirstTransferBetweenWalletsMessageFn];

const VERIFIED_ACCOUNT_MESSAGE_FUNCTIONS = [verifiedFirstTransferBetweenWalletsMessageFn];

const useTransferMessages = (
    fromAccount: NonNullable<TAccount>,
    toAccount: NonNullable<TAccount>,
    formData: TInitialTransferFormValues
) => {
    const { data: authorizeData } = useAuthorize();
    const { preferred_language: preferredLanguage } = authorizeData;
    const { data: poi } = usePOI();
    const { data: accountLimits } = useAccountLimits();
    const { data: exchangeRates } = useExchangeRate();

    const displayMoney = useCallback(
        (amount: number, currency: string, fractionalDigits: number) =>
            displayMoney_(amount, currency, {
                fractional_digits: fractionalDigits,
                preferred_language: preferredLanguage,
            }),
        [preferredLanguage]
    );

    const isAccountVerified = poi?.is_verified;

    const sourceAmount = formData.fromAmount;

    const messages: { text: string; type: 'error' | 'success' }[] = [];

    if (!isAccountVerified)
        UNVERIFIED_ACCOUNT_MESSAGE_FUNCTIONS.forEach(messageFn => {
            const message = messageFn(fromAccount, toAccount, sourceAmount, {
                displayMoney,
                exchangeRates,
                limits: accountLimits,
            });
            if (message) messages.push(message);
        });
    else
        VERIFIED_ACCOUNT_MESSAGE_FUNCTIONS.forEach(messageFn => {
            const message = messageFn(fromAccount, toAccount, sourceAmount, {
                displayMoney,
                exchangeRates,
                limits: accountLimits,
            });
            if (message) messages.push(message);
        });

    return messages;
};

export default useTransferMessages;
