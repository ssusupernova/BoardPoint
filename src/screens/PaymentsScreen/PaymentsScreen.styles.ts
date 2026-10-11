import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.subtle,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    flex: 1,
  },
  methodLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  methodDetail: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
