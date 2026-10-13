/**
 * BoardPoint notifications service.
 *
 * Notifications are seeded from mock data and their read state is persisted
 * on-device (SecureStore / localStorage). A tiny observable store lets the
 * alerts screen and the bottom-nav badge stay in sync. Swap the persistence for
 * a backend call later; the public API stays the same.
 */

import { useSyncExternalStore } from 'react';
import { renterNotifications, type AppNotification } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';

const READ_KEY = 'notifications.read';
const ADDED_KEY = 'notifications.added';

const seeded: AppNotification[] = renterNotifications.map((item) => ({ ...item }));
let added: AppNotification[] = [];
let notifications: AppNotification[] = [...added, ...seeded];
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
    if (!Array.isArray(parsed)) return;
    const readIds = new Set(parsed);
    setNotifications(
      notifications.map((item) => ({ ...item, read: item.read || readIds.has(item.id) }))
    );
  } catch {
    // Ignore malformed cache and keep the seeded read state.
  }
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
