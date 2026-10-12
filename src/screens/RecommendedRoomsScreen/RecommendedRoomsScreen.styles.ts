import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  lede: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  empty: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.xl,
  },
  footer: {
    height: spacing.xxl,
  },
});