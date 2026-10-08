import {
  Text,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors
} from '@/theme';
import { styles } from './BrandHeader.styles';

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logo} accessibilityElementsHidden>
        <Ionicons name="location" size={26} color={colors.onPrimary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.brand} numberOfLines={1}>
          BoardPoint
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          RENTAL OPERATIONS, MAPPED
        </Text>
      </View>
    </View>
  );
}

