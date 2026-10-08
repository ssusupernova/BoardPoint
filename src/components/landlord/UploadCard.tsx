import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { radii, spacing } from '@/theme';
import { landlordColors } from '@/theme/landlord';

type Props = {
  accessibilityLabel: string;
  onPress?: () => void;
};

export function UploadCard({ accessibilityLabel, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-upload-outline" size={30} color={landlordColors.iconStrong} />
      </View>
      <Text style={styles.title}>Upload a photo</Text>
      <Text style={styles.hint}>Drag and drop photos here</Text>
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
