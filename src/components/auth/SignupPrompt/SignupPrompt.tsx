import {
  Pressable,
  Text,
  View
} from 'react-native';

import { styles } from './SignupPrompt.styles';

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


