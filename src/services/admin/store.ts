/**
 * Admin data store.
 *
 * Loads the shared admin workspace from Supabase and serializes mutations so
 * concurrent writes cannot overwrite a newer revision.
 */
import { useEffect, useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { getAuthState, useAuthSession } from '@/services/auth';
import { supabase } from '@/backend/config/supabase';
import { createSeedDatabase } from './seed';
import { PRIVATE_STORAGE_KEYS, deletePrivateValue, readPrivateValue, writePrivateValue } from './storage';
import type { AdminDatabase, AdminPreferences } from './types';

export type StoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AdminStoreSnapshot {
  status: StoreStatus;
  db: AdminDatabase | null;
  error: string | null;
  /** Non-fatal: set when the last persistence write failed. */
  storageWarning: string | null;
}

const DB_KEY = PRIVATE_STORAGE_KEYS.database;
const DEFAULT_PREFERENCES: AdminPreferences = {
  notifyVerification: true,
  notifyReports: true,
  notifyUnresolved: true,
  dailyDigest: false,
  autoLockMinutes: 30,
  defaultDateRange: '30d',
};

let snapshot: AdminStoreSnapshot = {
  status: 'idle',
  db: null,
  error: null,
  storageWarning: null,
};

const listeners = new Set<() => void>();
let initPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let activeAdminId: string | null = null;
let remoteRevision = 0;

function isAdminDatabase(value: unknown): value is AdminDatabase {
  if (!value || typeof value !== 'object') return false;
  const db = value as Partial<AdminDatabase>;
  return db.version === 2
    && Array.isArray(db.admins)
    && Array.isArray(db.landlords)
    && Array.isArray(db.applications)
    && Array.isArray(db.listings)
    && Array.isArray(db.reports)
    && Array.isArray(db.auditLogs)
    && Array.isArray(db.notifications)
    && Array.isArray(db.landlordNotices)
    && Boolean(db.preferences && typeof db.preferences === 'object');
}

function emptyAdminDatabase(
  user: NonNullable<ReturnType<typeof getAuthState>['session']>['user'],
  preferences: AdminPreferences = DEFAULT_PREFERENCES,
): AdminDatabase {
  const now = new Date().toISOString();
  return {
    version: 2,
    seededAt: now,
    admins: [{
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: 'super_admin',
      title: 'Super administrator',
      permissions: [
        'verification.decide',
        'accounts.manage',
        'moderation.manage',
        'reports.manage',
        'audit.view',
        'settings.manage',
      ],
      createdAt: now,
      lastSignInAt: now,
    }],
    landlords: [],
    applications: [],
    listings: [],
    reports: [],
    auditLogs: [],
    notifications: [],
    landlordNotices: [],
    preferences,
  };
}

function accountDbKey(adminId: string): string {
  return `${DB_KEY}.${adminId}`;
}

function setSnapshot(next: AdminStoreSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function subscribeAdminStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getAdminStoreSnapshot(): AdminStoreSnapshot {
  return snapshot;
}

function cloneDatabase(db: AdminDatabase): AdminDatabase {
  return JSON.parse(JSON.stringify(db)) as AdminDatabase;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The admin database could not be loaded.';
}

async function persist(db: AdminDatabase): Promise<void> {
  const adminId = activeAdminId;
  if (!adminId) throw new Error('Sign in as an administrator before saving admin data.');
  const payload = JSON.stringify(db);
  const write = writeQueue.then(async () => {
    if (activeAdminId !== adminId || getAuthState().session?.user.id !== adminId) {
      throw new Error('The signed-in account changed before admin data could be saved.');
    }
    await writePrivateValue(accountDbKey(adminId), payload);
    const { data, error } = await supabase.rpc('save_admin_workspace', {
      p_payload: db,
      p_expected_revision: remoteRevision,
    });
    if (error) throw new Error(`Unable to save admin data: ${error.message}`);
    const nextRevision = Number(data);
    if (!Number.isSafeInteger(nextRevision) || nextRevision < 1) {
      throw new Error('Supabase returned an invalid admin workspace revision.');
    }
    if (activeAdminId !== adminId || getAuthState().session?.user.id !== adminId) {
      throw new Error('The signed-in account changed before admin data finished saving.');
    }
    remoteRevision = nextRevision;
    if (snapshot.storageWarning) {
      setSnapshot({ ...snapshot, storageWarning: null });
    }
  });
  writeQueue = write.then(
    () => undefined,
    () => undefined,
  );
  try {
    await write;
  } catch (error) {
    setSnapshot({ ...snapshot, storageWarning: errorMessage(error) });
    throw error;
  }
}

/** Loads the shared admin workspace, carrying forward local preferences only. */
export function ensureAdminStore(adminId?: string | null): Promise<void> {
  const session = getAuthState().session;
  const resolvedAdminId = adminId ?? (
    session?.user.role === 'super_admin' ? session.user.id : null
  );
  if (!resolvedAdminId || session?.user.id !== resolvedAdminId || session.user.role !== 'super_admin') {
    const message = 'Sign in with an administrator account to load admin data.';
    activeAdminId = null;
    initPromise = Promise.resolve();
    setSnapshot({ status: 'error', db: null, error: message, storageWarning: null });
    return initPromise;
  }
  if (initPromise && activeAdminId === resolvedAdminId) return initPromise;

  activeAdminId = resolvedAdminId;
  remoteRevision = 0;
  initPromise = (async () => {
    setSnapshot({ status: 'loading', db: null, error: null, storageWarning: null });
    try {
      const { data: remote, error: remoteError } = await supabase
        .from('admin_workspace_snapshots')
        .select('payload, revision')
        .eq('workspace_key', 'primary')
        .maybeSingle();
      if (remoteError) throw new Error(`Unable to load admin data: ${remoteError.message}`);

      let db: AdminDatabase;
      let loadedRevision = 0;
      if (remote) {
        if (!isAdminDatabase(remote.payload)) {
          throw new Error('The saved admin workspace has an invalid format.');
        }
        db = remote.payload;
        loadedRevision = Number(remote.revision);
        if (!Number.isSafeInteger(loadedRevision) || loadedRevision < 1) {
          throw new Error('Supabase returned an invalid admin workspace revision.');
        }
      } else {
        const legacyRaw = await readPrivateValue(DB_KEY);
        let legacy: AdminDatabase | null = null;
        if (legacyRaw) {
          try {
            const parsed: unknown = JSON.parse(legacyRaw);
            if (isAdminDatabase(parsed)) legacy = parsed;
          } catch (error) {
            console.warn('Unable to read the saved local admin workspace:', error);
          }
        }
        db = emptyAdminDatabase(
          session.user,
          legacy?.preferences ?? DEFAULT_PREFERENCES,
        );
        if (activeAdminId !== resolvedAdminId || getAuthState().session?.user.id !== resolvedAdminId) {
          return;
        }
        const { data: savedRevision, error: saveError } = await supabase.rpc(
          'save_admin_workspace',
          { p_payload: db, p_expected_revision: 0 },
        );
        if (saveError) throw new Error(`Unable to initialize admin data: ${saveError.message}`);
        loadedRevision = Number(savedRevision);
        if (!Number.isSafeInteger(loadedRevision) || loadedRevision < 1) {
          throw new Error('Supabase returned an invalid admin workspace revision.');
        }
        await deletePrivateValue(DB_KEY);
      }

      if (activeAdminId !== resolvedAdminId) return;
      if (getAuthState().session?.user.id !== resolvedAdminId) return;
      remoteRevision = loadedRevision;
      await writePrivateValue(accountDbKey(resolvedAdminId), JSON.stringify(db));
      setSnapshot({ status: 'ready', db, error: null, storageWarning: null });
    } catch (error) {
      if (activeAdminId !== resolvedAdminId) return;
      setSnapshot({
        status: 'error',
        db: null,
        error: errorMessage(error),
        storageWarning: null,
      });
    }
  })();

  return initPromise;
}

/** Re-runs the initial load after a failure (used by error states). */
export function retryAdminStore(): Promise<void> {
  initPromise = null;
  return ensureAdminStore(activeAdminId);
}

/** Current database snapshot; throws when it has not finished loading. */
export function readAdminDatabase(): AdminDatabase {
  if (!snapshot.db) {
    throw new Error('The admin data is still loading. Please try again in a moment.');
  }
  return snapshot.db;
}

/**
 * Applies `change` to a deep copy of the database, persists it, then publishes
 * the result. Concurrent calls are queued so two decisions can never interleave.
 */
export async function mutateAdminDatabase(
  change: (db: AdminDatabase) => void
): Promise<AdminDatabase> {
  await ensureAdminStore(activeAdminId);
  const current = readAdminDatabase();
  const next = cloneDatabase(current);
  change(next);
  await persist(next);
  setSnapshot({ status: 'ready', db: next, error: null, storageWarning: snapshot.storageWarning });
  return next;
}

/** Re-seeds the shared admin workspace (used by Admin Settings → reset demo data). */
export async function resetAdminDatabase(): Promise<AdminDatabase> {
  await ensureAdminStore(activeAdminId);
  try {
    await deletePrivateValue(DB_KEY);
  } catch {
    // A failed delete is harmless: the seed below overwrites the key anyway.
  }
  const db = createSeedDatabase();
  await persist(db);
  setSnapshot({ status: 'ready', db, error: null, storageWarning: null });
  return db;
}

export function newId(prefix: string): string {
  return `${prefix}-${Crypto.randomUUID().slice(0, 10)}`;
}

/**
 * Retained for service call-site compatibility; Supabase now provides the
 * actual request latency.
 */
export function roundTrip(ms = 160): Promise<void> {
  void ms;
  return Promise.resolve();
}

export function useAdminStore(): AdminStoreSnapshot {
  const { hydrated, session } = useAuthSession();
  const adminId = session?.user.role === 'super_admin' ? session.user.id : null;
  useEffect(() => {
    if (hydrated) void ensureAdminStore(adminId);
  }, [adminId, hydrated]);
  return useSyncExternalStore(
    subscribeAdminStore,
    getAdminStoreSnapshot,
    getAdminStoreSnapshot
  );
}
