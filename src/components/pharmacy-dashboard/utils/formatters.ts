
export const formatCurrency = (value: number, decimals = 2) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-GB').format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};
