import { StyleSheet } from 'react-native';
import { colors, spacing, fonts } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  actionPressed: {
    opacity: 0.6,
  },
  action: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
});
