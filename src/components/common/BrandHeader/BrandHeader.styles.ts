import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  logo: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  brand: {
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  trailing: {
    marginLeft: 'auto',
    paddingLeft: spacing.md,
  },
});
