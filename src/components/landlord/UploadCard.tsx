import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { landlordColors, radii, spacing } from '@/theme';

type Props = {
  accessibilityLabel: string;
  onPress?: () => void;
  /** Local URI of the picked document; renders a preview when present. */
  imageUri?: string;
};

export function UploadCard({ accessibilityLabel, onPress, imageUri }: Props) {
  const hasImage = Boolean(imageUri);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: hasImage }}
      style={({ pressed }) => [
        styles.card,
        hasImage && styles.cardFilled,
        pressed && styles.cardPressed,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={styles.iconWrap}>
          <Ionicons name="cloud-upload-outline" size={30} color={landlordColors.iconStrong} />
        </View>
      )}
      <Text style={styles.title}>{hasImage ? 'Photo attached' : 'Upload a photo'}</Text>
      <Text style={styles.hint}>{hasImage ? 'Tap to replace' : 'Drag and drop photos here'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 168,
    borderRadius: radii.lg,
    backgroundColor: landlordColors.surface,
    borderWidth: 1,
    borderColor: landlordColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  cardPressed: {
    backgroundColor: landlordColors.surfacePressed,
  },
  cardFilled: {
    borderColor: landlordColors.primary,
  },
  preview: {
    width: '100%',
    height: 96,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.md,
    fontSize: 15,
    fontWeight: '700',
    color: landlordColors.textPrimary,
    letterSpacing: 0.1,
  },
  hint: {
    marginTop: 4,
    fontSize: 12.5,
    color: landlordColors.textSecondary,
  },
});
