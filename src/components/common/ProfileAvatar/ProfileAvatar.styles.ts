import { StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';

export const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.peach,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
