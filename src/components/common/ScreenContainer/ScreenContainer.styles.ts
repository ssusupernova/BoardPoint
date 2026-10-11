import { StyleSheet } from 'react-native';
import { colors, layout } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  inner: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
});
