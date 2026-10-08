import {
  Text
} from 'react-native';

import { styles } from './FieldError.styles';

type Props = {
  error?: string | null;
};

export function FieldError({ error }: Props) {
  if (!error) return null;
  return <Text style={styles.error}>{error}</Text>;
}

