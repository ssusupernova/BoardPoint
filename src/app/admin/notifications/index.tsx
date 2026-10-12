import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
} from '@/components/admin/containers';
import { AdminButton, FilterChips } from '@/components/admin/primitives';
import { useAdminToast } from '@/components/admin/toast';
import { href } from '@/routes';
import { formatDateTime, relativeTime } from '@/services/admin/format';
import {
  clearReadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  retryAdminStore,
  useAdminStore,
} from '@/services/admin';
import { adminColors, adminRadii, adminType, toneStyles, type AdminTone } from '@/theme/admin';
import type { AdminNotification } from '@/services/admin/types';

type InboxFilter = 'all' | 'unread' | 'critical';

const FILTER_OPTIONS: { value: InboxFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'critical', label: 'Critical' },
];

const TYPE_LABELS: Record<AdminNotification['type'], string> = {
  verification_submitted: 'New application',
  verification_resubmitted: 'Documents resubmitted',
  report_filed: 'Report filed',
  unresolved_case: 'Unresolved case',
  account_suspended: 'Account suspended',
  system: 'System',
};

function severityTone(severity: AdminNotification['severity']): AdminTone {
  if (severity === 'critical') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'info';
}

function severityIcon(severity: AdminNotification['severity']): keyof typeof Ionicons.glyphMap {
  if (severity === 'critical') return 'alert-circle';
  if (severity === 'warning') return 'warning';
  return 'information-circle';
}

export default function AdminNotificationsScreen() {
  const { status, db, error } = useAdminStore();
  const toast = useAdminToast();

  const [filter, setFilter] = useState<InboxFilter>('all');
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    if (!db) return [];
    return db.notifications
      .filter((notification) => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'critical') return notification.severity === 'critical';
        return true;
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [db, filter]);

  const unread = useMemo(
    () => (db ? db.notifications.filter((notification) => !notification.read).length : 0),
    [db]
  );
  const readCount = useMemo(
    () => (db ? db.notifications.length - unread : 0),
    [db, unread]
  );

  const openNotification = async (notification: AdminNotification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'The notification could not be marked read.');
        return;
      }
    }
    if (notification.route) router.push(href(notification.route));
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update notifications.');
    } finally {
      setBusy(false);
    }
  };

  const clearRead = async () => {
    setBusy(true);
    try {
      await clearReadNotifications();
      toast.success('Read notifications cleared. Unread items were kept.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not clear notifications.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading notifications…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Notifications could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Notifications</Text>
        <Text style={styles.introText}>
          {unread > 0
            ? `${unread} unread notification${unread === 1 ? '' : 's'} — new applications, resubmissions, filed reports and unresolved cases land here.`
            : 'You are all caught up. New applications, resubmissions, filed reports and unresolved cases land here.'}
        </Text>
      </View>

      <View style={styles.toolbar}>
        <AdminButton
          label="Mark all read"
          icon="checkmark-done-outline"
          variant="secondary"
          onPress={() => void markAll()}
          loading={busy}
          disabled={unread === 0}
          style={styles.toolbarButton}
        />
        <AdminButton
          label="Clear read"
          icon="trash-outline"
          variant="ghost"
          onPress={() => void clearRead()}
          loading={busy}
          disabled={readCount === 0}
          style={styles.toolbarButton}
        />
      </View>

      <SectionCard title="Inbox">
        <FilterChips
          label="Show"
          options={FILTER_OPTIONS.map((option) => ({
            ...option,
            count:
              option.value === 'all'
                ? db.notifications.length
                : option.value === 'unread'
                  ? unread
                  : db.notifications.filter((entry) => entry.severity === 'critical').length,
          }))}
          value={filter}
          onChange={setFilter}
        />
      </SectionCard>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="notifications-outline"
            title={filter === 'all' ? 'No notifications yet' : 'Nothing in this view'}
            message={
              filter === 'all'
                ? 'Administrative notifications will appear here as they happen.'
                : 'Switch the filter to see other notifications.'
            }
            actionLabel={filter === 'all' ? undefined : 'Show all'}
            onAction={filter === 'all' ? undefined : () => setFilter('all')}
          />
        </SectionCard>
      ) : (
        rows.map((notification) => {
          const tone = severityTone(notification.severity);
          const palette = toneStyles[tone];
          return (
            <Pressable
              key={notification.id}
              onPress={() => void openNotification(notification)}
              accessibilityRole="button"
              accessibilityLabel={`${notification.title}. ${notification.read ? 'Read' : 'Unread'}. ${relativeTime(notification.at)}.`}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: notification.read ? adminColors.surface : adminColors.cream },
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: palette.background, borderColor: palette.border }]}>
                <Ionicons name={severityIcon(notification.severity)} size={17} color={palette.foreground} />
              </View>

              <View style={styles.rowCopy}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowType}>{TYPE_LABELS[notification.type]}</Text>
                  {!notification.read ? <View style={styles.unreadDot} accessibilityLabel="Unread" /> : null}
                </View>
                <Text style={styles.rowTitle}>{notification.title}</Text>
                <Text style={styles.rowBody} numberOfLines={3}>
                  {notification.body}
                </Text>
                <Text style={styles.rowMeta}>{formatDateTime(notification.at)}</Text>
              </View>

              {notification.route ? (
                <Ionicons name="chevron-forward" size={16} color={adminColors.textMuted} />
              ) : null}
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    backgroundColor: adminColors.cream,
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    padding: 16,
    gap: 6,
  },
  introTitle: {
    fontSize: adminType.title,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.3,
  },
  introText: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolbarButton: {
    flexGrow: 1,
    minWidth: 140,
  },
  row: {
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: adminRadii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: adminColors.primary,
  },
  rowTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  rowBody: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
  rowMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});
