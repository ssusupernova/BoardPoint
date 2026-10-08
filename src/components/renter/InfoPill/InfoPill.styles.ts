import { StyleSheet } from 'react-native';
import { colors, radii, fonts } from '@/theme';

export const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.infoBg,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.infoText,
    letterSpacing: 0.2,
  },
});
