import { Pressable, Text, View } from 'react-native';
import { styles } from './ProfileAvatar.styles';

type Props = {
  name: string;
  /** Diameter in px. Defaults to 44. */
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Circular initials avatar used in the dashboard header. */
export function ProfileAvatar({ name, size = 44, onPress, accessibilityLabel }: Props) {
  const label = initials(name);
  const content = (
    <View
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `${name} profile`}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Open ${name} profile`}
      hitSlop={8}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}
