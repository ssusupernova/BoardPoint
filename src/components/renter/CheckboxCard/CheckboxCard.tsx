import {
  Pressable,
  Text,
  View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './CheckboxCard.styles';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function CheckboxCard({ label, checked, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.card,
        checked ? styles.cardChecked : styles.cardUnchecked,
        pressed && styles.cardPressed,
      ]}
    >
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxUnchecked]}>
        {checked ? <Ionicons name="checkmark" size={14} color={colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

