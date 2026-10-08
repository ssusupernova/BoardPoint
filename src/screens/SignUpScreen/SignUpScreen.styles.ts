import { StyleSheet } from 'react-native';
import { spacing, screenScaffold } from '@/theme';

export const styles = StyleSheet.create({
  ...screenScaffold,
  welcome: {
    marginTop: spacing.xxl,
  },
  fields: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
});
