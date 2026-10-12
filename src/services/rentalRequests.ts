/**
 * BoardPoint renter rental-request store.
 *
 * Holds the signed-in renter's marketplace requests/registrations in a small
 * observable store so the dashboard, room detail screen, the registration list
 * and the Verified Renter badge stay in sync.
 *
 * Scope is PER ACCOUNT: state is persisted under `rentalRequests.<userId>`, so
 * a brand-new sign-up starts empty (a renter who still needs to find a room),
 * while accounts that already hold a room keep their records. The app's demo
 * profile account is seeded with one confirmed registration so the "has a room"
 * experience stays demoable — the same convention used by `renterTenancy`.
 *
 * Renter-only: the landlord-side approval workflow lives on the backend and is
 * intentionally out of scope here.
 */

import { useEffect, useSyncExternalStore } from 'react';
import {
  renterProfile,
  renterSeedRentalRequests,
  type RentalRequest,
  type RentalRequestStatus,
} from '@/data/renter';
import { useAuthSession } from '@/services/auth';
import { storageGet, storageSet } from '@/services/storage';
import { toISODate } from '@/utils/date';

let userId: string | null = null;
let boundUserId: string | null = null;
let requests: RentalRequest[] = [];
let hydratedFor: string | null = null;
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

function getSnapshot(): RentalRequest[] {
  return requests;
}

/** The account the store is currently bound to (null before/after sign-in). */
function getBoundUserId(): string | null {
  return boundUserId;
}

/** Demo accounts matching this profile are seeded with a confirmed room. */
function isDemoAccount(email: string): boolean {
  return email.trim().toLowerCase() === renterProfile.email.toLowerCase();
}

function seedFor(email: string): RentalRequest[] {
  return isDemoAccount(email) ? renterSeedRentalRequests.map((request) => ({ ...request })) : [];
}

function storageKeyFor(id: string): string {
  return `rentalRequests.${id}`;
}

/**
 * Device-scoped ledger of requests mirrored from the landlord book. Persisted
 * separately from the per-account list so an outcome decided while a different
 * account was signed in is still merged in when the renter returns.
 */
const MIRROR_KEY = 'rentalRequests.mirror';

interface MirroredRequest {
  renterId: string;
  id: string;
  roomId: string;
  roomTitle: string;
  propertyName: string;
  monthlyRent: number;
  status: RentalRequestStatus;
  submittedAt: string;
  decidedAt?: string;
}

let mirrorLedger: MirroredRequest[] = [];

function toLocal(entry: MirroredRequest): RentalRequest {
  return {
    id: entry.id,
    roomId: entry.roomId,
    roomTitle: entry.roomTitle,
    propertyName: entry.propertyName,
    monthlyRent: entry.monthlyRent,
    status: entry.status,
    submittedAt: entry.submittedAt,
    decidedAt: entry.decidedAt,
  };
}

/** Overlay this account's mirrored entries onto a list (by room). */
function mergeLedger(list: RentalRequest[], renterId: string): RentalRequest[] {
  const entries = mirrorLedger.filter((item) => item.renterId === renterId);
  if (entries.length === 0) return list;
  let next = list;
  for (const entry of entries) {
    const local = toLocal(entry);
    const index = next.findIndex((item) => item.roomId === entry.roomId);
    next =
      index >= 0
        ? next.map((item, i) => (i === index ? { ...item, ...local } : item))
        : [...next, local];
  }
  return next;
}

function loadMirrorLedger(raw: string | null): void {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as MirroredRequest[];
    if (Array.isArray(parsed)) mirrorLedger = parsed;
  } catch {
    // Ignore malformed cache; the landlord book stays the source of truth.
  }
}

function setRequests(next: RentalRequest[]): void {
  requests = next;
  emit();
}

/** Bind the store to an account, resetting when the signed-in user changes. */
async function bind(nextUserId: string | null, email: string): Promise<void> {
  if (nextUserId === null) {
    if (userId !== null) {
      userId = null;
      boundUserId = null;
      hydratedFor = null;
      setRequests([]);
    }
    return;
  }
  if (hydratedFor === nextUserId) return;

  userId = nextUserId;
  boundUserId = nextUserId;
  hydratedFor = nextUserId;

  // Seed synchronously so there is no "no room" flash while storage loads.
  setRequests(seedFor(email));

  const [raw, rawMirror] = await Promise.all([
    storageGet(storageKeyFor(nextUserId)),
    storageGet(MIRROR_KEY),
  ]);
  loadMirrorLedger(rawMirror);

  let base = seedFor(email);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as RentalRequest[];
      if (Array.isArray(parsed)) base = parsed;
    } catch {
      // Ignore malformed cache and keep the seeded requests.
    }
  }
  setRequests(mergeLedger(base, nextUserId));
}

/**
 * Subscribe to the signed-in renter's full request list. Mounted by the renter
 * screens, so it also drives per-account rebinding on sign-in / sign-out.
 */
export function useRentalRequests(): RentalRequest[] {
  const { session } = useAuthSession();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const id = session?.user.id ?? null;
  const email = session?.user.email ?? '';

  useEffect(() => {
    void bind(id, email);
  }, [id, email]);

  return snapshot;
}

/**
 * Like `useRentalRequests`, but also reports whether the store has bound to the
 * signed-in account yet. Screens that branch on "does this renter have a room"
 * use this to avoid flashing the wrong state before storage loads.
 */
export function useRentalRequestsState(): { requests: RentalRequest[]; ready: boolean } {
  const { session } = useAuthSession();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const bound = useSyncExternalStore(subscribe, getBoundUserId, getBoundUserId);
  const id = session?.user.id ?? null;
  const email = session?.user.email ?? '';

  useEffect(() => {
    void bind(id, email);
  }, [id, email]);

  return { requests: snapshot, ready: id !== null && bound === id };
}

/* -------------------------------------------------------------------- queries */

/** The request for a room, if any (a room can only be requested once). */
export function requestFor(
  list: RentalRequest[],
  roomId: string
): RentalRequest | undefined {
  return list.find((request) => request.roomId === roomId);
}

export type RequestState = 'none' | 'pending' | 'confirmed' | 'declined';

/** Coarse state for a room, used to pick the detail-screen call to action. */
export function requestStateFor(list: RentalRequest[], roomId: string): RequestState {
  const request = requestFor(list, roomId);
  if (!request) return 'none';
  switch (request.status) {
    case 'Confirmed':
      return 'confirmed';
    case 'Declined':
      return 'declined';
    default:
      return 'pending';
  }
}

/** Subscribe to a single room's request state. */
export function useRoomRequestState(roomId: string): RequestState {
  const list = useRentalRequests();
  return requestStateFor(list, roomId);
}

/** Subscribe to a single room's request record. */
export function useRoomRequest(roomId: string): RentalRequest | undefined {
  const list = useRentalRequests();
  return requestFor(list, roomId);
}

/** A renter has a room once they hold at least one confirmed registration. */
export function isVerifiedRenter(list: RentalRequest[]): boolean {
  return list.some((request) => request.status === 'Confirmed');
}

/** Subscribe to the renter's verified/has-room status. */
export function useIsVerifiedRenter(): boolean {
  const list = useRentalRequests();
  return isVerifiedRenter(list);
}

/** The active (non-declined) requests, newest first — the registrations list. */
export function activeRequests(list: RentalRequest[]): RentalRequest[] {
  return list
    .filter((request) => request.status !== 'Declined')
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/* ------------------------------------------------------------------ mutations */

export interface RentalRequestInput {
  roomId: string;
  roomTitle: string;
  propertyName: string;
  monthlyRent: number;
}

async function persist(): Promise<void> {
  if (!userId) return;
  await storageSet(storageKeyFor(userId), JSON.stringify(requests));
}

/**
 * Submit a rental request for a room. If the room already has an active
 * request (pending or confirmed) it is returned unchanged so the action is
 * idempotent from the UI's perspective.
 */
export async function submitRentalRequest(
  input: RentalRequestInput
): Promise<RentalRequest> {
  const existing = requestFor(requests, input.roomId);
  if (existing && existing.status !== 'Declined') return existing;

  const request: RentalRequest = {
    id: `req-${Date.now()}`,
    roomId: input.roomId,
    roomTitle: input.roomTitle,
    propertyName: input.propertyName,
    monthlyRent: input.monthlyRent,
    status: 'Pending' satisfies RentalRequestStatus,
    submittedAt: toISODate(new Date()),
  };

  setRequests([...requests.filter((entry) => entry.roomId !== input.roomId), request]);
  await persist();
  return request;
}

export interface MirrorRentalRequestInput {
  renterId: string;
  /** Landlord-book request id — reused as the local record id. */
  requestId: string;
  /** Marketplace listing id (`RenterRoom.id`), stored as the local roomId. */
  roomId: string;
  roomTitle: string;
  propertyName: string;
  monthlyRent: number;
  status: RentalRequestStatus;
  /** Date-only (yyyy-mm-dd) the request was submitted. */
  submittedAt: string;
  /** Date-only (yyyy-mm-dd) the landlord decided, if already decided. */
  decidedAt?: string;
}

/**
 * Bridge: upsert a landlord-book rental request into this device's renter
 * store. The entry lands in the mirror ledger (persisted, all accounts) and,
 * when the matching renter is signed in right now, in their live list too.
 * Best-effort — storage failures never throw back into the landlord mutation
 * that calls it, because the landlord book remains the source of truth.
 */
export async function mirrorRentalRequest(input: MirrorRentalRequestInput): Promise<void> {
  const entry: MirroredRequest = {
    renterId: input.renterId,
    id: input.requestId,
    roomId: input.roomId,
    roomTitle: input.roomTitle,
    propertyName: input.propertyName,
    monthlyRent: input.monthlyRent,
    status: input.status,
    submittedAt: input.submittedAt,
    decidedAt: input.decidedAt,
  };
  mirrorLedger = [
    entry,
    ...mirrorLedger.filter(
      (item) => !(item.renterId === input.renterId && item.roomId === input.roomId)
    ),
  ];

  const isCurrentAccount = boundUserId === input.renterId;
  if (isCurrentAccount) {
    const local = toLocal(entry);
    const index = requests.findIndex((item) => item.roomId === input.roomId);
    setRequests(
      index >= 0
        ? requests.map((item, i) => (i === index ? { ...item, ...local } : item))
        : [...requests, local]
    );
  }

  try {
    await storageSet(MIRROR_KEY, JSON.stringify(mirrorLedger));
    if (isCurrentAccount) await persist();
  } catch {
    // Best-effort mirror; future binds re-merge whatever made it to storage.
  }
}

/** Withdraw a pending request. Confirmed registrations can't be withdrawn here. */
export async function cancelRentalRequest(id: string): Promise<void> {
  setRequests(
    requests.filter((request) => request.id !== id || request.status === 'Confirmed')
  );
  if (boundUserId) {
    const kept = mirrorLedger.filter(
      (item) => !(item.renterId === boundUserId && item.id === id)
    );
    if (kept.length !== mirrorLedger.length) {
      mirrorLedger = kept;
      try {
        await storageSet(MIRROR_KEY, JSON.stringify(mirrorLedger));
      } catch {
        // Ledger prune is best-effort; the local list is already updated.
      }
    }
  }
  await persist();
}
