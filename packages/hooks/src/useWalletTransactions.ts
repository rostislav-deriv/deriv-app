import { useMemo } from 'react';
import { useStore } from '@deriv/stores';
import { getWalletCurrencyIcon } from '@deriv/utils';
import useCurrencyConfig from './useCurrencyConfig';
import usePlatformAccounts from './usePlatformAccounts';
import useWalletsList from './useWalletsList';
import useActiveWallet from './useActiveWallet';
import usePaginatedWalletTransactions from './usePaginatedWalletTransactions';

/** A custom hook to get a list of transactions for an active wallet of a user, optionally filtered by transaction type */
const useWalletTransactions = (
    action_type?: 'deposit' | 'withdrawal' | 'initial_fund' | 'reset_balance' | 'transfer',
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

    // Combine demo and real accounts into one list of user accounts.
    const accounts = useMemo(
        () => [demo_platform_account, ...real_platform_accounts],
        [demo_platform_account, real_platform_accounts]
    );

    // Get the paginated and filtered list of transactions from the API.
    const { transactions, ...rest } = usePaginatedWalletTransactions(action_type, page_count);

    // Add additional information to each transaction.
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
                                  /** The currency of a trading account that was part of the transfer to/from the wallet. */
                                  account_currency: other_account.currency,
                                  /** The gradient class name for the account card background. */
                                  gradient_card_class: `wallet-card__${
                                      other_account.is_virtual === 1 ? 'demo' : other_account?.currency?.toLowerCase()
                                  }-bg${is_dark_mode_on ? '--dark' : ''}`,
                                  /** Local asset name for the account icon. ex: `IcWalletCurrencyUsd` for `USD`  */
                                  icon: getWalletCurrencyIcon(
                                      other_account.is_virtual ? 'demo' : other_account.currency || '',
                                      is_dark_mode_on,
                                      false
                                  ),
                                  /** The type of the icon: `demo`, `fiat`, or `crypto`. */
                                  icon_type:
                                      getConfig(other_account.currency)?.is_crypto || current_wallet.is_virtual
                                          ? 'crypto'
                                          : 'fiat',
                                  /** Landing company shortcode the account belongs to. */
                                  landing_company_shortcode: other_account.landing_company_shortcode,
                              };
                          }

                          return {
                              ...current_wallet,
                              ...transaction,
                              /** The currency of the active wallet. */
                              account_currency: current_wallet.currency,
                              /** The type of the icon: `demo`, `fiat`, or `crypto`. */
                              icon_type:
                                  current_wallet.currency_config?.is_crypto || current_wallet.is_virtual
                                      ? 'crypto'
                                      : 'fiat',
                              /** Landing company shortcode the account belongs to. */
                              landing_company_shortcode: undefined,
                          };
                      })
                      .filter(<T>(value: T | null): value is T => value !== null)
                : [],
        [accounts, current_wallet, getConfig, is_dark_mode_on, loginid, transactions, wallets]
    );

    return {
        /** List of transactions of the active wallet of the current user. */
        transactions: modified_transactions,
        ...rest,
    };
};

export default useWalletTransactions;
