import type { ViewStyle } from 'react-native';

/**
 * Soft elevation tokens for cards and raised surfaces. The `shadow*` keys are
 * used on iOS/web and `elevation` on Android, so both are defined.
 */
export const shadows: Record<'card' | 'subtle', ViewStyle> = {
  card: {
    shadowColor: '#503A2D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  subtle: {
    shadowColor: '#503A2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
};
