import { StyleSheet } from 'react-native';
import { card as cardToken, colors, fonts, radii, spacing, uppercaseLabel } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    ...cardToken,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...uppercaseLabel,
  },
  amount: {
    marginTop: spacing.md,
    fontFamily: fonts.extrabold,
    fontSize: 34,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  action: {
    marginTop: spacing.lg,
  },
});
