import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

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
    paddingHorizontal: 20,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
});
