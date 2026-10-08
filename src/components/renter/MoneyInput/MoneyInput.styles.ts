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
  peso: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
    marginRight: 8,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    marginTop: 6,
    lineHeight: 18,
  },
});
