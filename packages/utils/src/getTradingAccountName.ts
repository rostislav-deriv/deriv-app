const trading_accounts_display_prefixes = {
    standard: 'Deriv Apps',
    mt5: 'MT5',
    dxtrade: 'Deriv X',
    binary: 'Binary',
} as const;

const landing_company_display_shortcodes = {
    svg: 'SVG',
    malta: 'Malta',
} as const;

const getTradingAccountName = (
    account_type: 'standard' | 'mt5' | 'dxtrade' | 'binary',
    is_virtual: boolean,
    landing_company_shortcode: 'svg' | 'malta'
) => {
    return `${trading_accounts_display_prefixes[account_type]} ${
        is_virtual ? 'Demo' : `(${landing_company_display_shortcodes[landing_company_shortcode]})`
    } account`;
};

export default getTradingAccountName;
