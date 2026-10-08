import {
  useState } from 'react';
import { Pressable,
  Text,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { CalendarModal } from '@/components/renter/CalendarModal/CalendarModal';
import { formatDisplayDate } from '@/utils/date';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { styles } from './DateField.styles';

type Props = {
  label: string;
  /** Selected ISO date (yyyy-mm-dd), or null. */
  value: string | null;
  onChange: (iso: string) => void;
  error?: string;
};

export function DateField({ label, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const display = formatDisplayDate(value);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${display || 'not chosen'}`}
        style={({ pressed }) => [
          styles.field,
          error ? styles.fieldError : null,
          pressed && styles.fieldPressed,
        ]}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ? display : 'Choose a date'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </Pressable>
      <FieldError error={error} />

      <CalendarModal
        visible={open}
        value={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

