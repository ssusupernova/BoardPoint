import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    alignItems: 'center',
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card,
  },
  name: {
    marginTop: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  username: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  badgeWrap: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  panel: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountCopy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  accountValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  accountKey: {
    marginTop: 1,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  linkPressed: {
    backgroundColor: colors.surfacePressed,
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  signOut: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  signOutPressed: {
    backgroundColor: colors.surfacePressed,
  },
  signOutDisabled: {
    opacity: 0.55,
  },
  signOutLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
});
