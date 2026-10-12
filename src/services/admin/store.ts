/**
 * Admin data store.
 *
 * Acts as the application's backend: it loads (or seeds) a private database,
 * exposes it to React through `useSyncExternalStore`, and serialises every
 * mutation so writes are applied one at a time and persisted atomically.
 *
 * Replacing this module with Supabase queries keeps the services and screens
 * unchanged — screens only ever read `snapshot.db` and call service functions.
 */
import { useEffect, useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { createSeedDatabase } from './seed';
import { PRIVATE_STORAGE_KEYS, deletePrivateValue, readPrivateValue, writePrivateValue } from './storage';
import type { AdminDatabase } from './types';

export type StoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AdminStoreSnapshot {
  status: StoreStatus;
  db: AdminDatabase | null;
  error: string | null;
  /** Non-fatal: set when the last persistence write failed. */
  storageWarning: string | null;
}

const DB_KEY = PRIVATE_STORAGE_KEYS.database;

let snapshot: AdminStoreSnapshot = {
  status: 'idle',
  db: null,
  error: null,
  storageWarning: null,
};

const listeners = new Set<() => void>();
let initPromise: Promise<void> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

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
  const payload = JSON.stringify(db);
  writeQueue = writeQueue.then(async () => {
    try {
      await writePrivateValue(DB_KEY, payload);
      if (snapshot.storageWarning) {
        setSnapshot({ ...snapshot, storageWarning: null });
      }
    } catch (error) {
      // The in-memory copy stays authoritative for this session.
      setSnapshot({ ...snapshot, storageWarning: errorMessage(error) });
    }
  });
  await writeQueue;
}

/** Loads the stored database, seeding it on first launch. */
export function ensureAdminStore(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    setSnapshot({ status: 'loading', db: null, error: null, storageWarning: null });
    try {
      const raw = await readPrivateValue(DB_KEY);
      let db: AdminDatabase | null = null;
      if (raw) {
        try {
          db = JSON.parse(raw) as AdminDatabase;
        } catch {
          db = null;
        }
      }
      if (!db || db.version !== 2 || !Array.isArray(db.landlords)) {
        db = createSeedDatabase();
        await persist(db);
      }
      setSnapshot({ status: 'ready', db, error: null, storageWarning: null });
    } catch (error) {
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
  return ensureAdminStore();
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
  await ensureAdminStore();
  const current = readAdminDatabase();
  const next = cloneDatabase(current);
  change(next);
  await persist(next);
  setSnapshot({ status: 'ready', db: next, error: null, storageWarning: snapshot.storageWarning });
  return next;
}

/** Re-seeds the local database (used by Admin Settings → reset demo data). */
export async function resetAdminDatabase(): Promise<AdminDatabase> {
  await ensureAdminStore();
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
 * Mirrors a network round trip so screens show honest loading states instead
 * of flashing instantly. Swap for a real request when a backend is attached.
 */
export function roundTrip(ms = 160): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAdminStore(): AdminStoreSnapshot {
  useEffect(() => {
    void ensureAdminStore();
  }, []);
  return useSyncExternalStore(
    subscribeAdminStore,
    getAdminStoreSnapshot,
    getAdminStoreSnapshot
  );
}
