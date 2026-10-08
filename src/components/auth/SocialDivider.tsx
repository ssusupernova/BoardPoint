import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';

export function SocialDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>or continue with</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  label: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    color: colors.textSecondary,
  },
});