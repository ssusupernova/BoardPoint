/**
 * BoardPoint payment-method service.
 *
 * Holds the renter's selected payment method in a tiny observable store so the
 * payments screen and the method selector stay in sync. Persisted on-device.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/backend/config/supabase';
import { useAuthSession } from '@/services/auth';
import { renterPaymentMethods, type PaymentMethod } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';

const STORAGE_KEY = 'payments.method';

let selectedId = renterPaymentMethods[0]?.id ?? '';
let hydratedFor: string | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setSelectedId(next: string): void {
  selectedId = next;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string {
  return selectedId;
}

export function useSelectedPaymentMethodId(): string {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { session } = useAuthSession();

  useEffect(() => {
    void hydrate(session?.user.id ?? null);
  }, [session?.user.id]);

  return snapshot;
}

export function useSelectedPaymentMethod(): PaymentMethod {
  const id = useSelectedPaymentMethodId();
  return renterPaymentMethods.find((method) => method.id === id) ?? renterPaymentMethods[0];
}

async function hydrate(userId: string | null): Promise<void> {
  if (!userId || hydratedFor === userId) return;
  hydratedFor = userId;
  const raw = await storageGet(STORAGE_KEY);
  if (raw && renterPaymentMethods.some((method) => method.id === raw)) setSelectedId(raw);
  const { data, error } = await supabase
    .from('renter_payment_methods')
    .select('selected_method_id')
    .eq('renter_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data && renterPaymentMethods.some((method) => method.id === data.selected_method_id)) {
    setSelectedId(data.selected_method_id);
  }
}

export async function selectPaymentMethod(id: string): Promise<void> {
  if (!renterPaymentMethods.some((method) => method.id === id)) return;
  setSelectedId(id);
  await storageSet(STORAGE_KEY, id);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) return;
  const { error } = await supabase
    .from('renter_payment_methods')
    .upsert({
      renter_id: userId,
      selected_method_id: id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'renter_id' });
  if (error) throw error;
}
