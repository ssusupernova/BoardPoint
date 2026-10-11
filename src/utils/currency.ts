import { formatNumber } from '@/utils/date';

/** Format a peso amount with thousands separators: 3500 -> "₱3,500". */
export function formatPeso(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}₱${formatNumber(String(Math.abs(rounded)))}`;
}
