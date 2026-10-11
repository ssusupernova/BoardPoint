import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  list: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    marginLeft: spacing.md,
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  price: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  matchPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.selectedBg,
  },
  matchText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.badgeText,
  },
});
