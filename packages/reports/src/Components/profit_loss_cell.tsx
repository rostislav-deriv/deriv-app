import React, { ReactNode } from 'react';
import { getProfitOrLoss } from '../Helpers/profit-loss';

type TProfitLossCell = {
    value: string;
    children: ReactNode;
};

const ProfitLossCell = ({ value, children }: TProfitLossCell) => {
    const status = getProfitOrLoss(value);

    return <span className={`amount--${status}`}>{children}</span>;
};

export default ProfitLossCell;
