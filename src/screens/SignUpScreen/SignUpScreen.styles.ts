import { StyleSheet } from 'react-native';
import { colors, radii, spacing, screenScaffold } from '@/theme';

export const styles = StyleSheet.create({
  ...screenScaffold,
  roleBadgeRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: '#E8DCCC',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleBadgeChange: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  welcome: {
    marginTop: spacing.md,
  },
  fields: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
});
