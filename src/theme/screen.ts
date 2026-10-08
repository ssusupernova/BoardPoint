import { colors } from './colors';

/**
 * Shared screen scaffolding: root container, flex filler, decorative circle,
 * centered scroll content, and the 440px-max inner column. Every full-screen
 * route spreads this into its own StyleSheet.create so keys stay the same.
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
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%' as const,
    maxWidth: 440,
    alignSelf: 'center' as const,
  },
};
