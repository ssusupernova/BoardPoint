/**
 * BoardPoint renter-contact service.
 *
 * Name and email are owned by the account (auth session); mobile and emergency
 * contact are editable here and held in a tiny observable store so the profile
 * screen reflects edits immediately. Persisted on-device.
 */

import { useSyncExternalStore } from 'react';
import { renterProfile } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';

export type RenterContact = {
  mobile: string;
  emergencyContact: string;
};

const STORAGE_KEY = 'profile.contact';

let contact: RenterContact = {
  mobile: renterProfile.mobile,
  emergencyContact: renterProfile.emergencyContact,
};
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setContact(next: RenterContact): void {
  contact = next;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RenterContact {
  return contact;
}

export function useRenterContact(): RenterContact {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Partial<RenterContact>;
    if (typeof parsed.mobile === 'string' && typeof parsed.emergencyContact === 'string') {
      setContact({ mobile: parsed.mobile, emergencyContact: parsed.emergencyContact });
    }
  } catch {
    // Ignore malformed cache and keep the seeded contact details.
  }
}

void hydrate();

export async function saveRenterContact(next: RenterContact): Promise<void> {
  setContact(next);
  await storageSet(STORAGE_KEY, JSON.stringify(next));
}
