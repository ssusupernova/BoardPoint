/**
 * BoardPoint favorites service.
 *
 * The renter's saved rooms are held in a tiny observable store so the favorite
 * toggle, the shortlist screen and room discovery stay in sync. Seeded from the
 * room fixtures and persisted on-device.
 */

import { useSyncExternalStore } from 'react';
import { renterMockRooms } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';

const STORAGE_KEY = 'favorites.rooms';

let favoriteIds: string[] = renterMockRooms
  .filter((room) => room.isFavorite)
  .map((room) => room.id);
let hydrated = false;
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
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) setFavoriteIds(parsed);
  } catch {
    // Ignore malformed cache and keep the seeded favorites.
  }
}

void hydrate();

export async function toggleFavoriteRoom(id: string): Promise<void> {
  const next = favoriteIds.includes(id)
    ? favoriteIds.filter((value) => value !== id)
    : [...favoriteIds, id];
  setFavoriteIds(next);
  await storageSet(STORAGE_KEY, JSON.stringify(next));
}
