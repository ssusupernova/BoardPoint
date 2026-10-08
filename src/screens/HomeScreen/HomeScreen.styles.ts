import { StyleSheet } from 'react-native';
import { colors, spacing, radii, screenScaffold } from '@/theme';

export const styles = StyleSheet.create({
  ...screenScaffold,
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: -spacing.xs,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.4,
  },
  preferencesCta: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    gap: spacing.md,
  },
  preferencesCtaPressed: {
    backgroundColor: colors.primaryPressed,
  },
  preferencesIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferencesCopy: {
    flex: 1,
    flexShrink: 1,
  },
  preferencesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  preferencesDetail: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  highlights: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCopy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  highlightDetail: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountKey: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
});
