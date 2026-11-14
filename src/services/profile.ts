/**
 * BoardPoint renter-contact service.
 *
 * Name and email are owned by the account (auth session); mobile and emergency
 * contact are stored on the signed-in user's Supabase profile.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/backend/config/supabase';
import { getAuthState, useAuthSession } from '@/services/auth';

export type RenterContact = {
  mobile: string;
  emergencyContact: string;
};

let contact: RenterContact = { mobile: '', emergencyContact: '' };
let loadedForUserId: string | null = null;
let loadRevision = 0;
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
  const { session } = useAuthSession();
  const userId = session?.user.id ?? null;
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!userId) {
      loadedForUserId = null;
      setContact({ mobile: '', emergencyContact: '' });
      return;
    }
    if (loadedForUserId !== userId) void loadContact(userId);
  }, [userId]);

  return value;
}

async function loadContact(userId: string): Promise<void> {
  const revision = ++loadRevision;
  const { data, error } = await supabase
    .from('profiles')
    .select('phone, emergency_contact')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Unable to load profile contact details:', error);
    return;
  }
  if (revision !== loadRevision) return;
  loadedForUserId = userId;
  setContact({
    mobile: data.phone ?? '',
    emergencyContact: data.emergency_contact ?? '',
  });
}

export async function saveRenterContact(next: RenterContact): Promise<void> {
  const userId = getAuthState().session?.user.id;
  if (!userId) throw new Error('Sign in before updating your profile.');

  const { error } = await supabase
    .from('profiles')
    .update({
      phone: next.mobile.trim(),
      emergency_contact: next.emergencyContact.trim(),
    })
    .eq('id', userId);
  if (error) throw error;

  loadedForUserId = userId;
  setContact({
    mobile: next.mobile.trim(),
    emergencyContact: next.emergencyContact.trim(),
  });
}
