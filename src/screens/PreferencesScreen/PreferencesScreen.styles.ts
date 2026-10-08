import { StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts, screenScaffold } from '@/theme';

export const styles = StyleSheet.create({
  ...screenScaffold,
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  badgeWrap: {
    marginTop: spacing.lg,
  },
  brandWrap: {
    marginTop: spacing.lg,
  },
  heroTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 27,
    lineHeight: 34,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: spacing.lg,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
  },
  previewLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1.4,
    marginTop: spacing.xl,
  },
  previewCard: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewPrimary: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textPrimary,
  },
  previewSecondary: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 4,
  },
  submitWrap: {
    marginTop: spacing.xl,
  },
});
