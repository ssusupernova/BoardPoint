import { StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/theme';

export const styles = StyleSheet.create({
<<<<<<< HEAD
  section: {
    marginTop: spacing.xl,
  },
  headRow: {
=======
  container: {
    marginTop: spacing.lg,
  },
  header: {
>>>>>>> momay
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
<<<<<<< HEAD
    marginHorizontal: spacing.md,
  },
  categoryLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 0.2,
    color: colors.textPrimary,
=======
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
>>>>>>> momay
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
=======
    gap: 3,
>>>>>>> momay
  },
  seeAllPressed: {
    opacity: 0.6,
  },
  seeAllText: {
    fontFamily: fonts.semibold,
<<<<<<< HEAD
    fontSize: 12.5,
    color: colors.primary,
  },
  carousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
});
=======
    fontSize: 13,
    color: colors.primary,
  },
  listContent: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
});
>>>>>>> momay
