/**
 * Standard Currency Formatter for CFP-ITMC System
 * Formats all amounts with dot as thousands separator: 100.000 FCFA (never 100 /000 or 100 000)
 */
export function formatFCFA(amount: number | string | undefined | null, includeUnit: boolean = true): string {
  if (amount === undefined || amount === null || amount === '') {
    return includeUnit ? '0 FCFA' : '0';
  }
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  if (isNaN(num)) {
    return includeUnit ? '0 FCFA' : '0';
  }
  
  // Format integer with dot separator: 100000 -> 100.000
  const rounded = Math.round(num);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return includeUnit ? `${formatted} FCFA` : formatted;
}

export function formatPrice(amount: number | string | undefined | null): string {
  return formatFCFA(amount, true);
}
