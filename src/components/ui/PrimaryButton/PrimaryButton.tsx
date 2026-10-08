import {
  ActivityIndicator,
  Pressable,
  Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './PrimaryButton.styles';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} style={styles.arrow} />
        </>
      )}
    </Pressable>
  );
}

