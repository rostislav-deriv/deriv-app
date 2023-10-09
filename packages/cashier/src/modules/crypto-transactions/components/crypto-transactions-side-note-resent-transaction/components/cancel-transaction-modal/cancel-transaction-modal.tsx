import React from 'react';
import { Button, Text } from '@deriv/components';
import { useStore } from '@deriv/stores';
import { useModal } from '@deriv/wallets/src/components/ModalProvider';
import { WalletModal } from '@deriv/wallets/src/components/WalletModal';
import { useCashierStore } from 'Stores/useCashierStores';
import './cancel-transaction-modal.scss';

type TCancelTransactionModal = {
    transaction_id: string;
};

const CancelTransactionModal = ({ transaction_id }: TCancelTransactionModal) => {
    const { hide } = useModal();
    const {
        ui: { is_mobile },
    } = useStore();
    const {
        transaction_history: { cancelCryptoTransaction },
    } = useCashierStore();

    return (
        <WalletModal hideCloseButton>
            <Text line_height={is_mobile ? 's' : 'm'} size={is_mobile ? 'xs' : 's'} weight='bold'>
                Cancel transaction
            </Text>
            <Text line_height={is_mobile ? 'm' : 's'} size={is_mobile ? 'xxs' : 'xs'}>
                Are you sure you want to cancel this transaction?
            </Text>
            <div className='wallets-modal__buttons-container'>
                <Button secondary onClick={hide}>
                    No, don&apos;t cancel
                </Button>
                <Button
                    primary
                    onClick={async () => {
                        await cancelCryptoTransaction(transaction_id);
                        hide();
                    }}
                >
                    Yes, cancel
                </Button>
            </div>
        </WalletModal>
    );
};

export default CancelTransactionModal;
