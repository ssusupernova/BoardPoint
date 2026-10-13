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
  ShortcutTile,
  StatCard,
  StatGrid,
  Timeline,
  type TimelineEntry,
} from '@/components/admin/containers';
import {
  FilterChips,
  ProgressBar,
  SearchField,
  SectionTitle,
  StatusPill,
  type IconName,
} from '@/components/admin/primitives';
import { adminRoutes, href, routes } from '@/routes';
import { AUDIT_ACTION_LABELS, auditPresentation } from '@/services/admin/audit';
import { formatDate, isWithinRange, relativeTime } from '@/services/admin/format';
import {
  documentCompleteness,
  openApplications,
  overdueReports,
  recentApplications,
  recentReports,
  retryAdminStore,
  searchAll,
  summaryStats,
  useAdminStore,
  type DateRange,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { adminColors, adminRadii, adminType } from '@/theme/admin';
import type {
  AdminDatabase,
  ContentReport,
  ReportStatus,
  VerificationApplication,
  VerificationStatus,
} from '@/services/admin/types';

type StatusFilter = 'all' | 'pending' | 'needs_action' | 'completed';

const RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'needs_action', label: 'Needs action' },
  { value: 'completed', label: 'Completed' },
];

function matchesApplicationFilter(status: VerificationStatus, filter: StatusFilter): boolean {
  switch (filter) {
    case 'pending':
      return status === 'pending';
    case 'needs_action':
      return status === 'info_requested' || status === 'resubmitted';
    case 'completed':
      return status === 'approved' || status === 'rejected';
    default:
      return true;
  }
}

function matchesReportFilter(status: ReportStatus, filter: StatusFilter): boolean {
  switch (filter) {
    case 'pending':
      return status === 'open';
    case 'needs_action':
      return status === 'investigating' || status === 'escalated';
    case 'completed':
      return status === 'resolved';
    default:
      return true;
  }
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboardScreen() {
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();

  const [range, setRange] = useState<DateRange>('30d');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const model = useMemo(() => (db ? buildModel(db, range, filter, query) : null), [db, range, filter, query]);

  if (!actor) {
    return (
      <Screen>
        <ErrorState
          message="This device is not signed in with an administrator account. Sign in with an admin account to open the panel."
          onRetry={() => router.replace(routes.signIn)}
        />
      </Screen>
    );
  }

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading admin dashboard…" />
      </Screen>
    );
  }

  if (status === 'error' || !db || !model) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The admin database could not be opened.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  const { stats, queue, submitted, reports, activity, results, overdue, oldestWaiting } = model;

  return (
    <Screen>
      {/* greeting */}
      <SectionCard tone="cream" style={styles.greetingCard}>
        <Text style={styles.greetingTitle}>
          {greeting()}, {actor.fullName.split(' ')[0]}.
        </Text>
        <Text style={styles.greetingSubtitle}>
          {formatDate(new Date().toISOString())} · {actor.title}
        </Text>
        <View style={styles.greetingChips}>
          <StatusPill
            label={`${queue.length} awaiting review`}
            tone={queue.length > 0 ? 'warning' : 'success'}
            icon={queue.length > 0 ? 'hourglass-outline' : 'checkmark-circle-outline'}
          />
          <StatusPill
            label={`${overdue.length} overdue ${overdue.length === 1 ? 'case' : 'cases'}`}
            tone={overdue.length > 0 ? 'danger' : 'success'}
            icon="flag-outline"
          />
        </View>
      </SectionCard>

      {/* search */}
      <View style={styles.block}>
        <SectionTitle>Search everything</SectionTitle>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search landlords, listings, reports…"
          accessibilityLabel="Search landlords, applications, listings and reports"
        />
        {query.trim().length >= 2 ? (
          <View style={styles.searchResults}>
            {results.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No matches"
                message={`Nothing in the database matches “${query.trim()}”.`}
              />
            ) : (
              results.map((result) => (
                <Pressable
                  key={`${result.kind}-${result.id}`}
                  onPress={() => router.push(href(result.route))}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${result.title}, ${result.subtitle}`}
                  style={({ pressed }) => [styles.searchResultRow, pressed && styles.searchResultPressed]}
                >
                  <Ionicons name="arrow-forward" size={14} color={adminColors.primary} />
                  <View style={styles.searchResultCopy}>
                    <Text style={styles.searchResultTitle} numberOfLines={1}>
                      {result.title}
                    </Text>
                    <Text style={styles.searchResultMeta} numberOfLines={1}>
                      {result.subtitle}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}
      </View>

      {/* filters */}
      <SectionCard title="Filters" subtitle={`Showing records from ${rangeLabel(range)}`}>
        <FilterChips
          label="Date range"
          options={RANGE_OPTIONS.map((option) => ({ ...option }))}
          value={range}
          onChange={setRange}
        />
        <FilterChips
          label="Status"
          options={STATUS_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </SectionCard>

      {/* summary */}
      <View style={styles.block}>
        <SectionTitle>Summary</SectionTitle>
        <StatGrid>
          <StatCard
            label="Pending landlord applications"
            value={stats.pendingApplications}
            icon="hourglass-outline"
            tone="warning"
            hint={oldestWaiting}
            onPress={() => router.push(routes.adminVerification)}
          />
          <StatCard
            label="Verified landlords"
            value={stats.verifiedLandlords}
            icon="shield-checkmark-outline"
            tone="success"
            hint={`of ${db.landlords.length} accounts`}
            onPress={() => router.push(routes.adminAccounts)}
          />
          <StatCard
            label="Rejected applications"
            value={stats.rejectedApplications}
            icon="close-circle-outline"
            tone="danger"
            hint="lifetime total"
            onPress={() => router.push(routes.adminVerification)}
          />
          <StatCard
            label="Suspended accounts"
            value={stats.suspendedAccounts}
            icon="pause-circle-outline"
            tone="neutral"
            hint="review before reinstating"
            onPress={() => router.push(routes.adminAccounts)}
          />
          <StatCard
            label="Active property listings"
            value={stats.activeListings}
            icon="business-outline"
            tone="info"
            hint={`from ${landlordCountWithActiveListings(db)} landlords`}
            onPress={() => router.push(routes.adminModeration)}
          />
          <StatCard
            label="Pending reports"
            value={stats.pendingReports}
            icon="flag-outline"
            tone="primary"
            hint={`${overdue.length} past the 48h target`}
            onPress={() => router.push(routes.adminReports)}
          />
        </StatGrid>
      </View>

      {/* shortcuts */}
      <View style={styles.block}>
        <SectionTitle>Modules</SectionTitle>
        <View style={styles.shortcutGrid}>
          <ShortcutTile icon="shield-checkmark-outline" label="Verification" badge={stats.pendingApplications} onPress={() => router.push(routes.adminVerification)} />
          <ShortcutTile icon="people-outline" label="Accounts" onPress={() => router.push(routes.adminAccounts)} />
          <ShortcutTile icon="business-outline" label="Moderation" onPress={() => router.push(routes.adminModeration)} />
          <ShortcutTile icon="flag-outline" label="Reports" badge={stats.pendingReports} onPress={() => router.push(routes.adminReports)} />
          <ShortcutTile icon="time-outline" label="Audit logs" onPress={() => router.push(routes.adminAuditLogs)} />
          <ShortcutTile icon="bar-chart-outline" label="Analytics" onPress={() => router.push(routes.adminAnalytics)} />
          <ShortcutTile icon="notifications-outline" label="Notifications" onPress={() => router.push(routes.adminNotifications)} />
          <ShortcutTile icon="settings-outline" label="Settings" onPress={() => router.push(routes.adminSettings)} />
        </View>
      </View>

      {/* verification queue */}
      <SectionCard
        title="Verification queue"
        subtitle="Oldest submissions first — every decision is confirmed and logged."
        actionLabel="View all"
        onAction={() => router.push(routes.adminVerification)}
      >
        {queue.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="Queue is clear"
            message="No applications match the current date and status filters."
          />
        ) : (
          queue.slice(0, 4).map((application) => (
            <QueueRow
              key={application.id}
              db={db}
              application={application}
              onPress={() => router.push(href(adminRoutes.application(application.id)))}
            />
          ))
        )}
      </SectionCard>

      {/* newly submitted */}
      <SectionCard
        title="Newly submitted applications"
        subtitle="Latest submissions inside the selected date range."
        actionLabel="Open queue"
        onAction={() => router.push(routes.adminVerification)}
      >
        {submitted.length === 0 ? (
          <EmptyState
            icon="document-attach-outline"
            title="Nothing submitted"
            message="No verification applications were submitted in this period."
          />
        ) : (
          submitted.slice(0, 4).map((application) => {
            const landlord = db.landlords.find((entry) => entry.id === application.landlordId);
            return (
              <Text
                key={application.id}
                onPress={() => router.push(href(adminRoutes.application(application.id)))}
                accessibilityRole="button"
                accessibilityLabel={`Open application ${application.reference}`}
                style={styles.linkRow}
              >
                <Text style={styles.linkRowTitle}>{application.reference}</Text>
                {' · '}
                {landlord?.fullName ?? 'Landlord'}
                <Text style={styles.linkRowMeta}>
                  {'  '}
                  {relativeTime(application.submittedAt)} · {application.status.replace('_', ' ')}
                </Text>
              </Text>
            );
          })
        )}
      </SectionCard>

      {/* reported listings */}
      <SectionCard
        title="Recently reported listings"
        subtitle="Complaints filed against listings and accounts."
        actionLabel="Open reports"
        onAction={() => router.push(routes.adminReports)}
      >
        {reports.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No reports"
            message="Nothing was reported during the selected period."
          />
        ) : (
          reports.slice(0, 3).map((report) => (
            <Text
              key={report.id}
              onPress={() => router.push(href(adminRoutes.report(report.id)))}
              accessibilityRole="button"
              accessibilityLabel={`Open report ${report.reference}`}
              style={styles.linkRow}
            >
              <Text style={styles.linkRowTitle}>{report.targetLabel}</Text>
              <Text style={styles.linkRowMeta}>
                {'  '}
                {report.category.replace(/_/g, ' ')} · {relativeTime(report.submittedAt)} ·{' '}
                {report.status}
              </Text>
            </Text>
          ))
        )}
      </SectionCard>

      {/* recent activity */}
      <SectionCard
        title="Recent administrative activity"
        subtitle="Every decision, suspension and moderation action with its actor."
        actionLabel="Full log"
        onAction={() => router.push(routes.adminAuditLogs)}
      >
        {activity.length === 0 ? (
          <EmptyState icon="time-outline" title="No activity yet" message="Actions taken in this period will appear here." />
        ) : (
          <Timeline entries={activity} />
        )}
      </SectionCard>
    </Screen>
  );
}

/* ------------------------------------------------------------------ pieces */

function QueueRow({
  db,
  application,
  onPress,
}: {
  db: AdminDatabase;
  application: VerificationApplication;
  onPress: () => void;
}) {
  const landlord = db.landlords.find((entry) => entry.id === application.landlordId);
  const completeness = documentCompleteness(application);
  const tone =
    application.status === 'resubmitted'
      ? 'info'
      : application.status === 'info_requested'
        ? 'warning'
        : 'primary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Review ${application.reference} from ${landlord?.fullName}, ${completeness.uploaded} of ${completeness.required} documents uploaded`}
      style={({ pressed }) => [styles.queueRow, pressed && styles.queueRowPressed]}
    >
      <View style={styles.queueHeader}>
        <View style={styles.queueHeaderCopy}>
          <Text style={styles.queueTitle} numberOfLines={1}>
            {landlord?.fullName ?? 'Unknown landlord'}
          </Text>
          <Text style={styles.queueMeta} numberOfLines={1}>
            {application.reference} · submitted {relativeTime(application.submittedAt)}
            {application.assignedToName ? ` · ${application.assignedToName}` : ''}
          </Text>
        </View>
        <StatusPill label={application.status.replace('_', ' ')} tone={tone} />
      </View>
      <View style={styles.queueProgress}>
        <ProgressBar
          percent={completeness.percent}
          tone={completeness.missing.length === 0 ? 'success' : 'warning'}
          label="Document completeness"
        />
        <Text style={styles.queueProgressLabel}>
          {completeness.uploaded}/{completeness.required} required documents
        </Text>
      </View>
    </Pressable>
  );
}

function rangeLabel(range: DateRange): string {
  if (range === '7d') return 'the last 7 days';
  if (range === '30d') return 'the last 30 days';
  if (range === '90d') return 'the last 90 days';
  return 'all time';
}

function landlordCountWithActiveListings(db: AdminDatabase): number {
  return new Set(db.listings.filter((listing) => listing.status === 'active').map((listing) => listing.landlordId)).size;
}

interface DashboardModel {
  stats: ReturnType<typeof summaryStats>;
  queue: VerificationApplication[];
  submitted: VerificationApplication[];
  reports: ContentReport[];
  activity: TimelineEntry[];
  results: ReturnType<typeof searchAll>;
  overdue: ReturnType<typeof overdueReports>;
  oldestWaiting: string;
}

function buildModel(
  db: AdminDatabase,
  range: DateRange,
  filter: StatusFilter,
  query: string
): DashboardModel {
  const within = (iso: string) => isWithinRange(iso, range);

  const queue = openApplications(db).filter(
    (application) => within(application.submittedAt) && matchesApplicationFilter(application.status, filter)
  );

  const submitted = recentApplications(db, range).filter((application) =>
    matchesApplicationFilter(application.status, filter)
  );

  const reports = recentReports(db, range).filter((report) => matchesReportFilter(report.status, filter));

  const activity: TimelineEntry[] = db.auditLogs
    .filter((entry) => within(entry.at))
    .slice(0, 6)
    .map((entry) => {
      const presentation = auditPresentation(entry.action);
      return {
        id: entry.id,
        at: entry.at,
        title: AUDIT_ACTION_LABELS[entry.action],
        detail: entry.reason ?? entry.targetLabel,
        actor: entry.actorName,
        icon: presentation.icon as IconName,
        tone: presentation.tone,
      };
    });

  const overdue = overdueReports(db);
  const oldest = queue[0];
  const oldestWaiting = oldest
    ? `oldest waiting ${relativeTime(oldest.submittedAt)}`
    : 'queue is clear';

  return {
    stats: summaryStats(db),
    queue,
    submitted,
    reports,
    activity,
    results: searchAll(db, query),
    overdue,
    oldestWaiting,
  };
}

const styles = StyleSheet.create({
  block: {
    gap: 10,
  },
  greetingCard: {
    gap: 6,
  },
  greetingTitle: {
    fontSize: adminType.title,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  greetingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  searchResults: {
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: adminColors.border,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
  },
  searchResultPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  searchResultCopy: {
    flex: 1,
    gap: 1,
  },
  searchResultTitle: {
    fontSize: adminType.body,
    color: adminColors.textPrimary,
    fontWeight: '700',
  },
  searchResultMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  queueRow: {
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 14,
    gap: 10,
  },
  queueRowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  queueHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  queueTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  queueMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  queueProgress: {
    gap: 6,
  },
  queueProgressLabel: {
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
    fontWeight: '600',
  },
  linkRow: {
    fontSize: adminType.body,
    color: adminColors.textPrimary,
    fontWeight: '600',
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.sm,
    padding: 13,
    lineHeight: 20,
  },
  linkRowTitle: {
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  linkRowMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
});
