import React, { useState } from 'react';
import { isMobile } from '@deriv/shared';
import Input from '../input';
import Text from '../text';
// import { useInputATMFormatter } from '@deriv/hooks';

type TAmountInput = {
    currency: string;
    decimal_places?: number;
    disabled?: boolean;
    initial_value?: number;
    label?: string;
    locale?: Intl.LocalesArgument;
    max_digits?: number;
    onChange?: (value: string) => void;
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
    // const formatter = useInputATMFormatter(initial_value, { fraction_digits: decimal_places, locale });
    const [focus, setFocus] = useState(false);

    const onChangeHandler: React.ComponentProps<typeof Input>['onChange'] = e => {
        // formatter.onChange(e as React.ChangeEvent<HTMLInputElement>);
    };

    // useEffect(() => onChange?.(formatter.value), [formatter.value]);

    return (
        <div className='amount-input-wrapper'>
            <Text size={isMobile() ? 'xxs' : 'xs'}>{label}</Text>
            <div className='amount-input-container'>
                <Input
                    className='amount-input'
                    disabled={disabled || focus}
                    type='text'
                    inputMode='numeric'
                    value={`${42 /* formatter.value */} ${currency}`}
                />
                <Input
                    className='amount-input'
                    data-testid='dt_amount-input'
                    type='text'
                    inputMode='numeric'
                    disabled={disabled}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    {
                        ...{} /*...formatter*/
                    }
                    onChange={onChangeHandler}
                />
            </div>
        </div>
    );
};

export default AmountInput;
