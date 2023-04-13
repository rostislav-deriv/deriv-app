import { action, computed, observable, makeObservable, IObservableArray } from 'mobx';
import { PaymentAgentListResponse, PaymentAgentDetailsResponse } from '@deriv/api-types';
import { formatMoney, routes, shuffleArray } from '@deriv/shared';
import { getNormalizedPaymentMethod } from 'Utils/utility';
import Constants from 'Constants/constants';
import ErrorStore from './error-store';
import {
    TWebSocket,
    TRootStore,
    TAgent,
    TPaymentAgent,
    TPaymentAgentWithdrawConfirm,
    TPaymentAgentWithdrawReceipt,
    TPaymentAgentWithdrawRequest,
    TExtendedPaymentAgentList,
    TSupportedBank,
    TPartialPaymentAgentList,
    TTarget,
    TServerError,
} from '../types';

export default class PaymentAgentStore {
    constructor(public WS: TWebSocket, public root_store: TRootStore) {
        makeObservable(this, {
            list: observable,
            agents: observable,
            container: observable,
            error: observable,
            filtered_list: observable,
            is_name_selected: observable,
            is_search_loading: observable,
            is_withdraw: observable,
            is_try_withdraw_successful: observable,
            is_withdraw_successful: observable,
            confirm: observable,
            receipt: observable,
            selected_bank: observable,
            supported_banks: observable,
            active_tab_index: observable,
            all_payment_agent_list: observable,
            search_term: observable,
            has_payment_agent_search_warning: observable,
            setActiveTabIndex: action.bound,
            setActiveTab: action.bound,
            is_payment_agent_visible: computed,
            getPaymentAgentList: action.bound,
            getPaymentAgentDetails: action.bound,
            addSupportedBank: action.bound,
            clearSupportedBanks: action.bound,
            sortSupportedBanks: action.bound,
            setList: action.bound,
            clearList: action.bound,
            setPaymentAgentList: action.bound,
            filterPaymentAgentList: action.bound,
            setSearchTerm: action.bound,
            setIsSearchLoading: action.bound,
            setPaymentAgentSearchWarning: action.bound,
            onChangePaymentMethod: action.bound,
            setIsWithdraw: action.bound,
            setIsTryWithdrawSuccessful: action.bound,
            setIsWithdrawSuccessful: action.bound,
            setConfirmation: action.bound,
            setReceipt: action.bound,
            addPaymentAgent: action.bound,
            onMountPaymentAgentWithdraw: action.bound,
            requestTryPaymentAgentWithdraw: action.bound,
            resetPaymentAgent: action.bound,
            onMountPaymentAgentList: action.bound,
            setAllPaymentAgentList: action.bound,
            is_payment_agent_visible_in_onboarding: computed,
            requestPaymentAgentWithdraw: action.bound,
            onRemount: observable,
            setOnRemount: action.bound,
        });

        this.root_store = root_store;
        this.WS = WS;
    }

    list: Array<TPartialPaymentAgentList> = [];
    agents: Array<TAgent> = [];
    container = Constants.containers.payment_agent;
    error = new ErrorStore();
    filtered_list: Array<TPartialPaymentAgentList> = [];
    is_name_selected = true;
    is_search_loading = false;
    is_withdraw = false;
    is_try_withdraw_successful = false;
    is_withdraw_successful = false;
    confirm: TPaymentAgentWithdrawConfirm = {};
    receipt: TPaymentAgentWithdrawReceipt = {};
    selected_bank: number | string = 0;
    supported_banks: Array<TSupportedBank> = [];
    active_tab_index = 0;
    all_payment_agent_list: PaymentAgentListResponse | null = null;
    search_term = '';
    has_payment_agent_search_warning = false;
    onRemount: VoidFunction | null = null;

    setActiveTabIndex(index: number) {
        this.active_tab_index = index;
    }

    setActiveTab(index: number) {
        this.setActiveTabIndex(index);
    }

    setOnRemount(func: VoidFunction): void {
        this.onRemount = func;
    }

    get is_payment_agent_visible() {
        return !!(this.filtered_list.length || this.agents.length || this.has_payment_agent_search_warning);
    }

    async getPaymentAgentList() {
        // wait for get_settings so residence gets populated in client-store
        // TODO: set residence in client-store from authorize so it's faster
        await this.WS.wait('get_settings');
        const { residence, currency } = this.root_store.client;
        return this.WS.authorized.paymentAgentList(residence, currency) as Promise<PaymentAgentListResponse>;
    }

    async getPaymentAgentDetails(): Promise<PaymentAgentDetailsResponse['paymentagent_details']> {
        const { paymentagent_details } = await this.WS.authorized.paymentAgentDetails();
        return paymentagent_details;
    }

    addSupportedBank(bank: string) {
        const supported_bank_exists = this.supported_banks.find(
            supported_bank => supported_bank.value === bank.toLowerCase()
        );
        if (!supported_bank_exists) {
            this.supported_banks.push({ text: bank, value: bank.toLowerCase() });
        }
    }

    clearSupportedBanks() {
        this.supported_banks = [];
    }

    sortSupportedBanks() {
        // sort supported banks alphabetically by value, the option 'All payment agents' with value 0 should be on top
        (this.supported_banks as IObservableArray<TSupportedBank>).replace(
            this.supported_banks.slice().sort((a, b) => {
                if (a.value < b.value) {
                    return -1;
                }
                if (a.value > b.value) {
                    return 1;
                }
                return 0;
            })
        );
    }

    setList(pa_list: TPartialPaymentAgentList) {
        this.list.push(pa_list);
    }

    clearList() {
        this.list = [];
    }

    async setPaymentAgentList(pa_list?: Array<TPaymentAgent>) {
        const { setLoading } = this.root_store.modules.cashier.general_store;
        this.clearList();
        this.clearSupportedBanks();
        try {
            (pa_list || (await this.getPaymentAgentList()).paymentagent_list?.list)?.forEach(payment_agent => {
                this.setList({
                    currency: payment_agent.currencies,
                    deposit_commission: payment_agent.deposit_commission,
                    email: payment_agent.email,
                    further_information: payment_agent.further_information,
                    max_withdrawal: payment_agent.max_withdrawal,
                    min_withdrawal: payment_agent.min_withdrawal,
                    name: payment_agent.name,
                    paymentagent_loginid: payment_agent.paymentagent_loginid,
                    phone_numbers: payment_agent.phone_numbers,
                    supported_banks: payment_agent.supported_payment_methods,
                    urls: payment_agent?.urls,
                    withdrawal_commission: payment_agent.withdrawal_commission,
                });
                const supported_banks_array = payment_agent?.supported_payment_methods
                    .map((bank: { payment_method?: string }) => {
                        if (bank.payment_method === undefined) return '';
                        const payment_method = getNormalizedPaymentMethod(
                            bank.payment_method,
                            Constants.payment_methods
                        );
                        //remove Skrill and Neteller from payment methods list (dropdown menu) as per mandate from Paysafe
                        return ['Neteller', 'Skrill'].includes(payment_method) ? '' : payment_method;
                    })
                    .filter(Boolean);
                supported_banks_array.forEach((bank: string) => this.addSupportedBank(bank));
            });
            shuffleArray(this.list);
        } catch (e) {
            setLoading(false);
            // eslint-disable-next-line no-console
            console.error(e);
        }

        this.sortSupportedBanks();
    }

    filterPaymentAgentList(bank?: number | string) {
        this.setPaymentAgentSearchWarning(false);
        const { common } = this.root_store;

        this.filtered_list = [];

        if (bank || this.selected_bank) {
            this.list.forEach(payment_agent => {
                const supported_banks = payment_agent?.supported_banks;
                if (supported_banks) {
                    const bank_index = supported_banks
                        .map(supported_bank =>
                            getNormalizedPaymentMethod(
                                supported_bank.payment_method || '',
                                Constants.payment_methods
                            ).toLowerCase()
                        )
                        .indexOf((bank || this.selected_bank).toString());

                    if (bank_index !== -1) this.filtered_list.push(payment_agent);
                }
            });
        } else {
            this.filtered_list = this.list;
        }
        if (this.search_term) {
            this.filtered_list = this.filtered_list.filter(payment_agent => {
                return payment_agent.name?.toLocaleLowerCase().includes(this.search_term.toLocaleLowerCase());
            }) as IObservableArray<TPartialPaymentAgentList>;

            if (this.filtered_list.length === 0) {
                this.setPaymentAgentSearchWarning(true);
            }
        }

        this.setIsSearchLoading(false);

        if (!this.is_payment_agent_visible && window.location.pathname.endsWith(routes.cashier_pa)) {
            common.routeTo(routes.cashier_deposit);
        }
    }

    setSearchTerm(search_term: string) {
        this.search_term = search_term;
    }

    setIsSearchLoading(value: boolean) {
        this.is_search_loading = value;
    }

    setPaymentAgentSearchWarning(value: boolean) {
        this.has_payment_agent_search_warning = value;
    }

    onChangePaymentMethod({ target }: TTarget) {
        const value = target.value === '0' ? parseInt(target.value) : target.value;
        this.selected_bank = value;
        this.filterPaymentAgentList(value);
    }

    setIsWithdraw(is_withdraw = !this.is_withdraw) {
        this.is_withdraw = is_withdraw;
    }

    setIsTryWithdrawSuccessful(is_try_withdraw_successful: boolean) {
        this.error.setErrorMessage({ code: '', message: '' });
        this.is_try_withdraw_successful = is_try_withdraw_successful;
    }

    setIsWithdrawSuccessful(is_withdraw_successful: boolean) {
        this.is_withdraw_successful = is_withdraw_successful;
    }

    setConfirmation({ amount, currency, loginid, payment_agent_name }: TPaymentAgentWithdrawConfirm) {
        this.confirm = {
            amount,
            currency,
            loginid,
            payment_agent_name,
        };
    }

    setReceipt({
        amount_transferred,
        payment_agent_email,
        payment_agent_id,
        payment_agent_name,
        payment_agent_phone,
        payment_agent_url,
    }: TPaymentAgentWithdrawReceipt) {
        this.receipt = {
            amount_transferred,
            payment_agent_email,
            payment_agent_id,
            payment_agent_name,
            payment_agent_phone,
            payment_agent_url,
        };
    }

    addPaymentAgent(payment_agent: TExtendedPaymentAgentList[0]) {
        this.agents.push({
            text: payment_agent.name,
            value: payment_agent.paymentagent_loginid,
            max_withdrawal: payment_agent.max_withdrawal,
            min_withdrawal: payment_agent.min_withdrawal,
            email: payment_agent.email,
            phone_numbers: payment_agent.phone_numbers,
            url: payment_agent.urls,
        });
    }

    async onMountPaymentAgentWithdraw() {
        const { common, modules } = this.root_store;
        const { setLoading, onMountCommon } = modules.cashier.general_store;

        setLoading(true);
        this.setOnRemount(this.onMountPaymentAgentWithdraw);
        onMountCommon();

        this.setIsWithdraw(true);
        this.setIsWithdrawSuccessful(false);
        this.setReceipt({});

        if (!this.agents.length) {
            const payment_agent_list = await this.getPaymentAgentList();
            payment_agent_list.paymentagent_list?.list.forEach(payment_agent => {
                this.addPaymentAgent(payment_agent);
            });
            if (
                !payment_agent_list.paymentagent_list?.list.length &&
                window.location.pathname.endsWith(routes.cashier_pa)
            ) {
                common.routeTo(routes.cashier_deposit);
            }
        }
        setLoading(false);
    }

    async requestTryPaymentAgentWithdraw({
        loginid,
        currency,
        amount,
        verification_code,
    }: TPaymentAgentWithdrawRequest) {
        this.error.setErrorMessage({ code: '', message: '' });
        const payment_agent_withdraw = await this.WS.authorized.paymentAgentWithdraw({
            loginid,
            currency,
            amount,
            verification_code,
            dry_run: 1,
        });
        if (Number(payment_agent_withdraw.paymentagent_withdraw) === 2) {
            const selected_agent = this.agents.find(agent => agent.value === loginid);
            this.setConfirmation({
                amount,
                currency,
                loginid,
                payment_agent_name: selected_agent?.text || payment_agent_withdraw.paymentagent_name,
            });
            this.setIsTryWithdrawSuccessful(true);
        } else {
            this.error.setErrorMessage(payment_agent_withdraw.error as TServerError, this.resetPaymentAgent);
        }
    }

    resetPaymentAgent = () => {
        const { client, modules } = this.root_store;
        const { active_container } = modules.cashier.general_store;
        const container = Constants.map_action[active_container as 'withdraw' | 'payment_agent'];

        client.setVerificationCode('', container);
        this.error.setErrorMessage({ code: '', message: '' });
        this.setIsWithdraw(false);
        this.setIsWithdrawSuccessful(false);
        this.setIsTryWithdrawSuccessful(false);
        this.setActiveTabIndex(0);
    };

    async onMountPaymentAgentList() {
        const { setLoading, onMountCommon } = this.root_store.modules.cashier.general_store;

        setLoading(true);
        this.onRemount = this.onMountPaymentAgentList;
        await onMountCommon();
        await this.getPaymentAgentList();

        setLoading(false);
    }

    async getAllPaymentAgentList() {
        await this.WS.wait('get_settings');
        return this.WS.allPaymentAgentList(this.root_store.client.residence);
    }

    setAllPaymentAgentList(list: PaymentAgentListResponse) {
        this.all_payment_agent_list = list;
    }

    get is_payment_agent_visible_in_onboarding() {
        return !!this.all_payment_agent_list?.paymentagent_list?.list?.length;
    }

    async requestPaymentAgentWithdraw({ loginid, currency, amount, verification_code }: TPaymentAgentWithdrawRequest) {
        this.error.setErrorMessage({ code: '', message: '' });
        const payment_agent_withdraw = await this.WS.authorized.paymentAgentWithdraw({
            loginid,
            currency,
            amount,
            verification_code,
        });
        if (Number(payment_agent_withdraw.paymentagent_withdraw) === 1) {
            const selected_agent = this.agents.find(agent => agent.value === loginid);
            this.setReceipt({
                amount_transferred: formatMoney(currency, amount, true),
                ...(selected_agent && {
                    payment_agent_email: selected_agent.email,
                    payment_agent_id: selected_agent.value,
                    payment_agent_name: selected_agent.text,
                    payment_agent_phone: selected_agent.phone_numbers,
                    payment_agent_url: selected_agent.url,
                }),
            });
            this.setIsWithdrawSuccessful(true);
            this.setIsTryWithdrawSuccessful(false);
            this.setConfirmation({});
        } else {
            this.error.setErrorMessage(payment_agent_withdraw.error as TServerError, this.resetPaymentAgent);
        }
    }
}
