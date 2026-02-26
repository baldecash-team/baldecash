/**
 * Utility function to format money amounts
 * Formats numbers with thousand separators
 * Shows decimals only if the number has significant decimal places
 * Example: 3204 -> "3,204", 180.50 -> "180.50", 2484.99 -> "2,484.99"
 */

export const formatMoney = (amount: number): string => {
  const hasDecimals = amount % 1 !== 0;
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Format money without decimals (for whole numbers display)
 * Example: 3204 -> "3,204"
 */
export const formatMoneyNoDecimals = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
