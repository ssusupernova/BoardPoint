import type { ComponentProps } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './LoginInput.styles';

type Props = TextInputProps & {
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function LoginInput({ label, icon = 'mail-outline', ...rest }: Props) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons name={icon} size={18} color={colors.textDisabled} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textDisabled}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
      </View>
    </View>
  );
}

