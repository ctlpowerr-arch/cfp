/**
 * Formatting utilities for Cameroon Franc CFA currency and numbers
 * Ensures thousands separators are always dots (.) without line-breaking spaces or slashes
 * Example: 100000 -> "100.000FCFA" or "100.000 FCFA"
 */

export function formatNumberWithDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const cleanVal = typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val;
  const num = Math.round(Number(cleanVal));
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatFCFA(val: number | string | undefined | null, withSpace: boolean = false): string {
  const dots = formatNumberWithDots(val);
  return withSpace ? `${dots} FCFA` : `${dots}FCFA`;
}
