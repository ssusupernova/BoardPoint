
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import type { AppNotification, NotificationCategory } from '@/data/mock';
import { colors } from '@/theme';
import { statusVariant } from '@/utils/status';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './NotificationCard.styles';

type IconName = ComponentProps<typeof Ionicons>['name'];

const CATEGORY_ICONS: Record<NotificationCategory, IconName> = {
  bills: 'document-text-outline',
  maintenance: 'construct-outline',
  rent: 'home-outline',
};

type Props = {
  notification: AppNotification;
  onPress?: () => void;
  onAction?: () => void;
};

/** One entry in the notifications timeline. */
export function NotificationCard({
  notification,
  onPress,
  onAction,
}: Props) {
  const showAction = Boolean(
    notification.actionLabel && (onAction ?? onPress),
  );

  return (
    <View
      style={[
        styles.card,
        !notification.read && styles.cardUnread,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={notification.title}
        style={({ pressed }) =>
          pressed ? styles.pressed : undefined
        }
      >
        <View
          style={[
            styles.iconWrap,
            !notification.read && styles.iconWrapUnread,
          ]}
        >
          <Ionicons
            name={CATEGORY_ICONS[notification.category]}
            size={18}
            color={colors.primary}
          />
        </View>

        <View style={styles.copy}>
          <View style={styles.topRow}>
            <Text style={styles.timestamp}>
              {notification.timestampLabel}
            </Text>

            {!notification.read ? (
              <View style={styles.unreadDot} />
            ) : null}
          </View>

          <Text style={styles.title}>
            {notification.title}
          </Text>

          <Text style={styles.description}>
            {notification.description}
          </Text>
        </View>
      </Pressable>

      {(notification.statusLabel || showAction) ? (
        <View style={styles.footer}>
          {notification.statusLabel ? (
            <StatusBadge
              text={notification.statusLabel}
              variant={statusVariant(notification.statusLabel)}
              dot
            />
          ) : null}

          {showAction ? (
            <Pressable
              onPress={onAction ?? onPress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={notification.actionLabel}
              style={({ pressed }) => [
                styles.action,
                pressed && styles.actionPressed,
              ]}
            >
              <Text style={styles.actionText}>
                {notification.actionLabel}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={colors.primary}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default NotificationCard;
