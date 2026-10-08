import {
  Text,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './ErrorBanner.styles';

type Props = {
  message: string;
};

export function ErrorBanner({ message }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={16} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}


