/**
 * Geocoding seam for BoardPoint.
 *
 * Nothing here talks to the network yet: typed places are saved as free text,
 * and coordinates only come from GPS or the draggable map pin.
 *
 * To wire a real provider (e.g. an OSM Photon/Nominatim lookup behind a
 * Supabase Edge Function), set EXPO_PUBLIC_GEOCODER_URL to the edge function
 * endpoint and implement the fetch calls below — the checklist UI already
 * consumes this interface and will not need to change.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface PlaceSuggestion {
  label: string;
  point: GeoPoint;
}

export interface GeocodeProvider {
  /** Best-effort human label for a coordinate. */
  reverse(point: GeoPoint): Promise<string>;
  /** Up to 5 matches for free text; empty until a provider is configured. */
  suggest(query: string): Promise<PlaceSuggestion[]>;
}

/** Center used for the map pin before the renter picks a point (Dapitan City). */
export const DEFAULT_MAP_POINT: GeoPoint = {
  latitude: 9.3078,
  longitude: 123.3069,
};

export const geocodeProvider: GeocodeProvider = {
  async reverse() {
    return 'Pinned location';
  },
  async suggest() {
    return [];
  },
};
