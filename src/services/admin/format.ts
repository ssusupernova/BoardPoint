import type { DateRange } from './types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysAgo(days: number, hour = 9, minute = 15): string {
  const date = new Date(Date.now() - days * MS_PER_DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * MS_PER_DAY / 24).toISOString();
}

export function isWithinRange(iso: string | null, range: DateRange): boolean {
  if (!iso) return false;
  if (range === 'all') return true;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return Date.now() - new Date(iso).getTime() <= days * MS_PER_DAY;
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const TIME_FMT = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return DATE_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return `${DATE_FMT.format(date)} · ${TIME_FMT.format(date)}`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return TIME_FMT.format(new Date(iso));
}

/** Compact relative timestamp such as "4h ago" or "yesterday". */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(deltaMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

/** Whole hours between two timestamps; null when either side is missing. */
export function hoursBetween(fromIso: string, toIso: string | null): number | null {
  if (!toIso) return null;
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 3_600_000;
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function formatDateRangeLabel(range: DateRange): string {
  switch (range) {
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    default:
      return 'All time';
  }
}

/** Human readable byte size for document metadata. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
