import { StyleSheet } from 'react-native';
import { cardSoft, colors, fonts, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    ...cardSoft,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCopy: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  updated: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  detail: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
  photo: {
    marginTop: spacing.md,
    width: '100%',
    height: 160,
    borderRadius: radii.md,
  },
});
