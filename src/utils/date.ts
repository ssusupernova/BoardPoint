export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_ABBRS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

/** ISO date string (yyyy-mm-dd, local time) for a Date. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse an ISO date as a local date; null when malformed. */
export function parseISODate(iso: string | null): Date | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "SUNDAY, OCTOBER 11, 2026" for a Date; empty when invalid. */
export function formatLongDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return '';
  return `${WEEKDAY_NAMES[date.getDay()].toUpperCase()}, ${MONTH_NAMES[
    date.getMonth()
  ].toUpperCase()} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "15 Oct 2026" for display; falls back to the raw string. */
export function formatDisplayDate(iso: string | null): string {
  const date = parseISODate(iso);
  if (!date) return iso ?? '';
  return `${date.getDate()} ${MONTH_ABBRS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "15 Oct" for compact due-date labels; falls back to the raw string. */
export function formatShortDate(iso: string | null): string {
  const date = parseISODate(iso);
  if (!date) return iso ?? '';
  return `${date.getDate()} ${MONTH_ABBRS[date.getMonth()]}`;
}

/**
 * Human-friendly age of an ISO datetime: "Just now", "42m ago", "3h ago",
 * "Yesterday", "4d ago", or a full display date beyond a week.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const elapsed = Date.now() - then.getTime();
  if (elapsed < 0) return formatDisplayDate(toISODate(then));

  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return formatDisplayDate(toISODate(then));
}

/**
 * Weeks (Sunday-first) of day numbers for a month; leading/trailing cells are
 * null so the calendar grid stays rectangular.
 */
export function buildMonthGrid(year: number, month: number): (number | null)[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Group digits with thousands separators: 3500 -> "3,500". */
export function formatNumber(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
