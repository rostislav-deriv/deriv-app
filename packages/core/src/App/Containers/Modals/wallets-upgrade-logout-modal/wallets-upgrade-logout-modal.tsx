import React from 'react';
import { Dialog, Text } from '@deriv/components';
import { observer, useStore } from '@deriv/stores';
import { localize, Localize } from '@deriv/translations';
import { requestLogout } from 'Services/logout';
import './wallets-upgrade-logout-modal.scss';

const WalletsUpgradeLogoutModal = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;

    return (
        <Dialog
            className='wallets-upgrade-logout-modal'
            confirm_button_text={localize('Log out')}
            onConfirm={() => {
                requestLogout();
            }}
            is_visible
            dismissable={false}
            has_close_icon={false}
        >
            <div className='wallets-upgrade-logout-modal__pic' />
            <div className='wallets-upgrade-logout-modal__content'>
                <Localize
                    i18n_default_text="<0>You're almost there!</0>"
                    components={[<Text key={0} weight='bold' size={is_mobile ? 's' : 'm'} />]}
                />
                <Localize
                    i18n_default_text='<0>To complete your Wallet setup, log out and then log in again.</0>'
                    components={[<Text align={is_mobile ? 'center' : 'left'} key={0} size={is_mobile ? 'xxs' : 's'} />]}
                />
            </div>
        </Dialog>
    );
});

export default WalletsUpgradeLogoutModal;
