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
import { FilterChips, InlineNote, SearchField, StatusPill } from '@/components/admin/primitives';
import { adminRoutes, href } from '@/routes';
import { relativeTime } from '@/services/admin/format';
import {
  matchesQuery,
  overdueReports,
  recentReports,
  retryAdminStore,
  useAdminStore,
  type DateRange,
} from '@/services/admin';
import { adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { ReportCategory, ReportStatus } from '@/services/admin/types';

type StatusFilter = 'all' | ReportStatus;
type CategoryFilter = 'all' | ReportCategory;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
];

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'fake_listing', label: 'Fake listing' },
  { value: 'scam_or_fraud', label: 'Scam or fraud' },
  { value: 'duplicate_listing', label: 'Duplicate' },
  { value: 'wrong_information', label: 'Wrong info' },
  { value: 'inappropriate_content', label: 'Inappropriate' },
  { value: 'other', label: 'Other' },
];

const RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const;

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  fake_listing: 'Fake listing',
  scam_or_fraud: 'Scam or fraud',
  duplicate_listing: 'Duplicate listing',
  wrong_information: 'Wrong information',
  inappropriate_content: 'Inappropriate content',
  other: 'Other',
};

export function reportStatusTone(status: ReportStatus): AdminTone {
  switch (status) {
    case 'resolved':
      return 'success';
    case 'escalated':
      return 'danger';
    case 'investigating':
      return 'info';
    default:
      return 'warning';
  }
}

export default function ReportsQueueScreen() {
  const { status, db, error } = useAdminStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [range, setRange] = useState<DateRange>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return recentReports(db, range).filter((report) => {
      const haystack = `${report.reference} ${report.targetLabel} ${report.description} ${report.reportedBy} ${report.assignedToName ?? ''}`;
      if (!matchesQuery(haystack, query)) return false;
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      if (category !== 'all' && report.category !== category) return false;
      return true;
    });
  }, [db, query, statusFilter, category, range]);

  const counts = useMemo(() => {
    const tally: Record<ReportStatus, number> = { open: 0, investigating: 0, escalated: 0, resolved: 0 };
    if (db) for (const report of db.reports) tally[report.status] += 1;
    return tally;
  }, [db]);

  const overdue = useMemo(() => (db ? overdueReports(db) : []), [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading reports…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Reports could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Reports &amp; complaints</Text>
        <Text style={styles.introText}>
          Every report is investigated, documented and closed with written resolution notes. Cases
          still open after 48 hours are marked overdue.
        </Text>
      </View>

      {overdue.length > 0 ? (
        <InlineNote tone="warning" icon="alarm-outline">
          {overdue.length} case{overdue.length === 1 ? ' has' : 's have'} been waiting longer than
          the 48-hour target: {overdue.slice(0, 3).map((report) => report.reference).join(', ')}
          {overdue.length > 3 ? ' and more' : ''}.
        </InlineNote>
      ) : null}

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search reference, target or reporter…"
        accessibilityLabel="Search reports"
      />

      <SectionCard title="Filters">
        <FilterChips
          label="Case status"
          options={STATUS_OPTIONS.map((option) => ({
            ...option,
            count: option.value === 'all' ? db.reports.length : counts[option.value],
          }))}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterChips
          label="Category"
          options={CATEGORY_OPTIONS.map((option) => ({ ...option }))}
          value={category}
          onChange={setCategory}
        />
        <FilterChips
          label="Filed"
          options={RANGE_OPTIONS.map((option) => ({ ...option }))}
          value={range}
          onChange={setRange}
        />
      </SectionCard>

      <Text style={styles.resultCount}>
        {rows.length} {rows.length === 1 ? 'report' : 'reports'} shown
      </Text>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="alert-circle-outline"
            title="No reports match"
            message="Adjust the status, category, date range or search text."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setStatusFilter('all');
              setCategory('all');
              setRange('all');
            }}
          />
        </SectionCard>
      ) : (
        rows.map((report) => {
          const isOverdue =
            report.status !== 'resolved' && overdue.some((entry) => entry.id === report.id);
          return (
            <Pressable
              key={report.id}
              onPress={() => router.push(href(adminRoutes.report(report.id)))}
              accessibilityRole="button"
              accessibilityLabel={`Open report ${report.reference}. Status ${report.status}.`}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.rowHeader}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {report.reference} · {REPORT_CATEGORY_LABELS[report.category]}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {report.targetType === 'listing' ? 'Listing' : 'Account'}:{' '}
                    {report.targetLabel} · filed {relativeTime(report.submittedAt)}
                  </Text>
                </View>
                <StatusPill label={report.status} tone={reportStatusTone(report.status)} />
              </View>

              <View style={styles.rowFooter}>
                <View style={styles.rowReviewer}>
                  <Ionicons name="person-outline" size={13} color={adminColors.textSecondary} />
                  <Text style={styles.rowReviewerText} numberOfLines={1}>
                    {report.assignedToName ?? 'Unassigned'}
                  </Text>
                </View>
                <View style={styles.rowBadges}>
                  {isOverdue ? (
                    <StatusPill label="Overdue" tone="danger" icon="alarm-outline" />
                  ) : null}
                  <View style={styles.rowOpen}>
                    <Text style={styles.rowOpenLabel}>Investigate</Text>
                    <Ionicons name="arrow-forward" size={14} color={adminColors.primary} />
                  </View>
                </View>
              </View>
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
  resultCount: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  rowMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    lineHeight: 16,
    fontWeight: '600',
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
    paddingTop: 10,
  },
  rowReviewer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  rowReviewerText: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '700',
    flexShrink: 1,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  rowOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rowOpenLabel: {
    fontSize: adminType.small,
    fontWeight: '800',
    color: adminColors.primary,
  },
});
