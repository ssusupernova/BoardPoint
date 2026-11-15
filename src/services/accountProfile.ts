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
 *  - `useAccountStanding`, which reads verification and account status from
 *    the signed-in user's Supabase records.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { storageGet, storageSet } from '@/services/storage';
import { supabase } from '@/backend/config/supabase';
import { useAuthSession } from '@/services/auth';
import { useLandlordVerification } from '@/services/landlordVerification';
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
  /** True when the signed-in Supabase profile exists. */
  linked: boolean;
  error: string | null;
}

interface ProfileStanding {
  userId: string | null;
  loaded: boolean;
  status: AccountStatus | null;
  linked: boolean;
  error: string | null;
}

const EMPTY_STANDING: ProfileStanding = {
  userId: null,
  loaded: false,
  status: null,
  linked: false,
  error: null,
};

function verificationState(
  status: string | null,
): LandlordVerificationState {
  switch (status) {
    case 'pending':
    case 'under_review':
      return 'pending';
    case 'more_information_requested':
      return 'info_requested';
    case 'approved':
      return 'verified';
    case 'rejected':
      return 'rejected';
    default:
      return 'unverified';
  }
}

/**
 * The signed-in landlord's account status and verification state are read from
 * their Supabase profile and verification application.
 */
export function useAccountStanding(email: string | null): AccountStanding {
  const { session } = useAuthSession();
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  const userId = session?.user.email.toLowerCase() === normalizedEmail
    ? session.user.id
    : null;
  const verification = useLandlordVerification(userId ?? undefined);
  const [profile, setProfile] = useState<ProfileStanding>(EMPTY_STANDING);

  useEffect(() => {
    let active = true;
    if (userId) {
      void (async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('account_status')
            .eq('id', userId)
            .maybeSingle();
          if (!active) return;
          if (error) {
            console.error('Unable to load account standing:', error);
            setProfile({
              userId,
              loaded: true,
              status: null,
              linked: false,
              error: `Unable to load account standing: ${error.message}`,
            });
            return;
          }
          setProfile({
            userId,
            loaded: true,
            status: data
              ? data.account_status === 'suspended' ? 'suspended' : 'active'
              : null,
            linked: Boolean(data),
            error: null,
          });
        } catch (error) {
          if (!active) return;
          const message = error instanceof Error ? error.message : 'Unable to load account standing.';
          console.error('Unable to load account standing:', error);
          setProfile({ userId, loaded: true, status: null, linked: false, error: message });
        }
      })();
    }

    return () => {
      active = false;
    };
  }, [userId]);

  return {
    loading: Boolean(userId) && (!profile.loaded || profile.userId !== userId || verification.loading),
    verification: verificationState(verification.status),
    accountStatus: profile.userId === userId ? profile.status : null,
    suspensionReason: null,
    joinedAt: null,
    linked: profile.userId === userId && profile.linked,
    error: profile.userId === userId ? profile.error : null,
  };
}
