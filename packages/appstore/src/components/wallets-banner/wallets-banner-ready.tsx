import React from 'react';
import WalletsImage from 'Assets/svgs/wallets';
import { Button, Icon, Text } from '@deriv/components';
import { Localize, localize } from '@deriv/translations';
import { TWalletsImagesListKey } from 'Assets/svgs/wallets/image-types';
import { observer, useStore } from '@deriv/stores';

// just for now for testing purpose, in the future 'is_eu' value will be taken from the store
type TWalletsBannerReady = {
    is_eu?: boolean;
};

const WalletsBannerReady = observer(({ is_eu }: TWalletsBannerReady) => {
    const {
        client: { logout },
        ui: { is_mobile },
    } = useStore();

    const image: TWalletsImagesListKey = is_mobile
        ? `ready_mobile${is_eu ? '_eu' : ''}`
        : `ready_desktop${is_eu ? '_eu' : ''}`;
    const title_size = is_mobile ? 'xs' : 'sm';
    const description_size = is_mobile ? 'xxxs' : 'xs';
    const tick_size = is_mobile ? 16 : 24;

    const onButtonClickHandler = async () => {
        await logout();
    };

    return (
        <div className='wallets-banner__container wallets-banner__ready-banner'>
            <div className='wallets-banner__ready-banner-description'>
                <div className='wallets-banner__ready-banner-tick' data-testid='dt_wallets-ready-tick'>
                    <Icon icon='IcAppstoreTickWhite' size={tick_size} />
                </div>
                <Localize
                    i18n_default_text='<0>Your Wallets are ready</0>'
                    components={[<Text key={0} weight='bold' size={title_size} />]}
                />
                <Localize
                    i18n_default_text='<0>To complete the upgrade, please log out and log in again to add more accounts and make transactions with your Wallets.</0>'
                    components={[<Text key={0} size={description_size} />]}
                />
                <Button
                    onClick={onButtonClickHandler}
                    className='wallets-banner__ready-banner-button'
                    text={localize('Log out')}
                    primary
                    large
                />
            </div>
            <WalletsImage image={image} className='wallets-banner__image wallets-banner__ready-banner-image' />
        </div>
    );
});

export default WalletsBannerReady;