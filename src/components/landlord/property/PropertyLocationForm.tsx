import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PropertyMapPicker } from './PropertyMapPicker';
import { AddressSearchField } from './AddressSearchField';
import { geocodeProvider, geocodingConfigured, type GeoPoint, type PlaceSuggestion } from '@/services/geocode';
import { LANDLORD_THEME } from '@/styles/landlord/styles';
import { propertyLocationFormStyles as styles } from './PropertyLocationForm.styles';

type Props = {
  address: string;
  onAddressChange: (text: string) => void;
  /** Saved pin. */
  point: GeoPoint;
  /** Pin moved (drag, GPS, or search) — becomes unconfirmed until confirmed. */
  onPointChange: (point: GeoPoint) => void;
  /** True when this exact pin has been confirmed and stored. */
  confirmed: boolean;
  /** Persist latitude/longitude for the current pin. */
  onConfirm: (point: GeoPoint) => void;
  addressError?: string;
  locationError?: string;
};

const REVERSE_DEBOUNCE_MS = 450;

/**
 * Property location form: searchable address, draggable pin, explicit
 * confirmation, and a human-readable address preview.
 *
 * The parent owns the coordinates — every pin move reports `onPointChange`
 * (which unconfirms the location) and only `onConfirm` marks the coordinates
 * as saved, so publishing can require a confirmed location.
 */
export function PropertyLocationForm({
  address,
  onAddressChange,
  point,
  onPointChange,
  confirmed,
  onConfirm,
  addressError,
  locationError,
}: Props) {
  const [preview, setPreview] = useState('');
  const [checking, setChecking] = useState(false);
  const requestIdRef = useRef(0);

  const fallbackLabel = address.trim() || 'Pinned location';

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setChecking(true);
      void (async () => {
        try {
          const label = await geocodeProvider.reverse(point);
          if (requestId !== requestIdRef.current) return;
          // Empty on failure: the render falls back to the typed address,
          // which stays current as the landlord types.
          setPreview(label.trim());
        } catch {
          if (requestId !== requestIdRef.current) return;
          setPreview('');
        } finally {
          if (requestId === requestIdRef.current) setChecking(false);
        }
      })();
    }, REVERSE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // `fallbackLabel` intentionally excluded: typing the address updates the
    // preview directly without re-querying the geocoder.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.latitude, point.longitude]);

  const handleSelect = (suggestion: PlaceSuggestion) => {
    onPointChange(suggestion.point);
  };

  const handleConfirm = () => {
    onConfirm(point);
  };

  return (
    <View style={styles.container}>
      <AddressSearchField
        value={address}
        onChange={onAddressChange}
        onSelect={handleSelect}
        error={addressError}
      />

      <View style={styles.mapWrap}>
        <PropertyMapPicker point={point} onChange={onPointChange} />
      </View>

      <Text style={styles.hint}>
        Drag the pin to the exact property spot. Latitude and longitude are saved only when you
        confirm the location.
      </Text>

      {/* Human-readable preview of the pinned coordinate */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Ionicons name="navigate-outline" size={14} color={LANDLORD_THEME.primaryDark} />
          <Text style={styles.previewHeaderText}>Address preview</Text>
          {checking ? <Text style={styles.previewUpdating}>checking…</Text> : null}
        </View>
        <Text style={styles.previewText}>{preview || fallbackLabel}</Text>
        <View style={styles.coordsRow}>
          <Text style={styles.coordsText}>
            {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
          </Text>
          <View
            style={[
              styles.statusChip,
              confirmed ? styles.statusChipConfirmed : styles.statusChipPending,
            ]}
          >
            <Ionicons
              name={confirmed ? 'checkmark-circle' : 'ellipse-outline'}
              size={11}
              color={confirmed ? LANDLORD_THEME.badgeBlueText : LANDLORD_THEME.primaryDark}
            />
            <Text
              style={[
                styles.statusChipText,
                confirmed ? styles.statusChipTextConfirmed : styles.statusChipTextPending,
              ]}
            >
              {confirmed ? 'Confirmed' : 'Not confirmed'}
            </Text>
          </View>
        </View>
        {!geocodingConfigured ? (
          <Text style={styles.previewNote}>
            Live address lookup isn’t available, so the preview uses what you typed.
          </Text>
        ) : null}
      </View>

      {/* Explicit confirmation — coordinates are only saved here */}
      <Pressable
        onPress={handleConfirm}
        disabled={confirmed}
        style={({ pressed }) => [
          styles.confirmButton,
          confirmed && styles.confirmButtonDone,
          pressed && !confirmed && styles.confirmButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Confirm property location"
        accessibilityState={{ disabled: confirmed }}
      >
        <Ionicons
          name={confirmed ? 'checkmark-circle' : 'location'}
          size={17}
          color={LANDLORD_THEME.onPrimary}
        />
        <Text style={styles.confirmButtonText}>
          {confirmed ? 'Location Confirmed' : 'Confirm Location'}
        </Text>
      </Pressable>

      {locationError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {locationError}
        </Text>
      ) : null}
      {!confirmed ? (
        <Text style={styles.hint}>
          Confirm to save these coordinates — a listing can’t be published without a confirmed
          location.
        </Text>
      ) : null}

      <View style={styles.privacyNote}>
        <Ionicons name="lock-closed-outline" size={13} color={LANDLORD_THEME.textMuted} />
        <Text style={styles.privacyNoteText}>
          Your device location is optional and only used to drop this pin. BoardPoint asks for
          permission first and never shares it with renters or tenants.
        </Text>
      </View>
    </View>
  );
}
