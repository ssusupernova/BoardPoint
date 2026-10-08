import { colors, spacing } from '@/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logo} accessibilityElementsHidden>
        <MaterialCommunityIcons
          name="home-map-marker"
          size={28}
          color={colors.onPrimary}
        />
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
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.4,
  },
});
