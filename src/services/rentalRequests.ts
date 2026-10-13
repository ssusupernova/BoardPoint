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
 * Renter-only: for now a submitted request is auto-accepted after a short delay
 * by a mock landlord so the accepted-renter experience (notification, payments,
 * Active Renter badge) is demoable. Swap `AUTO_ACCEPT_MS`/`confirmRequest` for
 * the real landlord accept/decline action on the backend later.
 */

import { useEffect, useSyncExternalStore } from 'react';
import {
  renterProfile,
  renterSeedRentalRequests,
  type RentalRequest,
  type RentalRequestStatus,
} from '@/data/renter';
import type { AppNotification, Tenancy } from '@/data/mock';
import { useAuthSession } from '@/services/auth';
import { addNotification } from '@/services/notifications';
import { storageGet, storageSet } from '@/services/storage';
import { MONTH_ABBRS, toISODate } from '@/utils/date';

/**
 * How long a submitted request stays pending before the mock "landlord"
 * auto-accepts it. Mirrors the real approval flow so the notification, payments
 * and Active Renter badge can be demonstrated end-to-end. Replace with a real
 * landlord accept/decline action on the backend later.
 */
const AUTO_ACCEPT_MS = 15_000;
const LEASE_LENGTH_MONTHS = 6;

let userId: string | null = null;
let boundUserId: string | null = null;
let requests: RentalRequest[] = [];
let hydratedFor: string | null = null;
const listeners = new Set<() => void>();
const confirmTimers = new Map<string, ReturnType<typeof setTimeout>>();

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

  const raw = await storageGet(storageKeyFor(nextUserId));
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as RentalRequest[];
    if (Array.isArray(parsed)) setRequests(parsed);
  } catch {
    // Ignore malformed cache and keep the seeded requests.
  }
}

/** Re-arm the mock approval for any request still pending after a reload. */
function resumePending(): void {
  for (const request of requests) {
    if (request.status === 'Pending') scheduleConfirm(request.id);
  }
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
    void bind(id, email).then(resumePending);
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
    void bind(id, email).then(resumePending);
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

/* ------------------------------------------------------------------- tenancy */

function addMonths(iso: string, months: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return toISODate(date);
}

/** Build the live tenancy for a confirmed request (mock lease terms). */
export function tenancyFromRequest(request: RentalRequest): Tenancy {
  const start = request.decidedAt ?? request.submittedAt;
  return {
    id: `tenancy-${request.id}`,
    propertyName: request.propertyName,
    unitLabel: request.roomTitle,
    address: request.address,
    monthlyRent: request.monthlyRent,
    leaseStartedAt: start,
    leaseEndsAt: addMonths(start, LEASE_LENGTH_MONTHS),
    status: 'Active',
    depositHeld: request.monthlyRent,
    rentDueDay: 20,
  };
}

/** The tenancy formed by the renter's confirmed registration, if any. */
export function activeTenancy(list: RentalRequest[]): Tenancy | null {
  const confirmed = list.find((request) => request.status === 'Confirmed');
  return confirmed ? tenancyFromRequest(confirmed) : null;
}

/** Subscribe to the renter's current tenancy (null while still browsing). */
export function useActiveTenancy(): Tenancy | null {
  const list = useRentalRequests();
  return activeTenancy(list);
}

/* ------------------------------------------------------------------ mutations */

export interface RentalRequestInput {
  roomId: string;
  roomTitle: string;
  propertyName: string;
  address: string;
  monthlyRent: number;
}

async function persist(): Promise<void> {
  if (!userId) return;
  await storageSet(storageKeyFor(userId), JSON.stringify(requests));
}

function acceptanceTimestamp(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getDate()} ${MONTH_ABBRS[date.getMonth()]} · ${hour12}:${minutes} ${period}`;
}

function acceptanceNotification(request: RentalRequest, decidedAt: string): AppNotification {
  return {
    id: `notif-accepted-${request.id}`,
    category: 'rent',
    day: 'today',
    timestampLabel: acceptanceTimestamp(new Date()),
    title: 'Rental request accepted',
    description: `Your request for ${request.roomTitle} at ${request.propertyName} was accepted. Welcome home!`,
    statusLabel: 'Confirmed',
  };
}

/**
 * Move a pending request to Confirmed (the mock landlord approving it) and drop
 * an acceptance notification into the alerts feed. No-op for already-decided
 * requests so the timer and the persisted state can't double-fire.
 */
async function confirmRequest(id: string): Promise<void> {
  const target = requests.find((request) => request.id === id);
  if (!target || target.status !== 'Pending') return;

  const decidedAt = toISODate(new Date());
  const decided: RentalRequest = { ...target, status: 'Confirmed', decidedAt };
  setRequests(requests.map((request) => (request.id === id ? decided : request)));
  await Promise.all([
    persist(),
    addNotification(acceptanceNotification(decided, decidedAt)),
  ]);
}

/** Schedule the mock approval for a pending request (idempotent per id). */
function scheduleConfirm(id: string): void {
  if (confirmTimers.has(id)) return;
  const timer = setTimeout(() => {
    confirmTimers.delete(id);
    void confirmRequest(id);
  }, AUTO_ACCEPT_MS);
  confirmTimers.set(id, timer);
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
    address: input.address,
    monthlyRent: input.monthlyRent,
    status: 'Pending' satisfies RentalRequestStatus,
    submittedAt: toISODate(new Date()),
  };

  setRequests([...requests.filter((entry) => entry.roomId !== input.roomId), request]);
  await persist();
  scheduleConfirm(request.id);
  return request;
}

/** Withdraw a pending request. Confirmed registrations can't be withdrawn here. */
export async function cancelRentalRequest(id: string): Promise<void> {
  setRequests(
    requests.filter((request) => request.id !== id || request.status === 'Confirmed')
  );
  await persist();
}
