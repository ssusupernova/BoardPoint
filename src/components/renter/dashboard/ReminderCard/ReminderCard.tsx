import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import type { Reminder } from '@/data/mock';
import { colors } from '@/theme';
import { formatDisplayDate } from '@/utils/date';
import { statusVariant } from '@/utils/status';
import { styles } from './ReminderCard.styles';

type Props = {
  reminder: Reminder;
};

/** Single row in the "Coming Up" list. */
export function ReminderCard({ reminder }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={19} color={colors.primary} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {reminder.title}
        </Text>
        <Text style={styles.detail} numberOfLines={2}>
          {reminder.detail}
        </Text>
        <Text style={styles.date}>{formatDisplayDate(reminder.date)}</Text>
      </View>

      <StatusBadge
        text={reminder.status}
        variant={statusVariant(reminder.status)}
        dot
      />
    </View>
  );
}
