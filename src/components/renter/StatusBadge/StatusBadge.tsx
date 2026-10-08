import {
  Text,
  View
} from 'react-native';

import { styles } from './StatusBadge.styles';

type Props = {
  text: string;
};

export function StatusBadge({ text }: Props) {
  return (
    <View style={styles.badge} accessibilityRole="text">
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

