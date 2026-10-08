import { StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
  arrow: {
    position: 'absolute',
    right: spacing.lg,
  },
});
