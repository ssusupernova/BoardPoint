import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  readonly: {
    borderRadius: radii.md,
    backgroundColor: colors.surfacePressed,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  readonlyLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  readonlyValue: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  label: {
    marginBottom: 8,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  submit: {
    marginTop: spacing.sm,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
});
