import {
  Text,
  TextInput,
  View,
  type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { formatNumber } from '@/utils/date';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { styles } from './MoneyInput.styles';

type Props = {
  label: string;
  /** Raw digits as typed; formatting is display-only. */
  value: string;
  onChangeText: (digits: string) => void;
  placeholder?: string;
  error?: string;
};

export function MoneyInput({ label, value, onChangeText, placeholder = '0', error }: Props) {
  const handle: TextInputProps['onChangeText'] = (text) => {
    onChangeText(text.replace(/[^0-9]/g, ''));
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <Text style={styles.peso}>₱</Text>
        <TextInput
          style={styles.input}
          value={formatNumber(value)}
          onChangeText={handle}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          keyboardType="number-pad"
          inputMode="numeric"
          accessibilityLabel={label}
        />
        <Ionicons name="cash-outline" size={18} color={colors.textDisabled} />
      </View>
      <FieldError error={error} />
    </View>
  );
}

