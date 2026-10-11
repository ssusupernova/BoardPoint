import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import type { MaintenanceTicket } from '@/data/mock';
import { colors } from '@/theme';
import { formatDisplayDate } from '@/utils/date';
import { statusVariant } from '@/utils/status';
import { styles } from './MaintenanceCard.styles';

type Props = {
  ticket: MaintenanceTicket;
  /** When provided the whole card becomes a tappable row. */
  onPress?: () => void;
};

/** Card showing the most recent maintenance ticket and its status. */
export function MaintenanceCard({ ticket, onPress }: Props) {
  const content = (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Ionicons name="construct-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.headCopy}>
          <Text style={styles.title} numberOfLines={1}>
            {ticket.title}
          </Text>
          <Text style={styles.updated}>
            {ticket.category ? `${ticket.category} · ` : ''}Updated{' '}
            {formatDisplayDate(ticket.updatedAt)}
          </Text>
        </View>
        <StatusBadge text={ticket.status} variant={statusVariant(ticket.status)} dot />
      </View>

      <Text style={styles.detail}>{ticket.detail}</Text>

      {ticket.photoUri ? (
        <Image source={{ uri: ticket.photoUri }} style={styles.photo} contentFit="cover" transition={150} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open maintenance ticket ${ticket.title}`}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}
