import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DraggableMap } from '@/components/renter/DraggableMap/DraggableMap';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import type { GeoPoint } from '@/services/geocode';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

type Props = {
  point: GeoPoint;
  /** Called when the pin is dragged or "Use current location" resolves. */
  onChange: (point: GeoPoint) => void;
  error?: string;
  /** Pin tint — defaults to the landlord primary (#BF7E4A). */
  accentColor?: string;
};

/** Draggable map for pinning a property, with a use-current-location shortcut. */
export function PropertyMapPicker({ point, onChange, error, accentColor = LANDLORD_THEME.primary }: Props) {
  const { loading, error: locationError, getLocation } = useCurrentLocation();

  const handleUseCurrentLocation = async () => {
    const next = await getLocation();
    if (next) onChange(next);
  };

  return (
    <View style={styles.container}>
      <DraggableMap
        point={point}
        onChange={onChange}
        accentColor={accentColor}
        title="Property location"
        description="Drag to set the exact property location"
      />

      <View style={styles.footer}>
        <View style={styles.coords}>
          <Ionicons name="location-outline" size={14} color={LANDLORD_THEME.primaryDark} />
          <Text style={styles.coordsText}>
            {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
          </Text>
        </View>
        <Pressable
          onPress={() => void handleUseCurrentLocation()}
          disabled={loading}
          style={({ pressed }) => [styles.locateButton, pressed && styles.locateButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          <Ionicons
            name={loading ? 'time-outline' : 'navigate-outline'}
            size={14}
            color={LANDLORD_THEME.primaryDark}
          />
          <Text style={styles.locateButtonText}>
            {loading ? 'Locating…' : 'Use current location'}
          </Text>
        </Pressable>
      </View>

      {locationError ? <FieldError error={locationError} /> : null}
      <FieldError error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  coords: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  locateButtonPressed: {
    opacity: 0.75,
  },
  locateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
});
