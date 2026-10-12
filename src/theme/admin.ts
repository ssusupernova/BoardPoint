/**
 * BoardPoint admin palette.
 *
 * Every admin screen pulls its colours from here so the panel stays on
 * brand: brown-orange for primary actions, cream for highlighted sections,
 * off-white for cards and forms, light blue for informational elements and
 * dark brown for headings and readable text.
 */
export const adminColors = {
  /* surfaces */
  background: '#F9F3EA',
  surface: '#FFFDFA',
  surfacePressed: '#F5EADB',
  cream: '#FDECD8',
  creamDeep: '#F8DFC4',

  /* brand */
  primary: '#BF7E4A',
  primaryPressed: '#A96B3E',
  onPrimary: '#2F2016',

  /* informational */
  lightBlue: '#93C5E2',
  lightBlueSoft: '#E7F2F9',
  infoText: '#2C6E93',

  /* text */
  darkBrown: '#4A3425',
  textPrimary: '#4A3425',
  textSecondary: '#7C6551',
  textMuted: '#9C8A78',
  textOnPrimary: '#2F2016',
  textInverse: '#FFFDFA',

  /* lines + elevation */
  border: '#EADCC9',
  borderStrong: '#D9C6AE',
  shadow: '#4A3425',

  /* semantic */
  success: '#3F7A52',
  successBg: '#E7F1EA',
  warning: '#8A5B12',
  warningBg: '#FBEED6',
  danger: '#B0433A',
  dangerBg: '#FBEEEA',
  neutral: '#6B5A4B',
  neutralBg: '#F0E7DC',

  overlay: 'rgba(43, 29, 19, 0.48)',
} as const;

export type AdminTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export const toneStyles: Record<
  AdminTone,
  { background: string; foreground: string; border: string }
> = {
  neutral: { background: adminColors.neutralBg, foreground: adminColors.neutral, border: '#E3D6C6' },
  primary: { background: adminColors.cream, foreground: adminColors.darkBrown, border: '#EBCBA8' },
  info: { background: adminColors.lightBlueSoft, foreground: adminColors.infoText, border: '#C4E0EF' },
  success: { background: adminColors.successBg, foreground: adminColors.success, border: '#CBDFD3' },
  warning: { background: adminColors.warningBg, foreground: adminColors.warning, border: '#EBD9AE' },
  danger: { background: adminColors.dangerBg, foreground: adminColors.danger, border: '#EFCFC9' },
};

export const adminRadii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const adminType = {
  display: 26,
  title: 21,
  heading: 17,
  subheading: 15,
  body: 14,
  small: 12.5,
  tiny: 11,
} as const;

/** Soft, palette-tinted elevation for cards. */
export const cardShadow = {
  shadowColor: adminColors.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 2,
} as const;

/** Currency used for listing prices across the platform. */
export const currency = { code: 'PHP', symbol: '₱' } as const;
