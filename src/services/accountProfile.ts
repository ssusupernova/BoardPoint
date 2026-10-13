/**
 * BoardPoint landlord-account profile service.
 *
 * Name and email are owned by the auth account (`@/services/auth`); phone and
 * profile photo live here, keyed per account id, held in a tiny observable
 * store and persisted on-device — the same pattern as the renter-contact
 * service, but scoped to whoever is signed in.
 *
 * Also exposes:
 *  - an in-memory draft of unsaved profile edits, so the account screen can
 *    warn before signing out, and
 *  - `useAccountStanding`, which reads the REAL verification and account
 *    status from the admin database (the app's backend). Landlords can never
 *    change these values from the app.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { storageGet, storageSet } from '@/services/storage';
import { useAdminStore } from '@/services/admin/store';
import type { AccountStatus, LandlordVerificationState } from '@/services/admin/types';

/** Extra account fields owned by the signed-in user's profile. */
export interface AccountProfile {
  phone: string;
  photoUri: string | null;
}

/** Snapshot of profile edits that haven't been saved yet. */
export interface ProfileDraft {
  fullName: string;
  email: string;
  phone: string;
  photoUri: string | null;
}

const EMPTY_PROFILE: AccountProfile = { phone: '', photoUri: null };

function profileKey(userId: string): string {
  return `profile.account.${userId}`;
}

/* -------------------------------------------------------------- store state */

const profiles = new Map<string, AccountProfile>();
const hydratedIds = new Set<string>();
const drafts = new Map<string, ProfileDraft>();
const listeners = new Set<() => void>();
let version = 0;

function emit(): void {
  version += 1;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return version;
}

async function hydrateProfile(userId: string): Promise<void> {
  if (hydratedIds.has(userId)) return;
  hydratedIds.add(userId);
  const raw = await storageGet(profileKey(userId));
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<AccountProfile>;
    profiles.set(userId, {
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      photoUri: typeof parsed.photoUri === 'string' ? parsed.photoUri : null,
    });
    emit();
  } catch {
    // Ignore a malformed cache and keep the empty defaults.
  }
}

/* --------------------------------------------------------------------- hooks */

/** Phone + profile photo for the signed-in account (empty until hydrated). */
export function useAccountProfile(userId: string | null): AccountProfile {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (userId) void hydrateProfile(userId);
  }, [userId]);
  return (userId && profiles.get(userId)) || EMPTY_PROFILE;
}

/** Unsaved profile edits for this account, or null when everything is saved. */
export function useProfileDraft(userId: string | null): ProfileDraft | null {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (userId && drafts.get(userId)) || null;
}

/* ----------------------------------------------------------------- mutations */

export async function saveAccountProfile(
  userId: string,
  next: AccountProfile
): Promise<void> {
  profiles.set(userId, { phone: next.phone.trim(), photoUri: next.photoUri });
  emit();
  await storageSet(profileKey(userId), JSON.stringify(profiles.get(userId)));
}

/** Records (or clears) the unsaved-edits draft used by the logout warning. */
export function setProfileDraft(userId: string, draft: ProfileDraft | null): void {
  if (draft) {
    drafts.set(userId, draft);
  } else {
    drafts.delete(userId);
  }
  emit();
}

/* ------------------------------------------------------- verification status */

export interface AccountStanding {
  /** True while the admin database is still loading. */
  loading: boolean;
  verification: LandlordVerificationState;
  accountStatus: AccountStatus | null;
  suspensionReason: string | null;
  joinedAt: string | null;
  /** True when an administrator record exists for this email address. */
  linked: boolean;
}

const UNVERIFIED: AccountStanding = {
  loading: false,
  verification: 'unverified',
  accountStatus: null,
  suspensionReason: null,
  joinedAt: null,
  linked: false,
};

/**
 * The signed-in landlord's real standing, read from the admin database by
 * email address. There is no landlord-side write path — only administrators
 * approve, reject, suspend, or reactivate accounts.
 */
export function useAccountStanding(email: string | null): AccountStanding {
  const { status, db } = useAdminStore();
  const key = (email ?? '').trim().toLowerCase();
  if (!db || !key) {
    return status === 'ready' ? UNVERIFIED : { ...UNVERIFIED, loading: true };
  }
  const record = db.landlords.find(
    (landlord) => landlord.email.trim().toLowerCase() === key
  );
  if (!record) return UNVERIFIED;
  return {
    loading: false,
    verification: record.verificationStatus,
    accountStatus: record.accountStatus,
    suspensionReason: record.suspensionReason,
    joinedAt: record.joinedAt,
    linked: true,
  };
}
