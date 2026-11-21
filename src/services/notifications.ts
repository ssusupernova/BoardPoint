
/**
 * BoardPoint notifications service.
 *
 * Notifications are seeded from mock data. Read state and pushed
 * notifications are persisted on-device.
 */

import { renterNotifications, type AppNotification } from '@/data/mock';
import type { NotificationCategory } from '@/data/types';
import { supabase } from '@/backend/config/supabase';
import { useAuthSession } from '@/services/auth';
import { storageGet, storageSet } from '@/services/storage';
import { MONTH_ABBRS } from '@/utils/date';
import * as Crypto from 'expo-crypto';
import { useEffect, useSyncExternalStore } from 'react';

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
let hydrationPromise: Promise<void> | undefined;
let hydratedUserId: string | null = null;

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
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { session } = useAuthSession();
  useEffect(() => {
    void hydrate(session?.user.id ?? null);
  }, [session?.user.id]);
  return snapshot;
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
async function hydrate(userId: string | null = null): Promise<void> {
  if (hydrationPromise && hydratedUserId === userId) {
    return hydrationPromise;
  }
  hydratedUserId = userId;

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

    if (userId) {
      const { data, error } = await supabase
        .from('renter_notifications')
        .select(
          'id, category, day, timestamp_label, title, description, status_label, is_read, created_at',
        )
        .eq('renter_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        pushed = data.map((row) => ({
          id: row.id,
          category: row.category as NotificationCategory,
          day: row.day as 'today' | 'earlier',
          timestampLabel: row.timestamp_label,
          title: row.title,
          description: row.description,
          statusLabel: row.status_label ?? undefined,
          read: row.is_read,
          createdAt: row.created_at,
        }));
      }
    }

    setNotifications(rebuild());
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const { error } = await supabase
    .from('renter_notifications')
    .upsert({
      id: notification.id,
      renter_id: session.user.id,
      category: notification.category,
      day: notification.day,
      timestamp_label: notification.timestampLabel,
      title: notification.title,
      description: notification.description,
      status_label: notification.statusLabel ?? null,
      is_read: notification.read ?? false,
      created_at: new Date().toISOString(),
    }, { onConflict: 'renter_id,id' });
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  await hydrate(session?.user.id ?? null);

  readIds = new Set(notifications.map((item) => item.id));
  setNotifications(
    notifications.map((item) => ({ ...item, read: true })),
  );

  await persistReadIds();
  if (session) {
    const { error } = await supabase
      .from('renter_notifications')
      .update({ is_read: true })
      .eq('renter_id', session.user.id);
    if (error) throw error;
  }
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
