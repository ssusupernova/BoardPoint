import {
  Text,
  View
} from 'react-native';

import { styles } from './SocialDivider.styles';

export function SocialDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>or continue with</Text>
      <View style={styles.line} />
    </View>
  );
}

