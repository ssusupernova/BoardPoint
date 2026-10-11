import { StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  itemPressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 46,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.peach,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 13,
    color: colors.onPrimary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.1,
  },
  labelActive: {
    fontFamily: fonts.semibold,
  },
});
