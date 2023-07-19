import { useEffect, useState } from 'react';
import { useFetch } from '@deriv/api';

/** A custom hook to get a paginated list of transactions for an active wallet of a user, filtered by action type */
const usePaginatedWalletTransactions = (
    action_type?: 'deposit' | 'withdrawal' | 'initial_fund' | 'reset_balance' | 'transfer',
    page_count?: number
) => {
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

    return { transactions, isComplete: is_complete_list, isLoading, isSuccess };
};

export default usePaginatedWalletTransactions;
