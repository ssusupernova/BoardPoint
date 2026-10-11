/**
 * BoardPoint payment-method service.
 *
 * Holds the renter's selected payment method in a tiny observable store so the
 * payments screen and the method selector stay in sync. Persisted on-device.
 */

import { useSyncExternalStore } from 'react';
import { renterPaymentMethods, type PaymentMethod } from '@/data/mock';
import { storageGet, storageSet } from '@/services/storage';

const STORAGE_KEY = 'payments.method';

let selectedId = renterPaymentMethods[0]?.id ?? '';
let hydrated = false;
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
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSelectedPaymentMethod(): PaymentMethod {
  const id = useSelectedPaymentMethodId();
  return renterPaymentMethods.find((method) => method.id === id) ?? renterPaymentMethods[0];
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const raw = await storageGet(STORAGE_KEY);
  if (raw && renterPaymentMethods.some((method) => method.id === raw)) setSelectedId(raw);
}

void hydrate();

export async function selectPaymentMethod(id: string): Promise<void> {
  if (!renterPaymentMethods.some((method) => method.id === id)) return;
  setSelectedId(id);
  await storageSet(STORAGE_KEY, id);
}
