import React from 'react';
import { render, screen } from '@testing-library/react';
import { useDepositLocked } from '@deriv/hooks';
import { ContentFlag } from '@deriv/shared';
import { mockStore } from '@deriv/stores';
import CashierProviders from '../../../cashier-providers';
import Deposit from '../deposit';
import { TRootStore } from '../../../types';

jest.mock('@deriv/hooks', () => ({
    ...jest.requireActual('@deriv/hooks'),
    useDepositLocked: jest.fn(() => false),
}));

jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Loading: () => <div>Loading</div>,
}));

jest.mock('Components/cashier-container/virtual', () => {
    const CashierContainerVirtual = () => <div>Virtual</div>;
    return CashierContainerVirtual;
});

jest.mock('Components/cashier-locked', () => {
    const CashierLocked = () => <div>CashierLocked</div>;
    return CashierLocked;
});

jest.mock('Components/funds-protection', () => {
    const FundsProtection = () => <div>FundsProtection</div>;
    return FundsProtection;
});

jest.mock('Components/crypto-transactions-history', () => {
    const CryptoTransactionsHistory = () => <div>CryptoTransactionsHistory</div>;
    return CryptoTransactionsHistory;
});

jest.mock('Components/error', () => {
    const ErrorComponent = () => <div>Error</div>;
    return ErrorComponent;
});

jest.mock('../crypto-deposit', () => {
    const CryptoDeposit = () => <div>CryptoDeposit</div>;
    return CryptoDeposit;
});

jest.mock('Components/cashier-container/real', () => {
    const CashierContainerReal = () => <div>Real</div>;
    return CashierContainerReal;
});

jest.mock('Components/cashier-onboarding/cashier-onboarding', () => {
    const CashierOnboarding = () => <div>CashierOnboarding</div>;
    return CashierOnboarding;
});

jest.mock('../deposit-locked', () => {
    const DepositLocked = () => <div>DepositLocked</div>;
    return DepositLocked;
});

describe('<Deposit />', () => {
    it('should render <Loading /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: true,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {
                        iframe_url: '',
                    },
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,

                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        const { rerender } = render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('Loading')).toBeInTheDocument();

        rerender(<Deposit setSideNotes={jest.fn()} />);

        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should render <Virtual /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: true,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('Virtual')).toBeInTheDocument();
    });

    it('should render <CashierLocked /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: true,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: true,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        const { rerender } = render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('CashierLocked')).toBeInTheDocument();

        rerender(<Deposit setSideNotes={jest.fn()} />);

        expect(screen.getByText('CashierLocked')).toBeInTheDocument();

        rerender(<Deposit setSideNotes={jest.fn()} />);

        expect(screen.getByText('CashierLocked')).toBeInTheDocument();
    });

    it('should render <FundsProtection /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: true, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('FundsProtection')).toBeInTheDocument();
    });

    it('should render <DepositLocked /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'real',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_deposit_lock: useDepositLocked.mockReturnValue(true),
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('DepositLocked')).toBeInTheDocument();
    });

    it('should render <CryptoTransactionsHistory /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_deposit_lock: useDepositLocked.mockReturnValue(false),
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: true,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('CryptoTransactionsHistory')).toBeInTheDocument();
    });

    it('should render <Error /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: 'error', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: true,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should render <CryptoDeposit /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'BTC',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_crypto: true,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { is_low_risk_cr_eu_real: true },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('CryptoDeposit')).toBeInTheDocument();
    });

    it('should render <Real /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: true,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('Real')).toBeInTheDocument();
    });

    it('should render <CashierOnboarding /> component', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'USD',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_deposit: false,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        render(<Deposit setSideNotes={jest.fn()} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(screen.getByText('CashierOnboarding')).toBeInTheDocument();
    });

    it('should trigger "setSideNotes" callback', () => {
        const mockRootStore = mockStore({
            client: {
                mt5_login_list: [
                    {
                        account_type: 'demo',
                        sub_account_type: 'financial_stp',
                    },
                ],
                currency: 'UST',
                can_change_fiat_currency: false,
                current_currency_type: 'fiat',
                is_switching: false,
                is_virtual: false,
            },
            modules: {
                cashier: {
                    iframe: {},
                    transaction_history: {
                        crypto_transactions: [{}],
                        is_crypto_transactions_visible: false,
                        onMount: jest.fn(),
                    },
                    deposit: {
                        error: { is_ask_uk_funds_protection: false, message: '', setErrorMessage: jest.fn() },
                        onMountDeposit: jest.fn(),
                    },
                    general_store: {
                        is_cashier_locked: false,
                        is_crypto: true,
                        is_deposit: true,
                        is_loading: false,
                        is_system_maintenance: false,
                        setActiveTab: jest.fn(),
                        setIsDeposit: jest.fn(),
                    },
                },
            },
            traders_hub: { content_flag: ContentFlag.CR_DEMO },
        });

        const setSideNotes = jest.fn();

        render(<Deposit setSideNotes={setSideNotes} />, {
            wrapper: ({ children }) => (
                <CashierProviders store={mockRootStore as TRootStore}>{children}</CashierProviders>
            ),
        });

        expect(setSideNotes).toHaveBeenCalledTimes(2);
    });
});
