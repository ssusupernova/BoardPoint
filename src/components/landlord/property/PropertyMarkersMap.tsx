import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MapOverlay } from '@/components/common/MapOverlay/MapOverlay';
import { DEFAULT_MAP_POINT } from '@/services/geocode';
import {
  MARKER_COLOR,
  MARKER_SELECTED_COLOR,
  type PropertyMarkerPoint,
  type PropertyMarkersMapProps,
} from './PropertyMarkersMap.types';
import { propertyMarkersMapStyles as styles } from './PropertyMarkersMap.styles';

const LOAD_TIMEOUT_MS = 12000;
const MIN_DELTA = 0.006;

function regionFor(properties: PropertyMarkerPoint[]): Region {
  if (properties.length === 0) {
    return {
      latitude: DEFAULT_MAP_POINT.latitude,
      longitude: DEFAULT_MAP_POINT.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }
  const latitudes = properties.map((item) => item.latitude);
  const longitudes = properties.map((item) => item.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.8, MIN_DELTA),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.8, MIN_DELTA),
  };
}

/**
 * Map showing one marker per landlord property. The selected property renders
 * in the brown-orange primary (#BF7E4A) with a halo; the rest use the
 * BoardPoint light blue (#93C5E2). Device location is never requested or
 * displayed here — renters' and tenants' positions are not part of this view.
 */
export function PropertyMarkersMap({
  properties,
  selectedId,
  onSelect,
  height = 340,
}: PropertyMarkersMapProps) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const region = useMemo(() => regionFor(properties), [properties]);
  const regionKey = `${region.latitude.toFixed(5)},${region.longitude.toFixed(5)},${region.latitudeDelta.toFixed(5)},${region.longitudeDelta.toFixed(5)}`;
  const lastRegionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [attempt]);

  useEffect(() => {
    if (lastRegionKeyRef.current === regionKey) return;
    lastRegionKeyRef.current = regionKey;
    mapRef.current?.animateToRegion(region, 400);
  }, [regionKey, region]);

  const retry = () => {
    setReady(false);
    setTimedOut(false);
    setAttempt((value) => value + 1);
  };

  const status: 'loading' | 'ready' | 'error' = ready ? 'ready' : timedOut ? 'error' : 'loading';

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        key={attempt}
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={false}
        onMapReady={() => setReady(true)}
      >
        {properties.map((property) => {
          const selected = property.id === selectedId;
          return (
            <Marker
              key={property.id}
              coordinate={{ latitude: property.latitude, longitude: property.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={selected ? 10 : 1}
              title={property.name}
              description={property.address}
              onPress={() => onSelect(property.id)}
            >
              <View style={styles.pinWrap} pointerEvents="none">
                {selected ? <View style={styles.pinHalo} /> : null}
                <Ionicons
                  name={property.confirmed ? 'location' : 'location-outline'}
                  size={selected ? 34 : 26}
                  color={selected ? MARKER_SELECTED_COLOR : MARKER_COLOR}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {status !== 'ready' ? (
        <MapOverlay
          status={status === 'error' ? 'error' : 'loading'}
          onRetry={retry}
          message="Map tiles couldn’t load. Check your connection, then try again."
        />
      ) : null}
    </View>
  );
}
