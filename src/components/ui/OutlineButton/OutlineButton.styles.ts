import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  buttonPressed: {
    backgroundColor: colors.peach,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.primary,
    letterSpacing: 0.2,
  },
});
