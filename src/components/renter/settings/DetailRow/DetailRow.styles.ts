import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: 10,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  value: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
