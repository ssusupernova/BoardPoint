import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { landlordColors } from '@/theme/landlord';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function SubmitButton({ onPress, disabled = false, loading = false }: Props) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Submit your listing for verification"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={landlordColors.onPrimary} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.label}>Submit for Verification</Text>
          <Ionicons name="arrow-forward" size={18} color={landlordColors.onPrimary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 10,
    backgroundColor: landlordColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#7C4E23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: landlordColors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: landlordColors.onPrimary,
    letterSpacing: 0.3,
  },
});
