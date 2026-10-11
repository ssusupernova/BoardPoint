import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  list: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowSelected: {
    borderColor: colors.selectedBorder,
    backgroundColor: colors.selectedBg,
  },
  rowPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
  },
  provider: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  account: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  note: {
    marginTop: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
});
