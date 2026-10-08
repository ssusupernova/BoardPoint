import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { radii, spacing } from '@/theme';
import { landlordColors } from '@/theme/landlord';

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logo} accessibilityElementsHidden>
        <Ionicons name="location" size={22} color={landlordColors.onPrimary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.brand} numberOfLines={1}>
          BoardPoint
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          RENTAL OPERATIONS, MAPPED
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: landlordColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  brand: {
    fontSize: 25,
    fontWeight: '800',
    color: landlordColors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: landlordColors.textSecondary,
    letterSpacing: 1.4,
  },
});
