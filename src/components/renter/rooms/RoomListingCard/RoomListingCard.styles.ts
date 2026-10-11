import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  media: {
    height: 150,
    backgroundColor: colors.peach,
    justifyContent: 'center',
    alignItems: 'center',
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
  availability: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...shadows.subtle,
  },
  availabilityText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  favorite: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    ...shadows.subtle,
  },
  favoritePressed: {
    opacity: 0.7,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  details: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  location: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  rent: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  perMonth: {
    marginLeft: 3,
    marginBottom: 3,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
  },
  amenities: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  distance: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  action: {
    marginTop: spacing.lg,
  },
});
