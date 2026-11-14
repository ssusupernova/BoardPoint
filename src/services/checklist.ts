/**
 * BoardPoint renter preferences checklist.
 *
 * The checklist is saved on-device per account (SecureStore / localStorage on
 * web), mirroring the local auth service. Validation runs on the raw form
 * values before saving so a submission with missing required fields is caught
 * inline on the screen.
 */

import { GeoPoint } from '@/services/geocode';
import { supabase } from '@/backend/config/supabase';
import { parseISODate, toISODate } from '@/utils/date';

export type RoomType = 'private' | 'shared';
export type RadiusKm = 1 | 2 | 3 | 5 | 10;
export type Occupants = 1 | 2 | 3 | 4;

/** Raw, always-string form values as edited on screen. */
export interface ChecklistForm {
  originLabel: string;
  originPoint: GeoPoint | null;
  radiusKm: string;
  minRent: string;
  maxRent: string;
  roomType: RoomType;
  occupants: string;
  /** ISO yyyy-mm-dd or null when untouched/invalid. */
  moveInDate: string | null;
  mustHave: string[];
  nice: string[];
  rules: string[];
}

/** Parsed checklist as persisted / handed to a future results pipeline. */
export interface RenterChecklist {
  originLabel: string;
  originPoint: GeoPoint | null;
  radiusKm: RadiusKm;
  minRent: number;
  maxRent: number;
  roomType: RoomType;
  occupants: Occupants;
  moveInDate: string;
  mustHave: string[];
  nice: string[];
  rules: string[];
}

export type ChecklistErrors = Partial<
  Record<
    'originLabel' | 'radiusKm' | 'minRent' | 'maxRent' | 'roomType' | 'occupants' | 'moveInDate',
    string
  >
>;

export const RADIUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Within 1 km', value: '1' },
  { label: 'Within 2 km', value: '2' },
  { label: 'Within 3 km', value: '3' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 10 km', value: '10' },
];

export const ROOM_TYPE_OPTIONS: { label: string; value: RoomType }[] = [
  { label: 'Private room', value: 'private' },
  { label: 'Shared room', value: 'shared' },
];

export const OCCUPANT_OPTIONS: { label: string; value: string }[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4+', value: '4' },
];

export const AMENITY_OPTIONS: { id: string; label: string }[] = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'bathroom', label: 'Private bathroom' },
  { id: 'aircon', label: 'Air conditioning' },
  { id: 'kitchen', label: 'Kitchen access' },
  { id: 'water', label: 'Water included' },
  { id: 'electricity', label: 'Electricity included' },
];

export const NICE_TO_HAVE_OPTIONS: { id: string; label: string }[] = [
  { id: 'furnished', label: 'Furnished' },
  { id: 'laundry', label: 'Laundry area' },
];

export const HOUSE_RULE_OPTIONS: { id: string; label: string }[] = [
  { id: 'no-curfew', label: 'No curfew' },
  { id: 'non-smoking', label: 'Non-smoking' },
  { id: 'visitors', label: 'Visitors allowed' },
  { id: 'pets', label: 'Pets allowed' },
];

export function optionLabel(
  options: { id: string; label: string }[],
  id: string
): string | undefined {
  return options.find((option) => option.id === id)?.label;
}

export function createDefaultForm(): ChecklistForm {
  const moveIn = new Date();
  moveIn.setDate(moveIn.getDate() + 14);
  return {
    originLabel: '',
    originPoint: null,
    radiusKm: '3',
    minRent: '3500',
    maxRent: '6000',
    roomType: 'private',
    occupants: '1',
    moveInDate: toISODate(moveIn),
    mustHave: ['wifi', 'bathroom'],
    nice: ['furnished', 'laundry'],
    rules: ['no-curfew', 'non-smoking'],
  };
}

/* ------------------------------------------------------------- validation */

export function validateChecklist(form: ChecklistForm): ChecklistErrors {
  const errors: ChecklistErrors = {};

  if (!form.originLabel.trim()) {
    errors.originLabel = 'Enter an area, school, or workplace as your search origin.';
  }

  const radius = Number(form.radiusKm);
  if (!RADIUS_OPTIONS.some((option) => option.value === form.radiusKm) || !Number.isFinite(radius)) {
    errors.radiusKm = 'Choose a search radius.';
  }

  const min = parseDigits(form.minRent);
  const max = parseDigits(form.maxRent);
  if (!min) {
    errors.minRent = !form.minRent.trim()
      ? 'Enter your minimum budget.'
      : 'Enter an amount greater than ₱0.';
  }
  if (!max) {
    errors.maxRent = !form.maxRent.trim()
      ? 'Enter your maximum budget.'
      : 'Enter an amount greater than ₱0.';
  }
  if (min && max && min > max) {
    errors.maxRent = "Minimum budget can't be greater than maximum.";
  }

  if (!ROOM_TYPE_OPTIONS.some((option) => option.value === form.roomType)) {
    errors.roomType = 'Choose a room type.';
  }

  const occupants = Number(form.occupants);
  if (!OCCUPANT_OPTIONS.some((option) => option.value === form.occupants) || !Number.isFinite(occupants)) {
    errors.occupants = 'Choose how many will live in the room.';
  }

  if (!parseISODate(form.moveInDate)) {
    errors.moveInDate = 'Choose your earliest move-in date.';
  }

  return errors;
}

export function hasErrors(errors: ChecklistErrors): boolean {
  return Object.keys(errors).length > 0;
}

/* ------------------------------------------------------------- conversions */

function parseDigits(value: string): number | null {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function toChecklist(form: ChecklistForm): RenterChecklist {
  return {
    originLabel: form.originLabel.trim(),
    originPoint: form.originPoint,
    radiusKm: Number(form.radiusKm) as RadiusKm,
    minRent: parseDigits(form.minRent) ?? 0,
    maxRent: parseDigits(form.maxRent) ?? 0,
    roomType: form.roomType,
    occupants: Number(form.occupants) as Occupants,
    moveInDate: form.moveInDate ?? toISODate(new Date()),
    mustHave: form.mustHave,
    nice: form.nice,
    rules: form.rules,
  };
}

export function toForm(checklist: RenterChecklist): ChecklistForm {
  return {
    originLabel: checklist.originLabel,
    originPoint: checklist.originPoint,
    radiusKm: String(checklist.radiusKm),
    minRent: String(checklist.minRent),
    maxRent: String(checklist.maxRent),
    roomType: checklist.roomType,
    occupants: String(checklist.occupants),
    moveInDate: checklist.moveInDate,
    mustHave: checklist.mustHave,
    nice: checklist.nice,
    rules: checklist.rules,
  };
}

/* ---------------------------------------------------------------- persistence */

export async function loadChecklist(userId: string): Promise<RenterChecklist | null> {
  const { data, error } = await supabase
    .from('renter_preferences')
    .select(
      'origin_label, origin_latitude, origin_longitude, search_radius_km, min_monthly_rent, max_monthly_rent, preferred_room_type, occupants, move_in_date, must_have, nice_to_have, preferred_rules',
    )
    .eq('renter_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const radiusKm = Number(data.search_radius_km);
  const occupants = Number(data.occupants);
  const roomType = data.preferred_room_type;
  if (
    ![1, 2, 3, 5, 10].includes(radiusKm)
    || ![1, 2, 3, 4].includes(occupants)
    || (roomType !== 'private_room' && roomType !== 'shared_room')
    || typeof data.move_in_date !== 'string'
  ) {
    throw new Error('The saved preferences have an unsupported value. Please review them.');
  }

  const hasCoordinates =
    typeof data.origin_latitude === 'number' && typeof data.origin_longitude === 'number';
  return {
    originLabel: data.origin_label ?? '',
    originPoint: hasCoordinates
      ? { latitude: data.origin_latitude, longitude: data.origin_longitude }
      : null,
    radiusKm: radiusKm as RadiusKm,
    minRent: Number(data.min_monthly_rent),
    maxRent: Number(data.max_monthly_rent),
    roomType: roomType === 'private_room' ? 'private' : 'shared',
    occupants: occupants as Occupants,
    moveInDate: data.move_in_date,
    mustHave: data.must_have ?? [],
    nice: data.nice_to_have ?? [],
    rules: data.preferred_rules ?? [],
  };
}

export async function saveChecklist(userId: string, checklist: RenterChecklist): Promise<void> {
  const { error } = await supabase.from('renter_preferences').upsert({
    renter_id: userId,
    origin_label: checklist.originLabel,
    origin_latitude: checklist.originPoint?.latitude ?? null,
    origin_longitude: checklist.originPoint?.longitude ?? null,
    search_radius_km: checklist.radiusKm,
    min_monthly_rent: checklist.minRent,
    max_monthly_rent: checklist.maxRent,
    preferred_room_type: checklist.roomType === 'private' ? 'private_room' : 'shared_room',
    occupants: checklist.occupants,
    move_in_date: checklist.moveInDate,
    must_have: checklist.mustHave,
    nice_to_have: checklist.nice,
    preferred_rules: checklist.rules,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'renter_id' });
  if (error) throw error;
}
