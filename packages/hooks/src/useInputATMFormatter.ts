import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useInputDecimalFormatter from './useInputDecimalFormatter';

const unFormatLocaleStringifyNumber = (input: string, locale: Intl.LocalesArgument) => {
    const parts = (12345.6789).toLocaleString(locale).match(/(\D+)/g);

    if (parts && parts.length > 1) {
        const is_reverse = parts[parts.length - 1] !== '.';
        const decimal = parts[parts.length - 1];
        const thousand = parts[0];

        if (is_reverse) return input.replaceAll(decimal, 'x').replaceAll(thousand, '').replaceAll('x', '.');

        return input.replaceAll(thousand, '');
    }

    return input;
};

type TOptions = {
    fraction_digits?: number;
    locale?: Intl.LocalesArgument;
};

const useInputATMFormatter = (initial?: number, options?: TOptions) => {
    const is_pasting = useRef(false);
    const { value, onChange: onChangeDecimal } = useInputDecimalFormatter(undefined, options);
    const { locale, fraction_digits = 2 } = options || {};
    const [caret_right_offset, setCaretRightOffset] = useState(0);
    const [selection, setSelection] = useState<{
        selectionStart: number;
        selectionEnd: number;
    }>({ selectionStart: 0, selectionEnd: 0 });
    const [target, setTarget] = useState<Partial<React.ChangeEvent<HTMLInputElement>['target']>>();

    const formatted_value = useMemo(
        () => `${Number(value).toLocaleString(locale, { minimumFractionDigits: fraction_digits })}`,
        [fraction_digits, locale, value]
    );

    useEffect(() => {
        // update caret position every time the value changes (this happens after onChange)
        const updated_caret_position = value.length - caret_right_offset;
        if (target?.setSelectionRange) target.setSelectionRange?.(updated_caret_position, updated_caret_position);
        setSelection({ selectionStart: updated_caret_position, selectionEnd: updated_caret_position });
    }, [value, target]);

    const onChange = useCallback(
        (
            e: Partial<Omit<React.ChangeEvent<HTMLInputElement>, 'target'>> & {
                target: Partial<React.ChangeEvent<HTMLInputElement>['target']>;
            }
        ) => {
            if (e.target) setTarget(e.target);
            const new_value = e?.target?.value || '';
            const unformatted = unFormatLocaleStringifyNumber(new_value, locale);
            // @ts-expect-error shouldn't cast to number because we will lose the trailing zeros.
            const shifted = Math.fround(unformatted * 10).toFixed(fraction_digits);
            // @ts-expect-error shouldn't cast to number because we will lose the trailing zeros.
            const un_shifted = Math.fround(unformatted / 10).toFixed(fraction_digits);
            const unformatted_fraction = unformatted.split('.')?.[1]?.length || fraction_digits;

            // If the user is pasting, we don't need to shift the decimal point,
            // We just need to format the value.
            if (is_pasting.current) {
                is_pasting.current = false;
                return onChangeDecimal({ target: { value: unformatted } });
            }

            // The new value has one more decimal places than the fraction_digits,
            // so we need to shift the decimal point to the left.
            if (unformatted_fraction - 1 === fraction_digits) {
                return onChangeDecimal({ target: { value: shifted } });
            }

            // The new value has one less decimal places than the fraction_digits,
            // so we need to shift the decimal point to the right.
            if (unformatted_fraction + 1 === fraction_digits) {
                return onChangeDecimal({ target: { value: un_shifted } });
            }

            // The new value has the same number of decimal places as the fraction_digits,
            // so we don't need to shift the decimal point.
            if (unformatted_fraction === fraction_digits) {
                return onChangeDecimal({ target: { value: unformatted } });
            }

            // The new value has more decimal places than the fraction_digits,
            // so we chop the extra decimal points.
            if (unformatted_fraction - 1 > fraction_digits) {
                return onChangeDecimal({ target: { value: unformatted } });
            }

            // The new value has less decimal places than the fraction_digits,
            // so we add the missing extra decimal point.
            if (unformatted_fraction + 1 < fraction_digits) {
                return onChangeDecimal({ target: { value: unformatted } });
            }

            return onChangeDecimal({ target: { value: unformatted } });
        },
        [locale, fraction_digits, onChangeDecimal]
    );

    const onPaste: React.ClipboardEventHandler<HTMLInputElement> = useCallback(
        e => (is_pasting.current = e.type === 'paste'),
        []
    );

    const onAction: React.KeyboardEventHandler<HTMLInputElement> & React.MouseEventHandler<HTMLInputElement> =
        useCallback(e => {
            if (e.currentTarget.selectionStart !== null && e.currentTarget.selectionEnd !== null) {
                setCaretRightOffset(e.currentTarget.value.length - e.currentTarget.selectionEnd);
                setSelection({
                    selectionStart: e.currentTarget.selectionStart,
                    selectionEnd: e.currentTarget.selectionEnd,
                });
            }
        }, []);

    useEffect(() => {
        if (initial) {
            is_pasting.current = true;
            onChange({
                target: {
                    value: `${Number(initial).toLocaleString(locale, { minimumFractionDigits: fraction_digits })}`,
                },
            });
        }
    }, [fraction_digits, initial, locale, onChange]);

    return {
        value: formatted_value,
        onChange,
        onPaste,
        onKeyDown: onAction,
        onMouseUp: onAction,
        onMouseDown: onAction,
    };
};

export default useInputATMFormatter;
