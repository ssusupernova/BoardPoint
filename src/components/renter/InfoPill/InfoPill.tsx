import {
  Text,
  View
} from 'react-native';

import { styles } from './InfoPill.styles';

type Props = {
  text: string;
};

export function InfoPill({ text }: Props) {
  return (
    <View style={styles.pill} accessibilityRole="text">
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

