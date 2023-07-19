import { useMemo } from 'react';
import { useStore } from '@deriv/stores';
import { getWalletCurrencyIcon } from '@deriv/utils';
import useCurrencyConfig from './useCurrencyConfig';
import usePlatformAccounts from './usePlatformAccounts';
import useWalletsList from './useWalletsList';
import useActiveWallet from './useActiveWallet';
import usePaginatedWalletTransactions from './usePaginatedWalletTransactions';

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

    const { transactions, isComplete, isLoading, isSuccess } = usePaginatedWalletTransactions(action_type, page_count);

    const modified_transactions = useMemo(
        () =>
            wallets && current_wallet
                ? transactions
                      // Filter out transactions with undefined `action_type`, `amount`, or `balance_after`.
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
                              return {
                                  ...other_account,
                                  ...transaction,
                                  account_currency: other_account.currency,
                                  gradient_card_class: `wallet-card__${
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
                                  landing_company_shortcode: other_account.landing_company_shortcode,
                              };
                          }

                          return {
                              ...current_wallet,
                              ...transaction,
                              account_currency: current_wallet.currency,
                              icon_type:
                                  current_wallet.currency_config?.is_crypto || current_wallet.is_virtual
                                      ? 'crypto'
                                      : 'fiat',
                              landing_company_shortcode: undefined,
                          };
                      })
                      .filter(<T>(value: T | null): value is T => value !== null)
                : [],
        [accounts, current_wallet, getConfig, is_dark_mode_on, loginid, transactions, wallets]
    );

    return {
        transactions: modified_transactions,
        isLoading,
        isSuccess,
        isComplete,
    };
};

export default useWalletTransactions;
