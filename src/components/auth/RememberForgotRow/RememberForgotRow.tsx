import {
  Pressable,
  Text,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './RememberForgotRow.styles';

type Props = {
  rememberMe: boolean;
  onToggleRemember: () => void;
  onForgotPassword: () => void;
};

export function RememberForgotRow({ rememberMe, onToggleRemember, onForgotPassword }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleRemember}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityLabel="Remember me"
        accessibilityState={{ checked: rememberMe }}
        style={styles.remember}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe ? (
            <Ionicons name="checkmark" size={14} color={colors.onPrimary} />
          ) : null}
        </View>
        <Text style={styles.rememberText}>Remember me</Text>
      </Pressable>

      <Pressable
        onPress={onForgotPassword}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel="Forgot password"
      >
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>
    </View>
  );
}

