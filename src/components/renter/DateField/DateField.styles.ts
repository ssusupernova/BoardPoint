import { StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '@/theme';

export const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldError: {
    borderColor: colors.error,
  },
  fieldPressed: {
    backgroundColor: colors.surfacePressed,
  },
  value: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: 8,
  },
  placeholder: {
    color: colors.textDisabled,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    marginTop: 6,
    lineHeight: 18,
  },
});
