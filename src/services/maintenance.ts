/**
 * BoardPoint maintenance service.
 *
 * Maintenance tickets are stored on-device (SecureStore / localStorage) and
 * exposed through a tiny observable store so any screen re-renders when a new
 * report is filed. Swap the persistence for a backend call later; the public
 * API (useMaintenanceTickets / submitMaintenanceTicket) stays the same.
 */

import { useEffect, useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { renterMaintenance, type MaintenanceTicket } from '@/data/mock';
import { supabase } from '@/backend/config/supabase';
import { useAuthSession } from '@/services/auth';
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
let hydratedFor: string | null = null;
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
  const snapshot = useSyncExternalStore(subscribeMaintenance, getSnapshot, getSnapshot);
  const { session } = useAuthSession();

  useEffect(() => {
    void hydrateMaintenance(session?.user.id ?? null);
  }, [session?.user.id]);

  return snapshot;
}

async function hydrateMaintenance(userId: string | null): Promise<void> {
  if (!userId || hydratedFor === userId) return;
  hydratedFor = userId;
  const raw = await storageGet(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MaintenanceTicket[];
      if (Array.isArray(parsed)) setTickets(parsed);
    } catch {
      // Ignore malformed cache and keep the seeded tickets.
    }
  }
  const { data, error } = await supabase
    .from('renter_maintenance_tickets')
    .select('id, title, category, details, photo_uri, status, updated_at')
    .eq('renter_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  if (data) {
    setTickets(data.map((row) => ({
      id: row.id,
      title: row.title,
      detail: row.details,
      category: row.category,
      updatedAt: row.updated_at,
      status: row.status as MaintenanceTicket['status'],
      photoUri: row.photo_uri ?? undefined,
    })));
  }
}

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
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (userId) {
    const { error } = await supabase
      .from('renter_maintenance_tickets')
      .insert({
        id: ticket.id,
        renter_id: userId,
        title: ticket.title,
        category: ticket.category,
        details: ticket.detail,
        photo_uri: ticket.photoUri ?? null,
        status: ticket.status,
        updated_at: ticket.updatedAt,
      });
    if (error) throw error;
  }
  return ticket;
}
