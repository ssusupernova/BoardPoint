import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';
import { styles } from './PageHeader.styles';

type Props = {
  title: string;
  subtitle?: string;
  /** When provided, a circular back button renders before the title. */
  onBack?: () => void;
  trailing?: ReactNode;
};

/** Page title row used by renter sub-pages, with optional back button. */
export function PageHeader({ title, subtitle, onBack, trailing }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      ) : null}

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}
