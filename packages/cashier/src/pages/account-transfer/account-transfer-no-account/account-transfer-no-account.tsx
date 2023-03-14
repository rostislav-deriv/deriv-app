import React from 'react';
import { Icon, Button, Text } from '@deriv/components';
import { getPlatformSettings, routes } from '@deriv/shared';
import { Localize } from '@deriv/translations';
import { useStore, observer } from '@deriv/stores';
import './account-transfer-no-account.scss';
import { useHistory } from 'react-router-dom';

type TAccountTransferNoAccount = {
    openAccountSwitcherModal?: () => void;
};

const AccountTransferNoAccount = observer(({ openAccountSwitcherModal }: TAccountTransferNoAccount) => {
    const {
        client: { is_dxtrade_allowed },
        traders_hub: { closeModal },
    } = useStore();

    const history = useHistory();

    React.useEffect(() => {
        closeModal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='cashier__wrapper cashier__no-balance'>
            <Icon icon='IcCashierNoBalance' className='cashier__no-balance-icon' size={116} />
            <Text as='h2' weight='bold' align='center'>
                <Localize i18n_default_text='You only have one account' />
            </Text>
            <Text as='p' size='xs' line_height='s' align='center' className='cashier__text'>
                {is_dxtrade_allowed ? (
                    <Localize i18n_default_text='Transferring funds will require you to create a second account' />
                ) : (
                    <Localize
                        i18n_default_text='Please create another Deriv or {{platform_name_mt5}} account.'
                        values={{ platform_name_mt5: getPlatformSettings('mt5').name }}
                    />
                )}
            </Text>
            <Button
                className='account-transfer-no-account__button'
                primary
                large
                onClick={() => {
                    history.push(routes.traders_hub);
                }}
            >
                <Localize i18n_default_text={`Back to trader's hub`} />
            </Button>
        </div>
    );
});

export default AccountTransferNoAccount;
