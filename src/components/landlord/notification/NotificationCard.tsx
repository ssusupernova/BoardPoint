import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NotificationRecord } from '@/services/landlordData';
import {
  LANDLORD_NOTIFICATION_META,
  inferNotificationKind,
} from '@/services/landlordNotifications';
import { notificationStyles as styles } from '@/styles/landlord/notifications.styles';
import { LANDLORD_THEME } from '@/styles/landlord/styles';
import { formatRelativeTime } from '@/utils/date';

interface NotificationCardProps {
  notification: NotificationRecord;
  onPress: () => void;
}

/**
 * One alert row in the Notifications Center: category icon, title, detail,
 * relative timestamp, unread dot, and a chevron when the record has a deep
 * link. The whole card is pressable — opening it also marks it read.
 */
export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const kind =
    notification.kind ?? inferNotificationKind(notification.title, notification.detail);
  const meta = LANDLORD_NOTIFICATION_META[kind];
  const urgent = kind === 'overdue';
  const linked = Boolean(notification.link);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Notification: ${notification.title}`}
      style={({ pressed }) => [
        styles.card,
        notification.read ? null : styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.iconCircle, urgent && styles.iconCircleUrgent]}>
        <Ionicons
          name={meta.icon}
          size={19}
          color={urgent ? LANDLORD_THEME.badgeUrgentText : LANDLORD_THEME.primaryDark}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, notification.read ? null : styles.cardTitleUnread]}>
          {notification.title}
        </Text>
        <Text style={styles.cardDetail}>{notification.detail}</Text>
        <View style={styles.cardFooter}>
          {!notification.read ? <View style={styles.unreadDot} /> : null}
          <Text style={styles.cardTime}>{formatRelativeTime(notification.at)}</Text>
        </View>
      </View>
      {linked ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={LANDLORD_THEME.textMuted}
          style={styles.cardChevron}
        />
      ) : null}
    </Pressable>
  );
}

export default NotificationCard;
