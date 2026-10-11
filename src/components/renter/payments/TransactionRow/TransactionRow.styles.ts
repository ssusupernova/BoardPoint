import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
  },
  period: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  breakdown: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.primary,
  },
});
