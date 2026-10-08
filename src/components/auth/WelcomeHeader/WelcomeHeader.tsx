import {
  Text,
  View
} from 'react-native';

import { styles } from './WelcomeHeader.styles';

type Props = {
  lines?: readonly [string, string];
  subtitle?: string;
};

export function WelcomeHeader({
  lines = ['Welcome Back.', 'Feel at Home.'],
  subtitle = 'Sign in to your BoardPoint account and pick up right where you left off.',
}: Props) {
  return (
    <View>
      <Text style={styles.title}>{lines[0]}</Text>
      <Text style={styles.title}>{lines[1]}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}


