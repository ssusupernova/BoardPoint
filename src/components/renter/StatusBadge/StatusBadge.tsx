import { Text, View } from 'react-native';
import type { StatusVariant } from '@/utils/status';
import { styles, variantStyles } from './StatusBadge.styles';

type Props = {
  text: string;
  variant?: StatusVariant;
  /** Render a small leading status dot. */
  dot?: boolean;
};

/** Pill showing a record's status (Active, Unpaid, Scheduled, Completed…). */
export function StatusBadge({ text, variant = 'warning', dot = false }: Props) {
  const v = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }]} accessibilityRole="text">
      {dot ? <View style={[styles.dot, { backgroundColor: v.text }]} /> : null}
      <Text style={[styles.text, { color: v.text }]}>{text}</Text>
    </View>
  );
}
