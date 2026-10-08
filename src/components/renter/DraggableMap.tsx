import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GeoPoint } from '@/services/geocode';
import { colors, radii } from '@/theme';

type Props = {
  point: GeoPoint;
  onChange: (point: GeoPoint) => void;
};

const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = 0.02;

export function DraggableMap({ point, onChange }: Props) {
  const mapRef = useRef<MapView>(null);
  const lastDragged = useRef<GeoPoint | null>(null);

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          pinColor={colors.primary}
          anchor={{ x: 0.5, y: 1 }}
          title="Search point"
          description="Drag to move your room search point"
          onDragEnd={(event) => {
            const coordinate = event.nativeEvent.coordinate;
            const next = { latitude: coordinate.latitude, longitude: coordinate.longitude };
            lastDragged.current = next;
            onChange(next);
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surfacePressed,
  },
});
