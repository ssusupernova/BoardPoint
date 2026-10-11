import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { FilterTabs } from '@/components/renter/FilterTabs/FilterTabs';
import { NotificationCard } from '@/components/renter/notifications/NotificationCard/NotificationCard';
import type { AppNotification, NotificationAction } from '@/data/mock';
import { routes } from '@/routes';
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
  useUnreadCount,
} from '@/services/notifications';
import { MONTH_NAMES } from '@/utils/date';
import { styles } from './AlertsScreen.styles';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bills', label: 'Bills' },
  { key: 'maintenance', label: 'Maintenance' },
];

function matchesFilter(notification: AppNotification, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'bills') return notification.category === 'bills' || notification.category === 'rent';
  return notification.category === filter;
}

export default function AlertsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const unread = useUnreadCount();
  const [filter, setFilter] = useState('all');

  const today = new Date();
  const todayLabel = `${today.getDate()} ${MONTH_NAMES[today.getMonth()].toUpperCase()}`;

  const groups = useMemo(
    () =>
      [
        { key: 'today' as const, label: `TODAY · ${todayLabel}` },
        { key: 'earlier' as const, label: 'EARLIER' },
      ].map((group) => ({
        ...group,
        items: notifications.filter(
          (item) => item.day === group.key && matchesFilter(item, filter)
        ),
      })),
    [notifications, filter, todayLabel]
  );

  const total = groups.reduce((count, group) => count + group.items.length, 0);

  const openNotification = (action?: NotificationAction) => {
    if (!action) return;
    switch (action.kind) {
      case 'maintenance':
        router.push(routes.renterMaintenance);
        break;
      case 'bills':
        router.push(routes.renterBills);
        break;
      case 'receipt':
        router.push(routes.renterReceipt(action.receiptId));
        break;
    }
  };

  const handleOpen = (notification: AppNotification) => {
    void markNotificationRead(notification.id);
    openNotification(notification.action);
  };

  return (
    <RenterScreen
      active="alerts"
      title="Notifications"
      subtitle="A heads-up for everything at home."
    >
      <View style={styles.headerRow}>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {unread} unread
          </Text>
        </View>
        {unread > 0 ? (
          <Pressable
            onPress={() => void markAllNotificationsRead()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            style={({ pressed }) => [styles.markAll, pressed && styles.markAllPressed]}
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filters}>
        <FilterTabs options={FILTERS} active={filter} onChange={setFilter} />
      </View>

      {total === 0 ? (
        <Text style={styles.emptyText}>
          Nothing here yet. Updates about bills and maintenance will appear here.
        </Text>
      ) : (
        groups.map((group) =>
          group.items.length ? (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.list}>
                {group.items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleOpen(notification)}
                    onAction={() => handleOpen(notification)}
                  />
                ))}
              </View>
            </View>
          ) : null
        )
      )}

      {unread === 0 ? (
        <Text style={styles.footer}>You&apos;re up to date with your home.</Text>
      ) : null}
    </RenterScreen>
  );
}
