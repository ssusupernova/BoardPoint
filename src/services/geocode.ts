/**
 * Geocoding seam for BoardPoint.
 *
 * Two operations power the property-location UI:
 * - `suggest` — forward search behind the address field (up to 5 matches).
 * - `reverse` — best-effort human label for a pinned coordinate (preview).
 *
 * No provider is hard-wired. Set `EXPO_PUBLIC_GEOCODER_URL` to a
 * Photon-compatible endpoint (e.g. `https://photon.komoot.io/api`, or a
 * Supabase Edge Function proxying it) and both calls start hitting the
 * network:
 *
 *   suggest:  GET {url}/?q={text}&limit=5
 *   reverse:  GET {url}/reverse?lat={lat}&lon={lon}
 *
 * Responses are parsed tolerantly — a Photon GeoJSON FeatureCollection, a
 * Nominatim-style `{ display_name, lat, lon }` array, or a plain
 * `{ label, latitude, longitude }` list all work. When the endpoint is not
 * configured, or a request fails, the typed errors below are thrown so the UI
 * can show a clear "search unavailable — drag the pin instead" state while the
 * draggable map keeps working offline.
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

/** No geocoder endpoint configured on this build. */
export class GeocodeUnavailableError extends Error {
  constructor(message = 'Address search is not available on this build.') {
    super(message);
    this.name = 'GeocodeUnavailableError';
  }
}

/** Endpoint configured but unreachable, slow, or answering with an error. */
export class GeocodeRequestError extends Error {
  constructor(message = 'Address search could not reach the geocoding service.') {
    super(message);
    this.name = 'GeocodeRequestError';
  }
}

const GEOCODER_URL = (process.env.EXPO_PUBLIC_GEOCODER_URL ?? '').trim();

/** True when a geocoder endpoint is configured for this build. */
export const geocodingConfigured = GEOCODER_URL.length > 0;

const REQUEST_TIMEOUT_MS = 8000;
const MAX_SUGGESTIONS = 5;

async function geocoderFetch(path: string): Promise<unknown> {
  if (!geocodingConfigured) throw new GeocodeUnavailableError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${GEOCODER_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new GeocodeRequestError(
        `The geocoding service responded with ${response.status}. Try again shortly.`
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof GeocodeRequestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new GeocodeRequestError('Address search timed out. Check your connection and try again.');
    }
    throw new GeocodeRequestError('Address search could not reach the geocoding service.');
  } finally {
    clearTimeout(timer);
  }
}

function toPoint(latitude: unknown, longitude: unknown): GeoPoint | null {
  const lat = typeof latitude === 'string' ? Number(latitude) : latitude;
  const lon = typeof longitude === 'string' ? Number(longitude) : longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { latitude: lat, longitude: lon };
}

function recordPoint(record: Record<string, unknown>): GeoPoint | null {
  if ('latitude' in record || 'longitude' in record) {
    return toPoint(record.latitude, record.longitude);
  }
  if ('lat' in record || 'lon' in record || 'lng' in record) {
    return toPoint(record.lat, record.lon ?? record.lng);
  }
  const geometry = record.geometry as { coordinates?: unknown } | undefined;
  const coordinates = geometry?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    return toPoint(coordinates[1], coordinates[0]);
  }
  return null;
}

function joinLabel(parts: (string | undefined | null)[]): string {
  const seen = new Set<string>();
  const label: string[] = [];
  for (const part of parts) {
    const value = part?.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    label.push(value);
  }
  return label.join(', ');
}

function recordLabel(record: Record<string, unknown>): string {
  if (typeof record.label === 'string') return record.label.trim();
  if (typeof record.display_name === 'string') return record.display_name.trim();
  if (typeof record.address === 'string') return record.address.trim();

  const properties = (record.properties ?? record) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === 'string' ? value : undefined);
  const street = joinLabel([text(properties.street), text(properties.housenumber)]);
  return joinLabel([
    text(properties.name) ?? text(properties.title),
    street,
    text(properties.district) ?? text(properties.neighbourhood) ?? text(properties.suburb),
    text(properties.city) ?? text(properties.town) ?? text(properties.village),
    text(properties.state),
    text(properties.country),
  ]);
}

function recordsFrom(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.features)) {
    return payload.features.filter(isRecord);
  }
  for (const key of ['results', 'suggestions', 'items', 'places']) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter(isRecord);
  }
  return [payload];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSuggestions(payload: unknown): PlaceSuggestion[] {
  const suggestions: PlaceSuggestion[] = [];
  for (const record of recordsFrom(payload)) {
    const point = recordPoint(record);
    if (!point) continue;
    const label = recordLabel(record);
    if (!label) continue;
    suggestions.push({ label, point });
    if (suggestions.length >= MAX_SUGGESTIONS) break;
  }
  return suggestions;
}

export const geocodeProvider: GeocodeProvider = {
  async suggest(query: string): Promise<PlaceSuggestion[]> {
    const text = query.trim();
    if (text.length < 3) return [];
    const payload = await geocoderFetch(`/?q=${encodeURIComponent(text)}&limit=${MAX_SUGGESTIONS}`);
    return toSuggestions(payload);
  },

  async reverse(point: GeoPoint): Promise<string> {
    const payload = await geocoderFetch(
      `/reverse?lat=${point.latitude.toFixed(6)}&lon=${point.longitude.toFixed(6)}&limit=1`
    );
    return toSuggestions(payload)[0]?.label ?? '';
  },
};
