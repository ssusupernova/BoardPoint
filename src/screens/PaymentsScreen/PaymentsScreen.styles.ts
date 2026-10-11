import { StyleSheet } from 'react-native';
import { card, cardSoft, colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  billCard: {
    marginTop: spacing.lg,
    ...card,
  },
  billHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  billPeriod: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  billTotal: {
    marginTop: spacing.md,
    fontFamily: fonts.extrabold,
    fontSize: 34,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  billNote: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dueText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  panel: {
    ...cardSoft,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 10,
  },
  billCopy: {
    flex: 1,
    flexShrink: 1,
  },
  billLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  billMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  billAmount: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  footnote: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  methodCopy: {
    flex: 1,
    flexShrink: 1,
  },
  methodProvider: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  methodAccount: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  payAction: {
    marginTop: spacing.lg,
  },
  methodNote: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyFootnote: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
