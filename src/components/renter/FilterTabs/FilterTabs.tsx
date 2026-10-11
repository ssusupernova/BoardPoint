import { Pressable, Text, View } from 'react-native';
import { styles } from './FilterTabs.styles';

export type FilterTab = {
  key: string;
  label: string;
};

type Props = {
  options: FilterTab[];
  active: string;
  onChange: (key: string) => void;
};

/** Horizontal pill filter used on the notifications screen. */
export function FilterTabs({ options, active, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option.key === active;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && styles.pillPressed,
            ]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
