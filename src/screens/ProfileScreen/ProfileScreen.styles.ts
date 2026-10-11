import { StyleSheet } from 'react-native';
import { card, colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  name: {
    marginTop: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  verifyBadge: {
    marginTop: spacing.sm,
  },
  memberSince: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  panel: {
    ...card,
    paddingVertical: spacing.sm,
  },
  tenancyName: {
    paddingTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  tenancyUnit: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  renewal: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.peach,
    padding: spacing.md,
  },
  renewalTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  renewalText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  signOut: {
    marginTop: spacing.xl,
  },
});
