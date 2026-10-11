import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
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
