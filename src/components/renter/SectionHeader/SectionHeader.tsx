import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { InfoPill } from '@/components/renter/InfoPill/InfoPill';
import { colors } from '@/theme';
import { styles } from './SectionHeader.styles';

type Props = {
  title: string;
  /** Supporting line under the title. */
  helper?: string;
  /** Small info tag rendered next to the title (e.g. "Required"). */
  tag?: string;
  /** Optional trailing text action (e.g. "All updates"). */
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, helper, tag, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {tag ? <InfoPill text={tag} /> : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => [styles.actionWrap, pressed && styles.actionPressed]}
          >
            <Text style={styles.action}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}
