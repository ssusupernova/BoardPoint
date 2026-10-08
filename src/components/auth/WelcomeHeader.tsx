import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

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

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
