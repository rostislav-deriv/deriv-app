import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@deriv/stores';
import { getTradingAccountName, getWalletCurrencyIcon } from '@deriv/utils';
import { useFetch } from '@deriv/api';
import useCurrencyConfig from './useCurrencyConfig';
import usePlatformAccounts from './usePlatformAccounts';
import useWalletsList from './useWalletsList';
import useActiveWallet from './useActiveWallet';

const useWalletTransactions = (
    action_type: '' | 'deposit' | 'withdrawal' | 'initial_fund' | 'reset_balance' | 'transfer',
    page_count?: number
) => {
    const {
        client: { loginid },
        ui: { is_dark_mode_on },
    } = useStore();
    const { data: wallets } = useWalletsList();
    const current_wallet = useActiveWallet();
    const { getConfig } = useCurrencyConfig();
    const { demo: demo_platform_account } = usePlatformAccounts();
    const { real: real_platform_accounts } = usePlatformAccounts();

    const accounts = useMemo(
        () => [demo_platform_account, ...real_platform_accounts],
        [demo_platform_account, real_platform_accounts]
    );

    const [is_complete_list, setIsCompleteList] = useState(false);
    const [transactions, setTransactions] = useState<
        Required<Required<NonNullable<typeof data>>['statement']>['transactions']
    >([]);

    const transactions_per_page = 10;

    const { data, isLoading, isSuccess } = useFetch('statement', {
        options: { keepPreviousData: true },
        payload: {
            // @ts-expect-error reset_balance is not supported in the API yet
            action_type: action_type || undefined,
            limit: page_count ? transactions_per_page : undefined,
            offset: page_count ? transactions_per_page * (page_count - 1) : 0,
        },
    });

    useEffect(() => setTransactions([]), [action_type]);

    useEffect(() => {
        if (data?.statement?.count !== 0) setIsCompleteList(false);
    }, [data?.statement]);

    useEffect(() => {
        if (is_complete_list || isLoading || !isSuccess) return;
        if (data?.statement?.count === 0) setIsCompleteList(true);
        const new_transactions = data?.statement?.transactions;
        if (new_transactions) setTransactions((prev: typeof transactions) => [...prev, ...new_transactions]);
    }, [is_complete_list, data?.statement, isLoading, isSuccess]);

    // This is for seeing the loader; TODO remove
    const [is_fetching, setIsFetching] = useState(false);
    useEffect(() => {
        setIsFetching(true);
    }, [action_type, page_count]);
    useEffect(() => {
        if (is_fetching) setTimeout(() => setIsFetching(false), 1000);
    }, [is_fetching]);

    const modified_transactions = useMemo(
        () =>
            wallets && current_wallet
                ? transactions
                      // Filter out transactions with missing data.
                      .filter(
                          (
                              transaction: typeof transactions[number]
                          ): transaction is Omit<
                              typeof transactions[number],
                              'action_type' | 'amount' | 'balance_after'
                          > & {
                              action_type: Exclude<typeof transactions[number]['action_type'], undefined>;
                              amount: Exclude<typeof transactions[number]['amount'], undefined>;
                              balance_after: Exclude<typeof transactions[number]['balance_after'], undefined>;
                          } =>
                              transaction.action_type !== undefined &&
                              transaction.amount !== undefined &&
                              transaction.balance_after !== undefined
                      )
                      .map(transaction => {
                          if (typeof transaction.action_type === 'undefined') return null;

                          if (transaction.action_type === 'transfer') {
                              const other_loginid =
                                  transaction.to?.loginid === loginid
                                      ? transaction.from?.loginid
                                      : transaction.to?.loginid;
                              if (!other_loginid) return null;
                              const other_account = accounts.find(el => el?.loginid === other_loginid);
                              if (!other_account || !other_account.currency || !other_account.account_type) return null;
                              const other_wallet = wallets.find(
                                  el => el.loginid === other_account.loginid
                              ) as typeof wallets[number];
                              return {
                                  ...transaction,
                                  account_category: other_account.account_category,
                                  account_currency: other_account.currency,
                                  account_name:
                                      other_account.account_category === 'wallet'
                                          ? `${other_wallet.is_virtual ? 'Demo ' : ''}${other_wallet.currency} Wallet`
                                          : getTradingAccountName(
                                                other_account.account_type as 'standard' | 'mt5' | 'dxtrade' | 'binary',
                                                !!other_account.is_virtual,
                                                other_account.landing_company_shortcode
                                            ),
                                  account_type: other_account.account_type,
                                  gradient_class: `wallet-card__${
                                      other_account.is_virtual === 1 ? 'demo' : other_account?.currency?.toLowerCase()
                                  }-bg${is_dark_mode_on ? '--dark' : ''}`,
                                  icon: getWalletCurrencyIcon(
                                      other_account.is_virtual ? 'demo' : other_account.currency || '',
                                      is_dark_mode_on,
                                      false
                                  ),
                                  icon_type:
                                      getConfig(other_account.currency)?.is_crypto || current_wallet.is_virtual
                                          ? 'crypto'
                                          : 'fiat',
                              };
                          }

                          return {
                              ...transaction,
                              account_category: 'wallet',
                              account_currency: current_wallet.currency,
                              account_name: `${current_wallet.is_virtual ? 'Demo ' : ''}${
                                  current_wallet.currency
                              } Wallet`,
                              account_type: current_wallet.account_type,
                              gradient_class: current_wallet.gradient_card_class,
                              icon: current_wallet.icon,
                              icon_type:
                                  current_wallet.currency_config?.is_crypto || current_wallet.is_virtual
                                      ? 'crypto'
                                      : 'fiat',
                          };
                      })
                      .filter(<T>(value: T | null): value is T => value !== null)
                : [],
        [accounts, current_wallet, getConfig, is_dark_mode_on, loginid, transactions, wallets]
    );

    return {
        transactions: modified_transactions,
        isLoading: isLoading || is_fetching,
        isSuccess,
        isComplete: is_complete_list && !is_fetching,
    };
};

export default useWalletTransactions;
