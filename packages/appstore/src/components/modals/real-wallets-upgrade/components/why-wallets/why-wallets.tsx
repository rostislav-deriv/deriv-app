import React from 'react';
import { Text, Icon } from '@deriv/components';
import { Localize, localize } from '@deriv/translations';
import { useStore } from '@deriv/stores';
import './why-wallets.scss';
import WalletsImage from 'Assets/svgs/wallets';

const WhyWallets = () => {
    const { ui } = useStore();
    const { is_mobile } = ui;

    const bullets = [
        localize('Better funds segregation'),
        localize('Instant transfers between Wallets and trading accounts'),
        localize('Multiple currency support'),
    ];

    return (
        <div className='why-wallets__content'>
            <div className='why-wallets__image-container'>
                <WalletsImage image={`why_wallets_${is_mobile ? 'mobile' : 'desktop'}`} />
            </div>
            <Text
                as='h1'
                color='prominent'
                weight='bold'
                align='center'
                size={is_mobile ? 'xsm' : 'l'}
                className='why-wallets__title'
                line_height={is_mobile ? 'm' : 'xs'}
            >
                <Localize i18n_default_text='Why Wallets' />
            </Text>
            <Text
                as='p'
                color='prominent'
                size={is_mobile ? 's' : 'm'}
                align='center'
                className='why-wallets__description'
                line_height='m'
            >
                <Localize i18n_default_text='Deposit, transfer, trade' />
            </Text>
            <div className='why-wallets__bullet-list-container'>
                {bullets.map(bullet => (
                    <div key={bullet} className='why-wallets__bullet'>
                        {bullet && (
                            <div className='why-wallets__bullet-row'>
                                <Icon
                                    icon='IcAppstoreTick'
                                    className='why-wallets__bullet-icon'
                                    size={is_mobile ? 12 : 16}
                                />
                                <Text
                                    as='p'
                                    color='prominent'
                                    align='center'
                                    className='why-wallets__bullet-text'
                                    size={is_mobile ? 'xs' : 's'}
                                    line_height={is_mobile ? 's' : 'm'}
                                >
                                    {bullet}
                                </Text>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhyWallets;
