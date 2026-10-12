import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingRight: 2,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  listContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
});
