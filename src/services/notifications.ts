
/**
 * BoardPoint notifications service.
 *
 * Notifications are seeded from mock data. Read state and pushed
 * notifications are persisted on-device.
 */

import { renterNotifications, type AppNotification } from '@/data/mock';
import type { NotificationCategory } from '@/data/types';
import { storageGet, storageSet } from '@/services/storage';
import { MONTH_ABBRS } from '@/utils/date';
import * as Crypto from 'expo-crypto';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'notifications.read';
const PUSHED_KEY = 'notifications.pushed';

type PushedNotification = AppNotification & {
  createdAt: string;
};

const seeds: AppNotification[] = renterNotifications.map((item) => ({
  ...item,
}));

let notifications: AppNotification[] = seeds.map((item) => ({
  ...item,
}));

let pushed: PushedNotification[] = [];
let readIds = new Set<string>();
let hydrated = false;
let hydrationPromise: Promise<void> | undefined;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
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
  return items.reduce(
    (count, item) => (item.read ? count : count + 1),
    0,
  );
}

async function persistReadIds(): Promise<void> {
  const ids = notifications
    .filter((item) => item.read)
    .map((item) => item.id);

  await storageSet(STORAGE_KEY, JSON.stringify(ids));
}

async function persistPushed(): Promise<void> {
  await storageSet(PUSHED_KEY, JSON.stringify(pushed));
}

/** Rebuild the visible list using pushed notifications and seeded data. */
function rebuild(): AppNotification[] {
  const pushedItems: AppNotification[] = pushed.map((item) => ({
    ...item,
    day:
      new Date(item.createdAt).toDateString() === new Date().toDateString()
        ? 'today'
        : 'earlier',
    read: readIds.has(item.id),
  }));

  const seededItems = seeds.map((item) => ({
    ...item,
    read: item.read || readIds.has(item.id),
  }));

  return [...pushedItems, ...seededItems];
}

/** Load persisted read state and pushed notifications once. */
async function hydrate(): Promise<void> {
  if (hydrationPromise) {
    return hydrationPromise;
  }

  hydrationPromise = (async () => {
    const [readRaw, pushedRaw] = await Promise.all([
      storageGet(STORAGE_KEY),
      storageGet(PUSHED_KEY),
    ]);

    if (readRaw) {
      try {
        const parsed = JSON.parse(readRaw) as unknown;

        if (
          Array.isArray(parsed) &&
          parsed.every((id) => typeof id === 'string')
        ) {
          readIds = new Set(parsed);
        }
      } catch {
        // Ignore malformed read-state data.
      }
    }

    if (pushedRaw) {
      try {
        const parsed = JSON.parse(pushedRaw) as unknown;

        if (Array.isArray(parsed)) {
          pushed = parsed.filter(
            (item): item is PushedNotification =>
              item !== null &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.createdAt === 'string',
          );
        }
      } catch {
        // Ignore malformed pushed-notification data.
      }
    }

    setNotifications(rebuild());
    hydrated = true;
  })();

  try {
    await hydrationPromise;
  } catch (error) {
    hydrationPromise = undefined;
    throw error;
  }
}

void hydrate().catch(() => {
  // Keep the seeded notifications available if storage fails.
});

export async function addNotification(notification: AppNotification): Promise<void> {
  if (notifications.some((item) => item.id === notification.id)) return;
  setNotifications([notification, ...notifications]);
  await persistReadIds();
}

export async function markAllNotificationsRead(): Promise<void> {
  await hydrate();

  readIds = new Set(notifications.map((item) => item.id));
  setNotifications(
    notifications.map((item) => ({ ...item, read: true })),
  );

  await persistReadIds();
}

export async function markNotificationRead(id: string): Promise<void> {
  await hydrate();

  const item = notifications.find((notification) => notification.id === id);

  if (!item || item.read) {
    return;
  }

  readIds.add(id);

  setNotifications(
    notifications.map((notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification,
    ),
  );

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

/** Add a new renter notification and persist it. */
export function pushNotification(input: PushNotificationInput): void {
  const now = new Date();

  const item: PushedNotification = {
    id: Crypto.randomUUID(),
    category: input.category,
    day: 'today',
    timestampLabel: `${now.getDate()} ${MONTH_ABBRS[now.getMonth()]
      } · ${clockLabel(now)}`,
    title: input.title,
    description: input.description,
    statusLabel: input.statusLabel,
    read: false,
    createdAt: now.toISOString(),
  };

  pushed = [item, ...pushed];
  setNotifications([item, ...notifications]);

  void persistPushed().catch(() => undefined);
}
