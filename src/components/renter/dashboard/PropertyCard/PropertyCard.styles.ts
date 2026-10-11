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
    height: 168,
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
    gap: 6,
  },
  placeholderText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.primary,
  },
  badgeWrap: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  body: {
    padding: spacing.lg,
    gap: 4,
  },
  property: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  unit: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.xs,
  },
  address: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  rent: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  perMonth: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 3,
    marginBottom: 3,
  },
});
