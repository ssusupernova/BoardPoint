/**
<<<<<<< HEAD
 * BoardPoint checklist-based room recommendations.
 *
 * Pure module (type-only imports): the ranking can be unit-tested in plain
 * Node without Expo. The recommendation pipeline is:
 *
 *   1. Drop unavailable listings — they never appear as recommendations.
 *   2. Enforce mandatory requirements: room type, within max budget, and every
 *      must-have amenity. Rooms failing any of these land in "others".
 *   3. Score the survivors with transparent weights (see WEIGHTS) and sort
 *      best-first.
 *
 * Notes & approximations (kept explicit rather than hidden):
 * - `distanceKm` is a static seed distance measured from Sta. Cruz, so the
 *   radius preference scores closeness instead of filtering — a free-text
 *   origin ("near campus") cannot be geocoded against room coordinates that do
 *   not exist in the dataset.
 * - Amenities are matched case-insensitively against the checklist vocabulary
 *   (`mustHave`/`nice` ids mapped to labels, plus legacy seed aliases).
 */

import type { RenterRoom, RoomCategory } from '@/data/types';
import type { RenterChecklist } from '@/services/checklist';

/** Display order of the marketplace category carousels. */
export const CATEGORY_ORDER: RoomCategory[] = [
  'Village House',
  'Condo',
  'Apartment',
  'Boarding House',
];

/**
 * Scoring weights. Mandatory requirements gate `meetsAll`; everything below
 * only adds points.
 */
export const WEIGHTS = {
  /** Base score granted for meeting every mandatory requirement. */
  base: 40,
  /** Room price inside the [minRent, maxRent] comfort band. */
  budgetComfort: 8,
  /** Room price below minRent (a good deal, but outside the stated band). */
  budgetDeal: 4,
  /** Each matched must-have amenity (mandatory set, also scored). */
  mustHaveEach: 6,
  /** Each matched nice-to-have amenity. */
  niceEach: 4,
  /** Each matched house rule. */
  ruleEach: 3,
  /** Room sleeps at least the requested occupants. */
  occupancy: 6,
  /** Closeness bonus, scaled by the renter's radius (max value). */
  distance: 10,
} as const;

export interface ScoredRoom {
  room: RenterRoom;
  /** 0-100 match score. */
  score: number;
  /** True when the room passes every mandatory requirement. */
  meetsAll: boolean;
  /** Short human-readable match reasons for the UI. */
  reasons: string[];
}

export interface RankedRooms {
  /** Rooms meeting every mandatory requirement, best-first. */
  recommended: ScoredRoom[];
  /** Partial matches, best-first — shown as "other rooms you may like". */
  others: ScoredRoom[];
}

/** Checklist amenity/rule id → canonical display label. */
const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  bathroom: 'Private bathroom',
  aircon: 'Air conditioning',
  kitchen: 'Kitchen access',
  water: 'Water included',
  electricity: 'Electricity included',
  furnished: 'Furnished',
  laundry: 'Laundry area',
  'no-curfew': 'No curfew',
  'non-smoking': 'Non-smoking',
  visitors: 'Visitors allowed',
  pets: 'Pets allowed',
};

/** Legacy seed spellings that mean the same amenity. */
const AMENITY_ALIASES: Record<string, string> = {
  laundry: 'laundry area',
  airconditioned: 'air conditioning',
  cookingallowed: 'kitchen access',
};

function normalizeAmenity(value: string): string {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const spaced = value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return AMENITY_ALIASES[compact] ?? spaced;
}

function labelsFor(ids: string[]): string[] {
  return ids.map((id) => normalizeAmenity(AMENITY_LABELS[id] ?? id));
}

/** Occupancy strings look like "1 person", "2 persons", "Up to 3 persons". */
export function parseCapacity(occupancy?: string): number | null {
  if (!occupancy) return null;
  const match = occupancy.match(/(\d+)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function roomTypeLabel(roomType: RenterChecklist['roomType']): 'Private room' | 'Shared room' {
  return roomType === 'private' ? 'Private room' : 'Shared room';
}

export function scoreRoom(room: RenterRoom, checklist: RenterChecklist): ScoredRoom | null {
  if (!room.available) return null;

  const reasons: string[] = [];
  let meetsAll = true;

  if (room.roomType !== roomTypeLabel(checklist.roomType)) meetsAll = false;
  if (room.price > checklist.maxRent) meetsAll = false;

  const haystack = [...(room.amenities ?? []), ...(room.featureBadges ?? [])].map(
    normalizeAmenity
  );
  const mustLabels = labelsFor(checklist.mustHave);
  const matchedMust = mustLabels.filter((label) => haystack.includes(label));
  if (matchedMust.length < mustLabels.length) meetsAll = false;

  let score = WEIGHTS.base;
  if (room.price >= checklist.minRent) {
    score += WEIGHTS.budgetComfort;
    reasons.push('Within your budget');
  } else {
    score += WEIGHTS.budgetDeal;
    reasons.push('Below your budget');
  }

  score += Math.min(matchedMust.length * WEIGHTS.mustHaveEach, 24);
  if (matchedMust.length > 0) {
    reasons.push(
      `${matchedMust.length} must-have${matchedMust.length === 1 ? '' : 's'} matched`
    );
  }

  const matchedNice = labelsFor(checklist.nice).filter((label) => haystack.includes(label));
  score += matchedNice.length * WEIGHTS.niceEach;
  const matchedRules = labelsFor(checklist.rules).filter((label) => haystack.includes(label));
  score += matchedRules.length * WEIGHTS.ruleEach;
  if (matchedNice.length + matchedRules.length > 0) {
    reasons.push(
      `${matchedNice.length + matchedRules.length} extra preference${matchedNice.length + matchedRules.length === 1 ? '' : 's'} matched`
    );
  }

  const capacity = parseCapacity(room.occupancy);
  if (capacity != null && capacity >= checklist.occupants) {
    score += WEIGHTS.occupancy;
    reasons.push(`Fits ${checklist.occupants} occupant${checklist.occupants === 1 ? '' : 's'}`);
  }

  if (checklist.radiusKm > 0) {
    const closeness = Math.max(0, 1 - room.distanceKm / checklist.radiusKm);
    score += Math.round(closeness * WEIGHTS.distance);
    if (closeness >= 0.5) reasons.push(`Close to ${room.distanceFromLabel ?? 'your origin'}`);
  }

  return { room, score: Math.max(0, Math.min(100, Math.round(score))), meetsAll, reasons };
}

/**
 * Ranks rooms against a checklist. Pass `null` when the renter has no saved
 * checklist: rooms fall back to their seed order with `meetsAll` false so the
 * UI can label the list as unpersonalized instead of faking a match.
 */
export function rankRooms(
  rooms: RenterRoom[],
  checklist: RenterChecklist | null
): RankedRooms {
  const available = rooms.filter((room) => room.available);
  if (!checklist) {
    const ordered = [...available]
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .map((room) => ({
        room,
        score: room.matchPercent,
        meetsAll: false,
        reasons: [] as string[],
      }));
    return { recommended: [], others: ordered };
  }

  const scored = available
    .map((room) => scoreRoom(room, checklist))
    .filter((item): item is ScoredRoom => item !== null)
    .sort((a, b) => b.score - a.score);

  return {
    recommended: scored.filter((item) => item.meetsAll),
    others: scored.filter((item) => !item.meetsAll),
  };
}

export interface CategoryGroup {
  category: RoomCategory;
  rooms: ScoredRoom[];
}

/** Groups scored rooms into carousels in `CATEGORY_ORDER`, skipping empties. */
export function groupByCategory(scored: ScoredRoom[]): CategoryGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    rooms: scored.filter((item) => item.room.category === category),
  })).filter((group) => group.rooms.length > 0);
}
=======
 * BoardPoint renter recommendations.
 *
 * A pure, framework-free ranking engine that scores marketplace listings
 * against a saved `RenterChecklist`. Kept side-effect free so it can be unit
 * tested and reused by any renter screen. Nothing here reads or writes state —
 * callers pass the checklist and the listing catalogue in.
 */

import {
  HOUSE_RULE_OPTIONS,
  NICE_TO_HAVE_OPTIONS,
  AMENITY_OPTIONS,
  type RenterChecklist,
} from '@/services/checklist';
import { ROOM_CATEGORY_ORDER, type RenterListing, type RoomCategory } from '@/data/renter';

/** A ranked listing with its computed match score and human highlights. */
export interface RecommendedRoom extends RenterListing {
  /** 0–100 suitability against the checklist (higher is better). */
  matchPercent: number;
  /** Short, human-readable reasons the room fits. */
  highlights: string[];
  /** True when every must-have amenity is present. */
  meetsMustHaves: boolean;
  /** True when the rent sits inside the saved budget band. */
  withinBudget: boolean;
  /** True when the room is inside the saved search radius. */
  withinRadius: boolean;
}

/** A category carousel: every matching room in one marketplace category. */
export interface RecommendationGroup {
  category: RoomCategory;
  rooms: RecommendedRoom[];
}

const LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  [...AMENITY_OPTIONS, ...NICE_TO_HAVE_OPTIONS, ...HOUSE_RULE_OPTIONS].map((option) => [
    option.id,
    option.label,
  ])
);

/** Labels a room advertises through its badges and amenity list. */
function listingLabels(listing: RenterListing): Set<string> {
  return new Set([...(listing.featureBadges ?? []), ...(listing.amenities ?? [])]);
}

/**
 * Score a single listing against the checklist.
 *
 * The score starts at 100 and loses points for each mismatch. Price and radius
 * are hard signals; missing must-haves hurt the most, missing nice-to-haves the
 * least. The result is clamped to 0–100 so it reads as a percentage.
 */
export function scoreListing(
  listing: RenterListing,
  checklist: RenterChecklist
): RecommendedRoom {
  const labels = listingLabels(listing);
  let score = 100;

  const wantsType = checklist.roomType === 'private' ? 'Private room' : 'Shared room';
  if (listing.roomType !== wantsType) score -= 30;

  const withinBudget = listing.price >= checklist.minRent && listing.price <= checklist.maxRent;
  if (listing.price > checklist.maxRent) {
    const overage = (listing.price - checklist.maxRent) / Math.max(checklist.maxRent, 1);
    score -= Math.min(40, 15 + overage * 100);
  } else if (listing.price < checklist.minRent) {
    score -= 6;
  }

  const withinRadius = listing.distanceKm <= checklist.radiusKm;
  if (!withinRadius) {
    const overage = listing.distanceKm - checklist.radiusKm;
    score -= Math.min(25, 8 + overage * 5);
  }

  const missingMust = checklist.mustHave.filter((id) => {
    const label = LABEL_BY_ID[id];
    return label != null && !labels.has(label);
  });
  score -= missingMust.length * 22;

  const missingNice = checklist.nice.filter((id) => {
    const label = LABEL_BY_ID[id];
    return label != null && !labels.has(label);
  });
  score -= missingNice.length * 5;

  const matchPercent = Math.max(0, Math.min(100, Math.round(score)));

  return {
    ...listing,
    matchPercent,
    meetsMustHaves: missingMust.length === 0,
    withinBudget,
    withinRadius,
    highlights: buildHighlights(listing, {
      checklist,
      withinBudget,
      withinRadius,
      missingMust,
    }),
  };
}

function buildHighlights(
  listing: RenterListing,
  context: {
    checklist: RenterChecklist;
    withinBudget: boolean;
    withinRadius: boolean;
    missingMust: string[];
  }
): string[] {
  const { checklist, withinBudget, withinRadius, missingMust } = context;
  const labels = listingLabels(listing);
  const highlights: string[] = [];

  if (withinBudget) highlights.push('Within budget');
  if (withinRadius) highlights.push(`${listing.distanceKm} km from ${checklist.originLabel}`);

  for (const id of checklist.mustHave) {
    if (missingMust.includes(id)) continue;
    const label = LABEL_BY_ID[id];
    if (label && labels.has(label) && !highlights.includes(label)) highlights.push(label);
  }

  if (highlights.length < 3 && listing.availabilityLabel) {
    highlights.push(listing.availabilityLabel);
  }

  return highlights.slice(0, 3);
}

/**
 * Rank every listing and drop the weak matches. Results are sorted by score
 * descending, and `matchPercent` is floored at `minScore` unless the minimum
 * count would otherwise be empty (so a sparse catalogue still shows something).
 */
export function recommendRooms(
  listings: RenterListing[],
  checklist: RenterChecklist,
  minScore = 40,
  limit = 24
): RecommendedRoom[] {
  const scored = listings
    .map((listing) => scoreListing(listing, checklist))
    .sort((a, b) => b.matchPercent - a.matchPercent);

  const strong = scored.filter((room) => room.matchPercent >= minScore);
  return (strong.length ? strong : scored).slice(0, limit);
}

/**
 * Split ranked rooms into the marketplace's category carousels, preserving
 * `ROOM_CATEGORY_ORDER` and dropping empty categories.
 */
export function groupByCategory(rooms: RecommendedRoom[]): RecommendationGroup[] {
  return ROOM_CATEGORY_ORDER.map((category) => ({
    category,
    rooms: rooms.filter((room) => room.category === category),
  })).filter((group) => group.rooms.length > 0);
}

/** Average match score across ranked rooms, for the results header. */
export function averageMatch(rooms: RecommendedRoom[]): number {
  if (rooms.length === 0) return 0;
  const total = rooms.reduce((sum, room) => sum + room.matchPercent, 0);
  return Math.round(total / rooms.length);
}
>>>>>>> momay
