import React from 'react';
import { TImageTestID, TWalletsImagesListKey, WalletsImageProps } from './image-types';
import HowItWorks from 'Assets/svgs/wallets/how-it-works.svg';
import IntroducingWallets from 'Assets/svgs/wallets/introducing-wallets.svg';
import IntroducingWalletsEU from 'Assets/svgs/wallets/introducing-wallets-eu.svg';
import ReadyToEnableWalletsDesktop from './ready-to-enable-wallets-desktop.svg';
import ReadyToEnableWalletsMobile from './ready-to-enable-wallets-mobile.svg';
import ReadyDesktopEuImage from 'Assets/svgs/wallets/wallets-ready-desktop-eu.svg';
import ReadyDesktopImage from 'Assets/svgs/wallets/wallets-ready-desktop.svg';
import ReadyMobileEuImage from 'Assets/svgs/wallets/wallets-ready-mobile-eu.svg';
import ReadyMobileImage from 'Assets/svgs/wallets/wallets-ready-mobile.svg';
import TradingAccounts from 'Assets/svgs/wallets/trading-accounts.svg';
import TradingAccountsEU from 'Assets/svgs/wallets/trading-accounts-eu.svg';
import UpgradeDesktopImage from 'Assets/svgs/wallets/wallets-upgrade-desktop.svg';
import EnableWalletsModalDesktop from 'Assets/svgs/wallets/enable-wallets-modal-desktop.svg';
import EnableWalletsModalMobile from 'Assets/svgs/wallets/enable-wallets-modal-mobile.svg';
import UpgradeMobileImage from 'Assets/svgs/wallets/wallets-upgrade-mobile.svg';
import WalletsUpgradeStepOneDesktop from 'Assets/svgs/wallets/wallets-upgrade-step-one-desktop.svg';
import WalletsUpgradeStepOneMobile from 'Assets/svgs/wallets/wallets-upgrade-step-one-mobile.svg';

export const WalletsImagesList = {
    enable_wallets_modal_desktop: EnableWalletsModalDesktop,
    enable_wallets_modal_mobile: EnableWalletsModalMobile,
    how_it_works: HowItWorks,
    introducing_wallets: IntroducingWallets,
    introducing_wallets_eu: IntroducingWalletsEU,
    ready_desktop: ReadyDesktopImage,
    ready_desktop_eu: ReadyDesktopEuImage,
    ready_mobile: ReadyMobileImage,
    ready_mobile_eu: ReadyMobileEuImage,
    trading_accounts: TradingAccounts,
    trading_accounts_eu: TradingAccountsEU,
    upgrade_desktop: UpgradeDesktopImage,
    upgrading_desktop: ReadyDesktopImage,
    upgrading_desktop_eu: ReadyDesktopEuImage,
    upgrade_mobile: UpgradeMobileImage,
    upgrading_mobile: ReadyMobileImage,
    upgrading_mobile_eu: ReadyMobileEuImage,
    ready_to_enable_wallets_desktop: ReadyToEnableWalletsDesktop,
    ready_to_enable_wallets_mobile: ReadyToEnableWalletsMobile,
    wallets_upgrade_step_one_desktop: WalletsUpgradeStepOneDesktop,
    wallets_upgrade_step_one_mobile: WalletsUpgradeStepOneMobile,
} as const;

const WalletsImage = ({ image, className, width }: WalletsImageProps<TWalletsImagesListKey>) => {
    const Component = WalletsImagesList[image] as React.ElementType;
    const data_testid: TImageTestID = `dt_${image}`;

    return <Component className={className} style={{ width }} data-testid={data_testid} />;
};

export default WalletsImage;
