import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = {
  prompt?: string;
  actionLabel?: string;
  onAction: () => void;
  disabled?: boolean;
};

export function SignupPrompt({
  prompt = 'Don’t have an account yet?',
  actionLabel = 'Sign up',
  onAction,
  disabled = false,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{prompt}</Text>
      <Pressable
        onPress={onAction}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel={`${actionLabel} for a BoardPoint account`}
        accessibilityState={{ disabled }}
      >
        <Text style={styles.link}> {actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
