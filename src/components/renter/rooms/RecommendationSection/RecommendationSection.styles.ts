import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  categoryLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.primary,
  },
  carousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
});