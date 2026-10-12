/**
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
