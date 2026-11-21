import type { GeoPoint } from '@/services/geocode';

const EARTH_RADIUS_KM = 6371;

export function distanceBetweenKm(origin: GeoPoint, destination: GeoPoint): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude)
      * Math.cos(destinationLatitude)
      * Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function estimateTravelMinutes(distanceKm: number, mode: 'walking' | 'vehicle' = 'vehicle'): number {
  const averageSpeedKph = mode === 'walking' ? 5 : 25;
  return Math.max(1, Math.round((distanceKm / averageSpeedKph) * 60));
}

export function formatTravelDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr ${remainingMinutes} min`;
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(distanceKm < 1 ? 2 : 1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}
