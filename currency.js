/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Currency & Number Formatting Utilities
 * ============================================================
 * Consistent KES formatting across the entire application.
 */

/**
 * Format a number as Kenyan Shillings (KES)
 * @param {number} n - The number to format
 * @param {boolean} showZero - Whether to show "KES 0.00" for zero values
 * @returns {string} Formatted currency string
 */
export function fmtKES(n, showZero = true) {
  const v = parseFloat(n) || 0;
  if (v === 0 && !showZero) return '—';
  return 'KES ' + v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Parse a currency-formatted string back to number
 * @param {string} str 
 * @returns {number}
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.\-]/g, '')) || 0;
}

/**
 * Format number with commas only (no currency symbol)
 * @param {number} n 
 * @returns {string}
 */
export function fmtNumber(n) {
  const v = parseFloat(n) || 0;
  return v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format percentage
 * @param {number} n 
 * @param {number} decimals 
 * @returns {string}
 */
export function fmtPercent(n, decimals = 2) {
  const v = parseFloat(n) || 0;
  return v.toFixed(decimals) + '%';
}