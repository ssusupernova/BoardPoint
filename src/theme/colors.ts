/**
 * Global BoardPoint palette.
 *
 * Single source of truth for the warm cream / terracotta design language.
 * Screens and components must reference these tokens rather than raw hex so a
 * palette change rolls out everywhere at once.
 */
export const colors = {
  background: '#F8F3EB',
  surface: '#FFFEFC',
  card: '#FFFEFC',
  surfacePressed: '#F5E6D5',
  peach: '#FCEBD8',
  beige: '#F5E6D5',
  primary: '#A85F3C',
  primaryPressed: '#8F4E30',
  onPrimary: '#FFFFFF',
  darkBrown: '#503A2D',
  textPrimary: '#45372E',
  textSecondary: '#9A8779',
  muted: '#9A8779',
  textDisabled: '#C4B5A8',
  border: '#EDE0D2',
  borderStrong: '#E0CFBC',
  decorativeCircle: '#D9E4F0',
  error: '#B0433A',
  errorBg: '#FBEEEA',
  google: '#4285F4',
  infoBg: '#E6F0FA',
  infoText: '#4A6F94',
  badgeBg: '#FCEBD8',
  badgeText: '#A85F3C',
  selectedBg: '#FCEBD8',
  selectedBorder: '#A85F3C',
  successBg: '#E8F0E4',
  successText: '#647C59',
  warningBg: '#FCEBD8',
  warningText: '#A85F3C',
} as const;
