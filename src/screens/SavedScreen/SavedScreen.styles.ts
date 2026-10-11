import { StyleSheet } from 'react-native';
import { card, cardSoft, colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  count: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.primary,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  empty: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...cardSoft,
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    marginTop: spacing.xl,
    ...card,
  },
  footerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  footerText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  footerAction: {
    marginTop: spacing.md,
  },
});
