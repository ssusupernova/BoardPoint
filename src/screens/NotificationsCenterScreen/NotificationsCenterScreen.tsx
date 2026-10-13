import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { NotificationCard } from '@/components/landlord/notification/NotificationCard';
import {
  landlordNotificationLink,
  landlordPaymentDetails,
  routes,
} from '@/routes';
import {
  markAllNotificationsRead,
  markNotificationRead,
  toPaymentRecords,
  useLandlordData,
  useLandlordDataReady,
  type NotificationRecord,
  type PaymentRecordView,
} from '@/services/landlordData';
import { notificationStyles as notif } from '@/styles/landlord/notifications.styles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, toISODate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Filter = 'all' | 'unread';

const MAX_REMINDER_ROWS = 4;

/**
 * Landlord Notifications Center — every alert the ledger has raised, grouped
 * into Today / Earlier with an All | Unread filter. Rent overdue and rent due
 * soon are surfaced live from the bills (no stored duplicates). Tapping a card
 * marks it read and deep-links to the related property, tenant, bill, or
 * statement. Device push is intentionally off — nothing lands on a lock screen.
 */
export default function NotificationsCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const [filter, setFilter] = useState<Filter>('all');
  const [todayIso] = useState(() => toISODate(new Date()));
  const [dueSoonCutoff] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return toISODate(date);
  });

  const sorted = useMemo(
    () => [...data.notifications].sort((a, b) => b.at.localeCompare(a.at)),
    [data.notifications]
  );
  const unreadCount = useMemo(
    () => sorted.reduce((count, item) => (item.read ? count : count + 1), 0),
    [sorted]
  );
  const visible = useMemo(
    () => (filter === 'unread' ? sorted.filter((item) => !item.read) : sorted),
    [sorted, filter]
  );
  const { todayItems, earlierItems } = useMemo(() => {
    const today: NotificationRecord[] = [];
    const earlier: NotificationRecord[] = [];
    for (const item of visible) {
      (item.at.slice(0, 10) === todayIso ? today : earlier).push(item);
    }
    return { todayItems: today, earlierItems: earlier };
  }, [visible, todayIso]);

  const reminders = useMemo(() => {
    const open = toPaymentRecords(data).filter((row) => row.remaining > 0);
    const overdue = open.filter((row) => row.status === 'Overdue');
    const dueSoon = open.filter(
      (row) => row.status !== 'Overdue' && row.dueDate >= todayIso && row.dueDate <= dueSoonCutoff
    );
    return [...overdue, ...dueSoon].slice(0, MAX_REMINDER_ROWS);
  }, [data, todayIso, dueSoonCutoff]);

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={notif.loadingBlock}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={notif.loadingText}>Loading…</Text>
        </View>
      </View>
    );
  }

  const openItem = (item: NotificationRecord) => {
    if (!item.read) void markNotificationRead(item.id);
    router.push(landlordNotificationLink(item.link));
  };

  const openReminder = (row: PaymentRecordView) => {
    router.push(landlordPaymentDetails(row.billId));
  };

  const renderGroup = (label: string, items: NotificationRecord[]) =>
    items.length === 0 ? null : (
      <View key={label}>
        <Text style={notif.groupLabel}>{label}</Text>
        {items.map((item) => (
          <NotificationCard key={item.id} notification={item} onPress={() => openItem(item)} />
        ))}
      </View>
    );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={notif.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                notif.headerBackBtn,
                pressed && notif.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={notif.headerTextCol}>
              <View style={notif.headerTitleRow}>
                <Text style={notif.headerTitle}>Notifications</Text>
                {unreadCount > 0 ? (
                  <View style={notif.unreadBadge}>
                    <Text style={notif.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={notif.headerSubtitle}>
                Tap an alert to open the record it belongs to.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(routes.landlordNotificationSettings)}
              style={({ pressed }) => [
                notif.headerActionBtn,
                pressed && notif.headerActionBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notification preferences"
            >
              <Ionicons name="options-outline" size={18} color={LANDLORD_THEME.primary} />
            </Pressable>
          </View>

          {unreadCount > 0 ? (
            <Pressable
              onPress={() => void markAllNotificationsRead()}
              style={({ pressed }) => [
                notif.headerActionBtn,
                { alignSelf: 'flex-end', marginTop: 10 },
                pressed && notif.headerActionBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
            >
              <Text style={notif.headerActionText}>Mark all as read</Text>
            </Pressable>
          ) : null}

          {/* All | Unread */}
          <View style={notif.filterRow}>
            <Pressable
              onPress={() => setFilter('all')}
              style={({ pressed }) => [
                notif.filterChip,
                filter === 'all' && notif.filterChipActive,
                pressed && notif.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  notif.filterChipText,
                  filter === 'all' && notif.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('unread')}
              style={({ pressed }) => [
                notif.filterChip,
                filter === 'unread' && notif.filterChipActive,
                pressed && notif.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  notif.filterChipText,
                  filter === 'unread' && notif.filterChipTextActive,
                ]}
              >
                Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </Text>
            </Pressable>
          </View>

          {/* Needs attention — live from bills, never stored twice */}
          {reminders.length > 0 ? (
            <View style={notif.attentionCard}>
              <View style={notif.attentionHead}>
                <Ionicons name="alert-circle-outline" size={16} color={LANDLORD_THEME.badgeUrgentText} />
                <Text style={notif.attentionTitle}>Needs attention</Text>
              </View>
              {reminders.map((row, index) => (
                <Pressable
                  key={row.billId}
                  onPress={() => openReminder(row)}
                  style={({ pressed }) => [
                    notif.attentionRow,
                    index === reminders.length - 1 && notif.attentionRowLast,
                    pressed && notif.headerBackBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Open bill for ${row.tenantName}`}
                >
                  <View style={notif.attentionDot} />
                  <View style={notif.attentionBody}>
                    <Text style={notif.attentionRowTitle} numberOfLines={1}>
                      {row.status === 'Overdue' ? 'Overdue' : 'Due soon'} · {row.tenantName}
                    </Text>
                    <Text style={notif.attentionRowMeta} numberOfLines={1}>
                      {[row.propertyName, row.roomLabel, `due ${formatDisplayDate(row.dueDate)}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Text style={notif.attentionAmount}>{formatPeso(row.remaining)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {visible.length === 0 ? (
            <View style={notif.emptyBlock}>
              <View style={notif.emptyIconCircle}>
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color={LANDLORD_THEME.primaryDark}
                />
              </View>
              <Text style={notif.emptyTitle}>
                {filter === 'unread' ? 'No unread notifications' : "You're all caught up."}
              </Text>
              <Text style={notif.emptyText}>
                {filter === 'unread'
                  ? 'Switch to All to review earlier alerts.'
                  : 'New inquiries, payments, and billing updates will appear here.'}
              </Text>
            </View>
          ) : (
            <View>
              {renderGroup('Today', todayItems)}
              {renderGroup('Earlier', earlierItems)}
            </View>
          )}
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
