import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  eyebrow: {
    marginTop: spacing.xl,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  date: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  welcome: {
    marginTop: spacing.sm,
    fontFamily: fonts.extrabold,
    fontSize: 27,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  maintenanceAction: {
    marginTop: spacing.md,
  },
});
