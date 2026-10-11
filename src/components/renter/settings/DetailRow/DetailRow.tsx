import { Text, View } from 'react-native';
import { styles } from './DetailRow.styles';

type Props = {
  label: string;
  value: string;
};

/** Label/value row used on profile and payment detail lists. */
export function DetailRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
