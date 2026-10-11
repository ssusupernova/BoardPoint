import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';
import { styles } from './SettingRow.styles';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Supporting line under the label. */
  supporting?: string;
  onPress?: () => void;
};

/** Tappable row with a leading icon used in the account & support list. */
export function SettingRow({ icon, label, supporting, onPress }: Props) {
  const content = (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {supporting ? <Text style={styles.supporting}>{supporting}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}
