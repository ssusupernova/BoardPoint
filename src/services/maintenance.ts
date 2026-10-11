/**
 * BoardPoint maintenance service.
 *
 * Maintenance tickets are stored on-device (SecureStore / localStorage) and
 * exposed through a tiny observable store so any screen re-renders when a new
 * report is filed. Swap the persistence for a backend call later; the public
 * API (useMaintenanceTickets / submitMaintenanceTicket) stays the same.
 */

import { useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { renterMaintenance, type MaintenanceTicket } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';
import { toISODate } from '@/utils/date';

const STORAGE_KEY = 'maintenance.tickets';

export interface MaintenanceInput {
  title: string;
  category: string;
  detail: string;
  /** Optional photo attached to the report. */
  photoUri?: string;
}

let tickets: MaintenanceTicket[] = [...renterMaintenance];
let hydrated = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setTickets(next: MaintenanceTicket[]): void {
  tickets = next;
  emit();
}

function subscribeMaintenance(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): MaintenanceTicket[] {
  return tickets;
}

export function useMaintenanceTickets(): MaintenanceTicket[] {
  return useSyncExternalStore(subscribeMaintenance, getSnapshot, getSnapshot);
}

async function hydrateMaintenance(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as MaintenanceTicket[];
    if (Array.isArray(parsed)) setTickets(parsed);
  } catch {
    // Ignore malformed cache and keep the seeded tickets.
  }
}

void hydrateMaintenance();

export async function submitMaintenanceTicket(input: MaintenanceInput): Promise<MaintenanceTicket> {
  const ticket: MaintenanceTicket = {
    id: Crypto.randomUUID(),
    title: input.title.trim(),
    detail: input.detail.trim(),
    category: input.category,
    updatedAt: toISODate(new Date()),
    status: 'Scheduled',
    photoUri: input.photoUri,
  };
  setTickets([ticket, ...tickets]);
  await storageSet(STORAGE_KEY, JSON.stringify(tickets));
  return ticket;
}
