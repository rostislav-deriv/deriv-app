import { useEffect, useState } from 'react';
import { useFetch } from '@deriv/api';

/** A custom hook to get a paginated list of transactions for an active wallet of a user, optionally filtered by transaction type */
const usePaginatedWalletTransactions = (
    action_type?: 'deposit' | 'withdrawal' | 'initial_fund' | 'reset_balance' | 'transfer',
    page_count?: number
) => {
    const [is_complete_list, setIsCompleteList] = useState(false);
    const [transactions, setTransactions] = useState<
        Required<Required<NonNullable<typeof data>>['statement']>['transactions']
    >([]);

    const transactions_per_page = 10;

    // Get the paginated and filtered list of transactions from the API.
    const { data, isLoading, isSuccess } = useFetch('statement', {
        options: { keepPreviousData: true },
        payload: {
            // @ts-expect-error reset_balance is not supported in the API yet
            action_type: action_type || undefined,
            limit: page_count ? transactions_per_page : undefined,
            offset: page_count ? transactions_per_page * (page_count - 1) : 0,
        },
    });

    // Reset transactions when action_type changes.
    useEffect(() => setTransactions([]), [action_type]);

    // Set the flag of list completeness when there are new transactions from the API.
    useEffect(() => {
        if (data?.statement?.count !== 0) setIsCompleteList(false);
    }, [data?.statement]);

    // Append new transactions to the list of transactions.
    useEffect(() => {
        if (is_complete_list || isLoading || !isSuccess) return;
        if (data?.statement?.count === 0) setIsCompleteList(true);
        const new_transactions = data?.statement?.transactions;
        if (new_transactions) setTransactions((prev: typeof transactions) => [...prev, ...new_transactions]);
    }, [is_complete_list, data?.statement, isLoading, isSuccess]);

    return { transactions, isComplete: is_complete_list, isLoading, isSuccess };
};

export default usePaginatedWalletTransactions;
