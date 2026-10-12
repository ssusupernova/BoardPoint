import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PROPERTY_AMENITIES } from '@/services/landlordData';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

type Props = {
  selected: string[];
  onToggle: (amenity: string) => void;
  /** Choices to render; defaults to the property amenity list. */
  options?: readonly string[];
};

/** Toggle chips for amenities, furnishings, or any string list. */
export function AmenityPicker({ selected, onToggle, options = PROPERTY_AMENITIES }: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((amenity) => {
        const isSelected = selected.includes(amenity);
        return (
          <Pressable
            key={amenity}
            onPress={() => onToggle(amenity)}
            style={[styles.chip, isSelected ? styles.chipSelected : null]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={amenity}
          >
            <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
              {amenity}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  chipSelected: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
  },
  chipTextSelected: {
    color: LANDLORD_THEME.badgePeachText,
  },
});
