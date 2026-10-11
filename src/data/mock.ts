/**
 * BoardPoint mock data.
 *
 * Stand-in for a real backend until the API is wired up. Domain data now lives
 * in focused modules (`types`, `renter`, `landlord`) and is re-exported here so
 * existing `@/data/mock` imports keep working. Replace the arrays with fetched
 * data later without touching consumers.
 */

export * from './types';
export * from './renter';
export * from './landlord';
