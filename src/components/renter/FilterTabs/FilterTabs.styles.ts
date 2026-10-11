import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillPressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.onPrimary,
  },
});
