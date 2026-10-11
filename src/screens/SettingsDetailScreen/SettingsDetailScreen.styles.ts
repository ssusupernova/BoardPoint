import { StyleSheet } from 'react-native';
import { cardSoft, colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.xl,
    ...cardSoft,
    paddingVertical: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  toggleCopy: {
    flex: 1,
    flexShrink: 1,
  },
  toggleLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggleHelper: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  note: {
    marginTop: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
