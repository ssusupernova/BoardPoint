/**
 * BoardPoint notifications service.
 *
 * Notifications are seeded from mock data and their read state is persisted
 * on-device (SecureStore / localStorage). A tiny observable store lets the
 * alerts screen and the bottom-nav badge stay in sync. Swap the persistence for
 * a backend call later; the public API stays the same.
 *
 * `pushNotification` lets other services (e.g. the rental-request bridge in
 * `landlordData`) add renter alerts at runtime. Pushed items persist under
 * `notifications.pushed` so they survive a restart; read state keeps using the
 * shared `notifications.read` id list for both seeds and pushed items.
 */

import { useSyncExternalStore } from 'react';
import { renterNotifications, type AppNotification } from '@/data/mock';
import type { NotificationCategory } from '@/data/types';
import { storageGet, storageSet } from '@/services/storage';
import { MONTH_ABBRS } from '@/utils/date';
import * as Crypto from 'expo-crypto';

const READ_KEY = 'notifications.read';
const ADDED_KEY = 'notifications.added';

const seeded: AppNotification[] = renterNotifications.map((item) => ({ ...item }));
let added: AppNotification[] = [];
let notifications: AppNotification[] = [...added, ...seeded];
const STORAGE_KEY = 'notifications.read';
const PUSHED_KEY = 'notifications.pushed';

type PushedNotification = AppNotification & { createdAt: string };

const seeds: AppNotification[] = renterNotifications.map((item) => ({ ...item }));

let notifications: AppNotification[] = seeds;
let pushed: PushedNotification[] = [];
let readIds = new Set<string>();
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setNotifications(next: AppNotification[]): void {
  notifications = next;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AppNotification[] {
  return notifications;
}

export function useNotifications(): AppNotification[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useUnreadCount(): number {
  const items = useNotifications();
  return items.reduce((count, item) => (item.read ? count : count + 1), 0);
}

async function persistReadIds(): Promise<void> {
  const readIds = notifications.filter((item) => item.read).map((item) => item.id);
  await storageSet(READ_KEY, JSON.stringify(readIds));
}

async function persistAdded(): Promise<void> {
  await storageSet(ADDED_KEY, JSON.stringify(added));
}

/**
 * Adds a runtime notification (e.g. a rental request being accepted) to the top
 * of the feed and persists it so it survives a reload. Read state is tracked
 * separately, so a freshly added item starts unread.
 */
export async function addNotification(notification: AppNotification): Promise<void> {
  if (notifications.some((item) => item.id === notification.id)) return;
  added = [{ ...notification }, ...added];
  setNotifications([{ ...notification }, ...notifications]);
  await persistAdded();
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const [rawRead, rawAdded] = await Promise.all([
    storageGet(READ_KEY),
    storageGet(ADDED_KEY),
  ]);

  try {
    const parsedAdded = rawAdded ? (JSON.parse(rawAdded) as AppNotification[]) : [];
    if (Array.isArray(parsedAdded)) {
      added = parsedAdded;
      notifications = [...added.map((item) => ({ ...item })), ...seeded.map((item) => ({ ...item }))];
    }
  } catch {
    // Ignore malformed cache and keep the seeded feed.
  }

  if (!rawRead) {
    emit();
    return;
  }
  try {
    const parsed = JSON.parse(rawRead) as string[];
  const ids = notifications.filter((item) => item.read).map((item) => item.id);
  await storageSet(STORAGE_KEY, JSON.stringify(ids));
}

/** Rebuild the visible list from pushed items (newest first) plus the seeds. */
function rebuild(): AppNotification[] {
  const pushedItems: AppNotification[] = pushed.map((item) => ({
    ...item,
    day: new Date(item.createdAt).toDateString() === new Date().toDateString()
      ? 'today'
      : 'earlier',
    read: readIds.has(item.id),
  }));
  return [...pushedItems, ...seeds.map((item) => ({ ...item, read: item.read || readIds.has(item.id) }))];
}

/** Merge stored pushed items with any pushed while hydrating was in flight. */
function loadPushed(raw: string | null): void {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as PushedNotification[];
    if (!Array.isArray(parsed)) return;
    const known = new Map(pushed.map((item) => [item.id, item] as const));
    for (const item of parsed) {
      if (typeof item?.id === 'string' && !known.has(item.id)) known.set(item.id, item);
    }
    pushed = [...known.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    // Ignore malformed cache and keep anything pushed at runtime.
  }
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const [readRaw, pushedRaw] = await Promise.all([
    storageGet(STORAGE_KEY),
    storageGet(PUSHED_KEY),
  ]);
  if (readRaw) {
    try {
      const parsed = JSON.parse(readRaw) as string[];
      if (Array.isArray(parsed)) readIds = new Set(parsed);
    } catch {
      // Ignore malformed cache and keep the seeded read state.
    }
  }
  loadPushed(pushedRaw);
  setNotifications(rebuild());
}

void hydrate();

export async function markAllNotificationsRead(): Promise<void> {
  setNotifications(notifications.map((item) => ({ ...item, read: true })));
  await persistReadIds();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (notifications.every((item) => item.id !== id || item.read)) return;
  setNotifications(notifications.map((item) => (item.id === id ? { ...item, read: true } : item)));
  await persistReadIds();
}

export interface PushNotificationInput {
  category: NotificationCategory;
  title: string;
  description: string;
  statusLabel?: string;
}

function clockLabel(date: Date): string {
  const hour12 = date.getHours() % 12 || 12;
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const suffix = date.getHours() < 12 ? 'AM' : 'PM';
  return `${hour12}:${minute} ${suffix}`;
}

/**
 * Append a renter alert at the top of the timeline and persist it. Best-effort
 * persistence: storage failures never throw back into the caller.
 */
export function pushNotification(input: PushNotificationInput): void {
  const now = new Date();
  const item: PushedNotification = {
    id: Crypto.randomUUID(),
    category: input.category,
    day: 'today',
    timestampLabel: `${now.getDate()} ${MONTH_ABBRS[now.getMonth()]} · ${clockLabel(now)}`,
    title: input.title,
    description: input.description,
    statusLabel: input.statusLabel,
    read: false,
    createdAt: now.toISOString(),
  };
  pushed = [item, ...pushed];
  setNotifications([item, ...notifications]);
  void storageSet(PUSHED_KEY, JSON.stringify(pushed)).catch(() => undefined);
}
