import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  unreadBadge: {
    borderRadius: radii.full,
    backgroundColor: colors.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  unreadText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.warningText,
  },
  markAll: {
    paddingVertical: 2,
  },
  markAllPressed: {
    opacity: 0.6,
  },
  markAllText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.primary,
  },
  filters: {
    marginTop: spacing.lg,
  },
  group: {
    marginTop: spacing.xl,
  },
  groupLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textSecondary,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.xl,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
