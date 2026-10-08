import {
  ActivityIndicator,
  Pressable,
  Text
} from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { colors
} from '@/theme';
import { styles } from './GoogleLoginButton.styles';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GoogleLoginButton({ onPress, loading = false, disabled = false }: Props) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <>
          <FontAwesome6 name="google" size={18} color={colors.google} style={styles.icon} />
          <Text style={styles.label}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

