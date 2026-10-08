import { Pressable, StyleSheet, Text, View } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radii, spacing } from '@/theme';

export type UserRole = 'renter' | 'landlord';

interface RoleCardProps {
  role: UserRole;
  title: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function RoleCard({
  role,
  title,
  selected,
  onPress,
  accessibilityLabel,
}: RoleCardProps) {
  const isRenter = role === 'renter';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? `${title} role option`}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          {isRenter ? (
            <Octicons
              name="briefcase"
              size={22}
              color={selected ? colors.primary : colors.textPrimary}
            />
          ) : (
            <Ionicons
              name="home-outline"
              size={23}
              color={selected ? colors.primary : colors.textPrimary}
            />
          )}
        </View>

        <View
          style={[
            styles.radioCircle,
            selected ? styles.radioSelected : styles.radioUnselected,
          ]}
        />
      </View>

      <Text style={[styles.title, selected && styles.titleSelected]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 106,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  cardSelected: {
    backgroundColor: '#FAF0E4',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    shadowColor: '#422B1F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  radioSelected: {
    backgroundColor: colors.primary,
  },
  radioUnselected: {
    borderWidth: 1.5,
    borderColor: '#D4B89C',
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  titleSelected: {
    color: colors.textPrimary,
  },
});
