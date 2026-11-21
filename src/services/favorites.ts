/**
 * BoardPoint favorites service.
 *
 * The renter's saved rooms are held in a tiny observable store so the favorite
 * toggle, the shortlist screen and room discovery stay in sync. Seeded from the
 * room fixtures and persisted on-device.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { renterMockRooms } from '@/data/mock';
import { supabase } from '@/backend/config/supabase';
import { useAuthSession } from '@/services/auth';
import { storageGet, storageSet } from '@/services/storage';

const STORAGE_KEY = 'favorites.rooms';

let favoriteIds: string[] = renterMockRooms
  .filter((room) => room.isFavorite)
  .map((room) => room.id);
let hydratedFor: string | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setFavoriteIds(next: string[]): void {
  favoriteIds = next;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string[] {
  return favoriteIds;
}

export function useFavoriteRoomIds(): string[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { session } = useAuthSession();

  useEffect(() => {
    void hydrate(session?.user.id ?? null);
  }, [session?.user.id]);

  return snapshot;
}

async function hydrate(userId: string | null): Promise<void> {
  if (!userId || hydratedFor === userId) return;
  hydratedFor = userId;
  const raw = await storageGet(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setFavoriteIds(parsed);
    } catch {
      // Ignore malformed cache and keep the seeded favorites.
    }
  }
  const { data, error } = await supabase
    .from('renter_favorites')
    .select('room_id')
    .eq('renter_id', userId);
  if (error) throw error;
  if (data) setFavoriteIds(data.map((row) => row.room_id));
}

export async function toggleFavoriteRoom(id: string): Promise<void> {
  const next = favoriteIds.includes(id)
    ? favoriteIds.filter((value) => value !== id)
    : [...favoriteIds, id];
  setFavoriteIds(next);
  await storageSet(STORAGE_KEY, JSON.stringify(next));
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) return;
  if (next.includes(id)) {
    const { error } = await supabase
      .from('renter_favorites')
      .insert({ renter_id: userId, room_id: id });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('renter_favorites')
      .delete()
      .eq('renter_id', userId)
      .eq('room_id', id);
    if (error) throw error;
  }
}
