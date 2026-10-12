import { Pressable, Text } from 'react-native';
import { paymentStyles as pay } from '@/styles/landlord/payments.styles';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

/** Pill toggle used for property / period / status / method selectors. */
export function FilterChip({ label, active = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[pay.chip, active && pay.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[pay.chipText, active && pay.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
