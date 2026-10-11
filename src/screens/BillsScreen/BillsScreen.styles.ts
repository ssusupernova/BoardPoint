import { StyleSheet } from 'react-native';
import { card as cardToken, colors, fonts, radii, spacing, uppercaseLabel } from '@/theme';

export const styles = StyleSheet.create({
  billCard: {
    marginTop: spacing.xl,
    ...cardToken,
  },
  billHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billLabel: {
    ...uppercaseLabel,
  },
  billAmount: {
    marginTop: spacing.md,
    fontFamily: fonts.extrabold,
    fontSize: 34,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  billMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  note: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.infoBg,
    padding: spacing.md,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.infoText,
  },
  section: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
});
