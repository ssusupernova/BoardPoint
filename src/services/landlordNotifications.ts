/**
 * Landlord Notifications Center — categories, metadata, and preferences.
 *
 * Landlord alerts live inside `landlordData` (persisted with the rest of the
 * ledger) so they travel with properties, tenants, and bills. This module owns
 * the vocabulary: which kinds of alerts exist, how they are labelled/iconised,
 * and which kinds the landlord wants to receive. Preferences are device-local
 * and gate NEW alerts only — history already on the device keeps showing.
 *
 * Delivery is in-app first. Device push notifications are intentionally not
 * wired until a push service is configured; nothing sensitive is ever sent to
 * a lock screen.
 */

import { useSyncExternalStore, type ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { storageGet, storageSet } from '@/services/storage';

const PREFS_KEY = 'landlord.notificationPrefs';

/** Ionicons glyph name used by notification cards and preference rows. */
export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Categories of landlord-facing alerts. */
export type LandlordNotificationKind =
  | 'inquiry'
  | 'request'
  | 'rent'
  | 'overdue'
  | 'payment'
  | 'billing'
  | 'availability'
  | 'listing';

export const LANDLORD_NOTIFICATION_KINDS: readonly LandlordNotificationKind[] = [
  'inquiry',
  'request',
  'rent',
  'overdue',
  'payment',
  'billing',
  'availability',
  'listing',
];

export interface LandlordNotificationKindMeta {
  kind: LandlordNotificationKind;
  /** Preference label. */
  label: string;
  /** One-line explanation shown on the preferences screen. */
  description: string;
  icon: IconName;
}

export const LANDLORD_NOTIFICATION_META: Record<
  LandlordNotificationKind,
  LandlordNotificationKindMeta
> = {
  inquiry: {
    kind: 'inquiry',
    label: 'Renter inquiries',
    description: 'When a prospective renter asks about one of your rooms.',
    icon: 'chatbubble-ellipses-outline',
  },
  request: {
    kind: 'request',
    label: 'Tenancy requests',
    description: 'New rental requests and tenancy status updates.',
    icon: 'document-text-outline',
  },
  rent: {
    kind: 'rent',
    label: 'Rent reminders',
    description: 'Upcoming rent due dates for your tenants.',
    icon: 'calendar-outline',
  },
  overdue: {
    kind: 'overdue',
    label: 'Overdue balances',
    description: 'Bills that have passed their due date without full payment.',
    icon: 'alert-circle-outline',
  },
  payment: {
    kind: 'payment',
    label: 'Payments',
    description: 'Payments you record and payment updates from tenants.',
    icon: 'cash-outline',
  },
  billing: {
    kind: 'billing',
    label: 'Shared billing',
    description: 'Shared expenses, generated drafts, and finalized statements.',
    icon: 'receipt-outline',
  },
  availability: {
    kind: 'availability',
    label: 'Room availability',
    description: 'When a room is reserved, freed up, or changes availability.',
    icon: 'key-outline',
  },
  listing: {
    kind: 'listing',
    label: 'Listing status',
    description: 'When a property listing is published, archived, or deactivated.',
    icon: 'business-outline',
  },
};

/**
 * Where a notification should take the landlord. Resolved to a route by
 * `landlordNotificationLink` in `@/routes`.
 */
export type LandlordNotificationLink =
  | { kind: 'property'; propertyId: string }
  | { kind: 'room'; roomId: string }
  | { kind: 'tenant'; tenantId: string }
  | { kind: 'bill'; billId: string }
  | { kind: 'statement'; statementId: string }
  | { kind: 'expense'; expenseId: string }
  | { kind: 'bills' }
  | { kind: 'leases' }
  | { kind: 'payments' }
  | { kind: 'expenses' }
  | { kind: 'statements' };

/**
 * Best-effort category for alerts stored before categories existed (old
 * on-device caches). Titles/details were free text, so this is a keyword guess.
 */
export function inferNotificationKind(title: string, detail: string): LandlordNotificationKind {
  const text = `${title} ${detail}`.toLowerCase();
  if (text.includes('overdue')) return 'overdue';
  if (text.includes('payment') || text.includes('received')) return 'payment';
  if (text.includes('inquiry')) return 'inquiry';
  if (
    text.includes('request') ||
    text.includes('registration') ||
    text.includes('lease renewal') ||
    text.includes('tenan')
  ) {
    return 'request';
  }
  if (
    text.includes('statement') ||
    text.includes('expense') ||
    text.includes('draft bill') ||
    text.includes('billing')
  ) {
    return 'billing';
  }
  if (text.includes('available') || text.includes('reserved') || text.includes('vacant')) {
    return 'availability';
  }
  if (text.includes('listing') || text.includes('published') || text.includes('archived')) {
    return 'listing';
  }
  if (text.includes('rent') || text.includes('due')) return 'rent';
  return 'inquiry';
}

/* -------------------------------- preferences ---------------------------- */

export type LandlordNotificationPrefs = Record<LandlordNotificationKind, boolean>;

const DEFAULT_PREFS: LandlordNotificationPrefs = {
  inquiry: true,
  request: true,
  rent: true,
  overdue: true,
  payment: true,
  billing: true,
  availability: true,
  listing: true,
};

let prefs: LandlordNotificationPrefs = { ...DEFAULT_PREFS };
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getPrefsSnapshot(): LandlordNotificationPrefs {
  return prefs;
}

function normalizePrefs(parsed: unknown): LandlordNotificationPrefs {
  const next: LandlordNotificationPrefs = { ...DEFAULT_PREFS };
  if (!parsed || typeof parsed !== 'object') return next;
  for (const kind of LANDLORD_NOTIFICATION_KINDS) {
    const value = (parsed as Record<string, unknown>)[kind];
    if (typeof value === 'boolean') next[kind] = value;
  }
  return next;
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const raw = await storageGet(PREFS_KEY);
  if (!raw) return;
  try {
    prefs = normalizePrefs(JSON.parse(raw));
    emit();
  } catch {
    // Ignore malformed cache and keep the defaults.
  }
}

void hydrate();

export function useNotificationPrefs(): LandlordNotificationPrefs {
  return useSyncExternalStore(subscribe, getPrefsSnapshot, getPrefsSnapshot);
}

/** Whether new alerts of this kind should be recorded right now. */
export function isNotificationKindEnabled(kind: LandlordNotificationKind): boolean {
  return prefs[kind] !== false;
}

export async function setNotificationPref(
  kind: LandlordNotificationKind,
  enabled: boolean
): Promise<void> {
  prefs = { ...prefs, [kind]: enabled };
  emit();
  await storageSet(PREFS_KEY, JSON.stringify(prefs)).catch(() => undefined);
}

export async function resetNotificationPrefs(): Promise<void> {
  prefs = { ...DEFAULT_PREFS };
  emit();
  await storageSet(PREFS_KEY, JSON.stringify(prefs)).catch(() => undefined);
}
