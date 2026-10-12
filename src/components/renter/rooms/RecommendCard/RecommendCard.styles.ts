import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

<<<<<<< HEAD
export const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
=======
/**
 * Gold accent for promoted ("SPECIAL") listings. Scoped to this component so
 * the shared palette stays untouched.
 */
export const featuredGold = '#B8860B';
export const featuredGoldBg = '#FBF3DA';
export const featuredGoldBorder = '#E4C97A';

export const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
>>>>>>> momay
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardFeatured: {
<<<<<<< HEAD
    borderWidth: 2,
    borderColor: '#C9A227',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
=======
    borderColor: featuredGoldBorder,
    borderWidth: 2,
>>>>>>> momay
  },
  media: {
    height: 130,
    backgroundColor: colors.peach,
<<<<<<< HEAD
=======
    justifyContent: 'center',
    alignItems: 'center',
>>>>>>> momay
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  special: {
    position: 'absolute',
<<<<<<< HEAD
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: radii.full,
    paddingHorizontal: 10,
=======
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: featuredGoldBg,
    borderWidth: 1,
    borderColor: featuredGoldBorder,
    borderRadius: radii.full,
    paddingHorizontal: 9,
>>>>>>> momay
    paddingVertical: 4,
  },
  specialText: {
    fontFamily: fonts.bold,
    fontSize: 10,
<<<<<<< HEAD
    letterSpacing: 1,
    color: colors.onPrimary,
  },
  categoryChip: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...shadows.subtle,
  },
  categoryChipText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.textPrimary,
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colors.textPrimary,
=======
    letterSpacing: 0.6,
    color: featuredGold,
  },
  favorite: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  favoritePressed: {
    opacity: 0.7,
  },
  matchPill: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.selectedBg,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: -0.2,
>>>>>>> momay
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
<<<<<<< HEAD
=======
    marginTop: 4,
>>>>>>> momay
  },
  location: {
    flex: 1,
    fontFamily: fonts.regular,
<<<<<<< HEAD
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
=======
    fontSize: 12,
    color: colors.textSecondary,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    minHeight: 24,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.beige,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  highlightText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.darkBrown,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
>>>>>>> momay
  },
  rent: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  perMonth: {
    marginLeft: 3,
<<<<<<< HEAD
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
});
=======
    marginBottom: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
>>>>>>> momay
