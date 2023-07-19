import * as React from 'react';
import { APIProvider, useFetch } from '@deriv/api';
import { mockStore, StoreProvider } from '@deriv/stores';
import { renderHook } from '@testing-library/react-hooks';
import usePaginatedWalletTransactions from '../usePaginatedWalletTransactions';

jest.mock('@deriv/api', () => ({
    ...jest.requireActual('@deriv/api'),
    useFetch: jest.fn(),
}));

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch<'statement'>>;

describe('usePaginatedWalletTransactions', () => {
    test('should return a list of transactions', () => {
        const mock = mockStore({});

        mockUseFetch.mockReturnValue({
            data: {
                statement: {
                    transactions: [
                        {
                            action_type: 'deposit',
                            amount: 25,
                            balance_after: 25,
                            transaction_id: 17494415481,
                            transaction_time: 1685942136,
                        },
                        {
                            action_type: 'withdrawal',
                            amount: 750,
                            balance_after: 0,
                            transaction_id: 17494415480,
                            transaction_time: 1685942135,
                        },
                        {
                            action_type: 'reset_balance',
                            amount: 350,
                            balance_after: 10000,
                            transaction_id: 13693003421,
                            transaction_time: 1685942133,
                        },
                        {
                            action_type: 'deposit',
                            amount: 1000,
                            balance_after: 1000,
                            transaction_id: 17494117539,
                            transaction_time: 1685942131,
                        },
                    ],
                },
            },
            isLoading: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof mockUseFetch>);

        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <StoreProvider store={mock}>{children}</StoreProvider>
            </APIProvider>
        );

        const { result } = renderHook(() => usePaginatedWalletTransactions('deposit'), { wrapper });

        expect(result.current.transactions).toEqual([
            {
                action_type: 'deposit',
                amount: 25,
                balance_after: 25,
                transaction_id: 17494415481,
                transaction_time: 1685942136,
            },
            {
                action_type: 'withdrawal',
                amount: 750,
                balance_after: 0,
                transaction_id: 17494415480,
                transaction_time: 1685942135,
            },
            {
                action_type: 'reset_balance',
                amount: 350,
                balance_after: 10000,
                transaction_id: 13693003421,
                transaction_time: 1685942133,
            },
            {
                action_type: 'deposit',
                amount: 1000,
                balance_after: 1000,
                transaction_id: 17494117539,
                transaction_time: 1685942131,
            },
        ]);
    });
});
