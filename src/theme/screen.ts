import { colors } from './colors';
import { layout } from './layout';

/**
 * Shared screen scaffolding: root container, flex filler, decorative circle,
 * centered scroll content, and the max-width inner column. Every full-screen
 * auth/welcome route spreads this into its own StyleSheet.create so keys stay
 * the same. Metrics live in `theme/layout`.
 */
export const screenScaffold = {
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  decorativeCircle: {
    position: 'absolute' as const,
    top: -120,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.decorativeCircle,
    pointerEvents: 'none' as const,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.authPaddingHorizontal,
  },
  inner: {
    width: '100%' as const,
    maxWidth: layout.authMaxWidth,
    alignSelf: 'center' as const,
  },
};
