import { StyleSheet } from 'react-native';
import { colors, radii } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
