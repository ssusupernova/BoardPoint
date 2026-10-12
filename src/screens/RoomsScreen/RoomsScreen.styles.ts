import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
    marginTop: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.selectedBg,
    borderColor: colors.selectedBorder,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  summary: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});
