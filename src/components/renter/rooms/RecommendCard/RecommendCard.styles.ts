import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardFeatured: {
    borderWidth: 2,
    borderColor: '#C9A227',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  media: {
    height: 130,
    backgroundColor: colors.peach,
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
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  specialText: {
    fontFamily: fonts.bold,
    fontSize: 10,
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  rent: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  perMonth: {
    marginLeft: 3,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
});