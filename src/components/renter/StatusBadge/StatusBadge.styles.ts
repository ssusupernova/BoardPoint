import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';
import type { StatusVariant } from '@/utils/status';

export const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

export const variantStyles: Record<StatusVariant, { bg: string; text: string }> = {
  neutral: { bg: colors.surfacePressed, text: colors.textSecondary },
  success: { bg: colors.successBg, text: colors.successText },
  warning: { bg: colors.warningBg, text: colors.warningText },
  info: { bg: colors.infoBg, text: colors.infoText },
};
