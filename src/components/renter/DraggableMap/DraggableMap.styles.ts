import { StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/theme';

/** Pixel size of one map tile; also used by the web tile renderer. */
export const TILE_SIZE = 256;

export const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surfacePressed,
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  pin: {
    position: 'absolute',
    width: 36,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attribution: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
