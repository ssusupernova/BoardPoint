import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
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
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.peach,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.error,
  },
  submit: {
    marginTop: spacing.sm,
  },
  photoPicker: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  photoPickerPressed: {
    backgroundColor: colors.surfacePressed,
  },
  photoPickerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  photoPickerText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  photoPickerHint: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  photoWrap: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
  },
  photoRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(69, 55, 46, 0.72)',
  },
  photoRemovePressed: {
    opacity: 0.7,
  },
});
