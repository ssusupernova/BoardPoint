import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heading: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  property: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: spacing.md,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
