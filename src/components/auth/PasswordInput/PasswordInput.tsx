import {
  useState } from 'react';
import { Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './PasswordInput.styles';

type Props = TextInputProps & {
  label: string;
};

export function PasswordInput({ label, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible((v) => !v);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons name="lock-closed" size={18} color={colors.textDisabled} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          {...rest}
        />
        <Pressable
          onPress={toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityState={{ selected: visible }}
        >
          <Ionicons name={visible ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

