import { StyleSheet } from 'react-native';
import { card, cardSoft, colors, fonts, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  missing: {
    marginTop: spacing.xl,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    marginTop: spacing.lg,
    alignItems: 'center',
    ...card,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successText,
    ...shadows.subtle,
  },
  badgeWrap: {
    marginTop: spacing.md,
  },
  amount: {
    marginTop: spacing.md,
    fontFamily: fonts.extrabold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  period: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  breakdown: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  panel: {
    marginTop: spacing.xl,
    ...cardSoft,
    paddingVertical: spacing.sm,
  },
  note: {
    marginTop: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
