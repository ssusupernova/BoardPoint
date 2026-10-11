import { StyleSheet } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.subtle,
  },
  cardUnread: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beige,
  },
  iconWrapUnread: {
    backgroundColor: colors.peach,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timestamp: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  description: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.primary,
  },
});
