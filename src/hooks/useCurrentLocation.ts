import { useState } from 'react';
import * as Location from 'expo-location';
import { GeoPoint } from '@/services/geocode';

export const LOCATION_ERROR_MESSAGES = {
  denied:
    'Location access is off. Allow it in your device settings, or type an area and use the map pin instead.',
  failed: "We couldn't get your location. Type an area and use the map pin instead.",
} as const;

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getLocation(): Promise<GeoPoint | null> {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(LOCATION_ERROR_MESSAGES.denied);
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      setError(LOCATION_ERROR_MESSAGES.failed);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, getLocation };
}
