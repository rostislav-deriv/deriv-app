import React from 'react';
import classNames from 'classnames';
import Icon from '../icon';
import './wallet-icon.scss';

type TWalletIconSizes = keyof typeof sizes['fiat' | 'crypto'];

type TWalletIconProps = {
    currency?: string;
    icon: string;
    size?: TWalletIconSizes;
    type?: 'fiat' | 'crypto' | 'app';
    has_bg?: boolean;
    is_demo?: boolean;
    is_dark?: boolean;
};

const sizes = {
    fiat: {
        xsmall: 12,
        small: 16,
        medium: 24,
        large: 32,
        xlarge: 48,
    },
    crypto: {
        xsmall: {
            width: 20,
            height: 12,
        },
        small: {
            width: 32,
            height: 20,
        },
        medium: {
            width: 48,
            height: 30,
        },
        large: {
            width: 64,
            height: 40,
        },
        xlarge: {
            width: 96,
            height: 60,
        },
    },
} as const;

const WalletIcon = ({ currency, icon, size = 'medium', type, has_bg, is_demo, is_dark }: TWalletIconProps) => {
    if (!icon) {
        return null;
    }

    const active_currency_for_bg = is_demo ? 'demo' : currency;

    return (
        <div
            className={classNames('wallet-icon', {
                [`wallet-icon--${size} wallet-icon__default-bg wallet-card__${active_currency_for_bg?.toLowerCase()}-bg${
                    is_dark ? '--dark' : ''
                }`]: (!!currency && type !== 'app') || has_bg,
            })}
        >
            {(type === 'fiat' || type === 'app') && <Icon icon={icon} size={sizes.fiat[size]} />}
            {type === 'crypto' && (
                <Icon icon={icon} width={sizes.crypto[size].width} height={sizes.crypto[size].height} />
            )}
        </div>
    );
};

export default WalletIcon;
