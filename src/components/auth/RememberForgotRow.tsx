import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';

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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  forgot: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});