import { StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 14,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  cardUnchecked: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardChecked: {
    backgroundColor: colors.selectedBg,
    borderColor: colors.selectedBorder,
  },
  cardPressed: {
    opacity: 0.8,
  },
  label: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxUnchecked: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent',
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
