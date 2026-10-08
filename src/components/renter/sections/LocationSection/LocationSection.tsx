import {
  Pressable,
  Text,
  TextInput,
  View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { SelectField } from '@/components/renter/SelectField/SelectField';
import { DraggableMap } from '@/components/renter/DraggableMap/DraggableMap';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { RADIUS_OPTIONS,
  type ChecklistErrors,
  type ChecklistForm } from '@/services/checklist';
import { DEFAULT_MAP_POINT } from '@/services/geocode';
import { colors
} from '@/theme';
import { styles } from './LocationSection.styles';

type Props = {
  form: ChecklistForm;
  errors: ChecklistErrors;
  onPatch: (patch: Partial<ChecklistForm>) => void;
};

export function LocationSection({ form, errors, onPatch }: Props) {
  const { loading, error, getLocation } = useCurrentLocation();

  const handleUseLocation = async () => {
    const point = await getLocation();
    if (point) onPatch({ originPoint: point });
  };

  return (
    <View>
      <SectionHeader
        title="Location & radius"
        helper="Where you want to live. Rooms outside this radius are filtered out."
        tag="Required"
      />

      <Text style={styles.label}>Search origin</Text>
      <View style={[styles.field, errors.originLabel ? styles.fieldError : null]}>
        <Ionicons name="search-outline" size={18} color={colors.textDisabled} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={form.originLabel}
          onChangeText={(text) => onPatch({ originLabel: text })}
          placeholder="Area, campus, or workplace"
          placeholderTextColor={colors.textDisabled}
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel="Search origin"
        />
      </View>
      <FieldError error={errors.originLabel} />

      <Pressable
        onPress={() => void handleUseLocation()}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Use my current location"
        accessibilityState={{ disabled: loading, busy: loading }}
        style={({ pressed }) => [
          styles.locationButton,
          pressed && !loading && styles.locationButtonPressed,
          loading && styles.locationButtonDisabled,
        ]}
      >
        <Ionicons
          name={loading ? 'refresh-outline' : 'navigate-outline'}
          size={17}
          color={colors.primary}
        />
        <Text style={styles.locationLabel}>
          {loading ? 'Getting your location…' : 'Use my current location'}
        </Text>
      </Pressable>
      <FieldError error={error} />

      <View style={styles.mapWrap}>
        <DraggableMap
          point={form.originPoint ?? DEFAULT_MAP_POINT}
          onChange={(point) => onPatch({ originPoint: point })}
        />
      </View>
      <Text style={styles.hint}>Drag the pin to fine-tune the spot distances are measured from.</Text>

      <View style={styles.radiusWrap}>
        <SelectField
          label="Search radius"
          value={form.radiusKm}
          options={RADIUS_OPTIONS}
          placeholder="Choose a radius"
          onSelect={(value) => onPatch({ radiusKm: value })}
          error={errors.radiusKm}
        />
      </View>
    </View>
  );
}

