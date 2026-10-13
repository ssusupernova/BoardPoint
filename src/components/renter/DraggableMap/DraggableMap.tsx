import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapOverlay } from '@/components/common/MapOverlay/MapOverlay';
import { GeoPoint } from '@/services/geocode';
import { colors } from '@/theme';
import { styles } from './DraggableMap.styles';

type Props = {
  point: GeoPoint;
  onChange: (point: GeoPoint) => void;
  /** Pin tint; defaults to the BoardPoint primary. */
  accentColor?: string;
  title?: string;
  description?: string;
};

const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = 0.02;
/** If the map has not signalled it is ready by then, show the error state. */
const LOAD_TIMEOUT_MS = 12000;

type LoadState = 'loading' | 'ready' | 'error';

export function DraggableMap({
  point,
  onChange,
  accentColor = colors.primary,
  title = 'Search point',
  description = 'Drag to move your room search point',
}: Props) {
  const mapRef = useRef<MapView>(null);
  const lastDragged = useRef<GeoPoint | null>(null);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const latitude = point.latitude;
  const longitude = point.longitude;

  useEffect(() => {
    const dragged = lastDragged.current;
    if (dragged && dragged.latitude === latitude && dragged.longitude === longitude) return;
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: LATITUDE_DELTA, longitudeDelta: LONGITUDE_DELTA },
      350
    );
  }, [latitude, longitude]);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [attempt]);

  const retry = () => {
    setReady(false);
    setTimedOut(false);
    setAttempt((value) => value + 1);
  };

  const status: LoadState = ready ? 'ready' : timedOut ? 'error' : 'loading';

  return (
    <View style={styles.container}>
      <MapView
        key={attempt}
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={false}
        onMapReady={() => setReady(true)}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          pinColor={accentColor}
          anchor={{ x: 0.5, y: 1 }}
          title={title}
          description={description}
          onDragEnd={(event) => {
            const coordinate = event.nativeEvent.coordinate;
            const next = { latitude: coordinate.latitude, longitude: coordinate.longitude };
            lastDragged.current = next;
            onChange(next);
          }}
        />
      </MapView>

      {status !== 'ready' ? (
        <MapOverlay
          status={status === 'error' ? 'error' : 'loading'}
          onRetry={retry}
          message="Check your connection, then try again. You can still enter coordinates below."
        />
      ) : null}
    </View>
  );
}
