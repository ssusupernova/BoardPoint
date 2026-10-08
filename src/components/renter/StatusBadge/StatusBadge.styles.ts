import { StyleSheet } from 'react-native';
import { colors, radii, fonts } from '@/theme';

export const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.badgeBg,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.badgeText,
    letterSpacing: 0.2,
  },
});
