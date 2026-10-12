import type { ViewStyle } from 'react-native';

/**
 * Soft elevation tokens for cards and raised surfaces. Uses the `boxShadow`
 * style (the deprecated `shadow*` keys are gone) plus Android `elevation`.
 */
export const shadows: Record<'card' | 'subtle', ViewStyle> = {
  card: {
    boxShadow: '0 6px 16px rgba(80, 58, 45, 0.06)',
    elevation: 3,
  },
  subtle: {
    boxShadow: '0 2px 8px rgba(80, 58, 45, 0.04)',
    elevation: 1,
  },
};
