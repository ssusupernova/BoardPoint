"use strict";
/**
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEIGHTS = exports.CATEGORY_ORDER = void 0;
exports.parseCapacity = parseCapacity;
exports.scoreRoom = scoreRoom;
exports.rankRooms = rankRooms;
exports.groupByCategory = groupByCategory;
/** Display order of the marketplace category carousels. */
exports.CATEGORY_ORDER = [
    'Village House',
    'Condo',
    'Apartment',
    'Boarding House',
];
/**
 * Scoring weights. Mandatory requirements gate `meetsAll`; everything below
 * only adds points.
 */
exports.WEIGHTS = {
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
};
/** Checklist amenity/rule id → canonical display label. */
const AMENITY_LABELS = {
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
const AMENITY_ALIASES = {
    laundry: 'laundry area',
    airconditioned: 'air conditioning',
    cookingallowed: 'kitchen access',
};
function normalizeAmenity(value) {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const spaced = value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return AMENITY_ALIASES[compact] ?? spaced;
}
function labelsFor(ids) {
    return ids.map((id) => normalizeAmenity(AMENITY_LABELS[id] ?? id));
}
/** Occupancy strings look like "1 person", "2 persons", "Up to 3 persons". */
function parseCapacity(occupancy) {
    if (!occupancy)
        return null;
    const match = occupancy.match(/(\d+)/);
    if (!match)
        return null;
    const value = Number(match[1]);
    return Number.isFinite(value) && value > 0 ? value : null;
}
function roomTypeLabel(roomType) {
    return roomType === 'private' ? 'Private room' : 'Shared room';
}
function scoreRoom(room, checklist) {
    if (!room.available)
        return null;
    const reasons = [];
    let meetsAll = true;
    if (room.roomType !== roomTypeLabel(checklist.roomType))
        meetsAll = false;
    if (room.price > checklist.maxRent)
        meetsAll = false;
    const haystack = [...(room.amenities ?? []), ...(room.featureBadges ?? [])].map(normalizeAmenity);
    const mustLabels = labelsFor(checklist.mustHave);
    const matchedMust = mustLabels.filter((label) => haystack.includes(label));
    if (matchedMust.length < mustLabels.length)
        meetsAll = false;
    let score = exports.WEIGHTS.base;
    if (room.price >= checklist.minRent) {
        score += exports.WEIGHTS.budgetComfort;
        reasons.push('Within your budget');
    }
    else {
        score += exports.WEIGHTS.budgetDeal;
        reasons.push('Below your budget');
    }
    score += Math.min(matchedMust.length * exports.WEIGHTS.mustHaveEach, 24);
    if (matchedMust.length > 0) {
        reasons.push(`${matchedMust.length} must-have${matchedMust.length === 1 ? '' : 's'} matched`);
    }
    const matchedNice = labelsFor(checklist.nice).filter((label) => haystack.includes(label));
    score += matchedNice.length * exports.WEIGHTS.niceEach;
    const matchedRules = labelsFor(checklist.rules).filter((label) => haystack.includes(label));
    score += matchedRules.length * exports.WEIGHTS.ruleEach;
    if (matchedNice.length + matchedRules.length > 0) {
        reasons.push(`${matchedNice.length + matchedRules.length} extra preference${matchedNice.length + matchedRules.length === 1 ? '' : 's'} matched`);
    }
    const capacity = parseCapacity(room.occupancy);
    if (capacity != null && capacity >= checklist.occupants) {
        score += exports.WEIGHTS.occupancy;
        reasons.push(`Fits ${checklist.occupants} occupant${checklist.occupants === 1 ? '' : 's'}`);
    }
    if (checklist.radiusKm > 0) {
        const closeness = Math.max(0, 1 - room.distanceKm / checklist.radiusKm);
        score += Math.round(closeness * exports.WEIGHTS.distance);
        if (closeness >= 0.5)
            reasons.push(`Close to ${room.distanceFromLabel ?? 'your origin'}`);
    }
    return { room, score: Math.max(0, Math.min(100, Math.round(score))), meetsAll, reasons };
}
/**
 * Ranks rooms against a checklist. Pass `null` when the renter has no saved
 * checklist: rooms fall back to their seed order with `meetsAll` false so the
 * UI can label the list as unpersonalized instead of faking a match.
 */
function rankRooms(rooms, checklist) {
    const available = rooms.filter((room) => room.available);
    if (!checklist) {
        const ordered = [...available]
            .sort((a, b) => b.matchPercent - a.matchPercent)
            .map((room) => ({
            room,
            score: room.matchPercent,
            meetsAll: false,
            reasons: [],
        }));
        return { recommended: [], others: ordered };
    }
    const scored = available
        .map((room) => scoreRoom(room, checklist))
        .filter((item) => item !== null)
        .sort((a, b) => b.score - a.score);
    return {
        recommended: scored.filter((item) => item.meetsAll),
        others: scored.filter((item) => !item.meetsAll),
    };
}
/** Groups scored rooms into carousels in `CATEGORY_ORDER`, skipping empties. */
function groupByCategory(scored) {
    return exports.CATEGORY_ORDER.map((category) => ({
        category,
        rooms: scored.filter((item) => item.room.category === category),
    })).filter((group) => group.rooms.length > 0);
}
