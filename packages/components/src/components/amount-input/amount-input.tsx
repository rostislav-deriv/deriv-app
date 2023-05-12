import React, { KeyboardEventHandler, useCallback, useState } from 'react';
import { isMobile } from '@deriv/shared';
import Input from '../input';
import Text from '../text';

type TAmountInput = {
    currency: string;
    decimal_places?: number;
    disabled?: boolean;
    initial_value?: number;
    label?: string;
    locale?: Intl.LocalesArgument;
    max_digits?: number;
    onChange?: (value: number) => void;
};

const AmountInput = ({
    currency,
    decimal_places = 2,
    disabled = false,
    initial_value = 0,
    label,
    locale,
    max_digits = 8,
    onChange,
}: TAmountInput) => {
    const [value, setValue] = useState(initial_value);
    const [focus, setFocus] = useState(false);
    const [isPasting, setIsPasting] = useState(false);

    const displayNumber = useCallback(
        (number: number) => number.toLocaleString(locale, { minimumFractionDigits: decimal_places }),
        [decimal_places, locale]
    );

    const onChangeHandler: React.ComponentProps<typeof Input>['onChange'] = e => {
        const input_value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
        let newValue = value;
        if (Number(input_value) <= Math.pow(10, max_digits)) {
            newValue = Number(input_value) / Math.pow(10, decimal_places);
        } else if (isPasting && value === 0) {
            newValue = Number(input_value.substring(0, max_digits)) / Math.pow(10, decimal_places);
        }
        setValue(newValue);
        onChange?.(newValue);
        setIsPasting(false);
    };

    const onMouseDownHandler: React.ComponentProps<typeof Input>['onMouseDown'] = e => {
        e.preventDefault();
        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
        e.currentTarget.focus();
    };

    const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.code.startsWith('Arrow')) e.preventDefault();
    };

    return (
        <div className='amount-input-wrapper'>
            <Text size={isMobile() ? 'xxs' : 'xs'}>{label}</Text>
            <div className='amount-input-container'>
                <Input
                    className='amount-input'
                    disabled={disabled || focus}
                    type='text'
                    value={`${displayNumber(value)} ${currency}`}
                />
                <Input
                    className='amount-input'
                    data-testid='dt_amount-input'
                    disabled={disabled}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onChange={onChangeHandler}
                    onKeyDown={onKeyDownHandler}
                    onMouseDown={onMouseDownHandler}
                    onPaste={() => setIsPasting(true)}
                    type='text'
                    value={displayNumber(value)}
                />
            </div>
        </div>
    );
};

export default AmountInput;
