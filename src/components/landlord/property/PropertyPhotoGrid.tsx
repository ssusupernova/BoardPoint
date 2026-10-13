import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

type Props = {
  photos: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
  error?: string;
};

/** Thumbnail grid for property photos with add / remove actions. */
export function PropertyPhotoGrid({ photos, onAdd, onRemove, error }: Props) {
  return (
    <View>
      <View style={styles.grid}>
        {photos.map((uri) => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} contentFit="cover" transition={150} />
            <Pressable
              onPress={() => onRemove(uri)}
              hitSlop={6}
              style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="close" size={13} color={LANDLORD_THEME.onPrimary} />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add property photo"
        >
          <Ionicons name="camera-outline" size={22} color={LANDLORD_THEME.primaryDark} />
          <Text style={styles.addText}>Add photo</Text>
        </Pressable>
      </View>
      <FieldError error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.borderSubtle,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  addButton: {
    width: 92,
    height: 92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: LANDLORD_THEME.primary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addButtonPressed: {
    opacity: 0.75,
  },
  addText: {
    fontSize: 10,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
});
