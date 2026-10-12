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
import {
  Avatar,
  FilterChips,
  ProgressBar,
  SearchField,
  StatusPill,
} from '@/components/admin/primitives';
import { adminRoutes, href, routes } from '@/routes';
import { relativeTime, formatDate, isWithinRange } from '@/services/admin/format';
import {
  documentCompleteness,
  matchesQuery,
  retryAdminStore,
  useAdminStore,
  type DateRange,
} from '@/services/admin';
import { adminColors, adminRadii, adminType } from '@/theme/admin';
import type { VerificationApplication, VerificationStatus } from '@/services/admin/types';

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

function statusTone(status: VerificationStatus): 'success' | 'danger' | 'warning' | 'info' | 'primary' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'info_requested':
      return 'warning';
    case 'resubmitted':
      return 'info';
    default:
      return 'primary';
  }
}

function matchesFilter(status: VerificationStatus, filter: StatusFilter): boolean {
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

export default function VerificationQueueScreen() {
  const { status, db, error } = useAdminStore();
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRange>('all');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.applications
      .filter((application) => {
        const landlord = db.landlords.find((entry) => entry.id === application.landlordId);
        const haystack = `${application.reference} ${landlord?.fullName ?? ''} ${landlord?.email ?? ''} ${landlord?.phone ?? ''}`;
        if (!matchesQuery(haystack, query)) return false;
        if (filter !== 'all' && !matchesFilter(application.status, filter)) return false;
        if (!isWithinRange(application.resubmittedAt ?? application.submittedAt, range)) return false;
        return true;
      })
      .sort((a, b) => {
        const rank = (application: VerificationApplication) =>
          application.status === 'approved' || application.status === 'rejected' ? 1 : 0;
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        return b.submittedAt.localeCompare(a.submittedAt);
      });
  }, [db, query, filter, range]);

  const counts = useMemo(() => {
    if (!db) return { pending: 0, needs_action: 0, completed: 0 };
    return {
      pending: db.applications.filter((app) => app.status === 'pending').length,
      needs_action: db.applications.filter(
        (app) => app.status === 'info_requested' || app.status === 'resubmitted'
      ).length,
      completed: db.applications.filter(
        (app) => app.status === 'approved' || app.status === 'rejected'
      ).length,
    };
  }, [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading verification applications…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The verification queue could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Landlord verification</Text>
        <Text style={styles.introText}>
          Review identity documents before a landlord can publish listings. Approvals, rejections and
          information requests are confirmed, stored and audited.
        </Text>
      </View>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, email, phone or reference…"
        accessibilityLabel="Search verification applications"
      />

      <SectionCard title="Filters" padded>
        <FilterChips
          label="Submission date"
          options={RANGE_OPTIONS.map((option) => ({ ...option }))}
          value={range}
          onChange={setRange}
        />
        <FilterChips
          label="Verification status"
          options={STATUS_OPTIONS.map((option) => ({
            ...option,
            count:
              option.value === 'all'
                ? db.applications.length
                : option.value === 'pending'
                  ? counts.pending
                  : option.value === 'needs_action'
                    ? counts.needs_action
                    : counts.completed,
          }))}
          value={filter}
          onChange={setFilter}
        />
      </SectionCard>

      <Text style={styles.resultCount}>
        {rows.length} {rows.length === 1 ? 'application' : 'applications'} shown
      </Text>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="search-outline"
            title="No applications match"
            message="Adjust the search text, status or date filter to see more applications."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setFilter('all');
              setRange('all');
            }}
          />
        </SectionCard>
      ) : (
        rows.map((application) => (
          <ApplicationRow
            key={application.id}
            application={application}
            landlordName={
              db.landlords.find((entry) => entry.id === application.landlordId)?.fullName ??
              'Unknown landlord'
            }
            onPress={() => router.push(href(adminRoutes.application(application.id)))}
          />
        ))
      )}

      <Pressable
        onPress={() => router.push(routes.admin)}
        accessibilityRole="link"
        accessibilityLabel="Back to the admin dashboard"
        style={styles.backLink}
      >
        <Ionicons name="chevron-back" size={14} color={adminColors.primary} />
        <Text style={styles.backLinkLabel}>Back to dashboard</Text>
      </Pressable>
    </Screen>
  );
}

function ApplicationRow({
  application,
  landlordName,
  onPress,
}: {
  application: VerificationApplication;
  landlordName: string;
  onPress: () => void;
}) {
  const completeness = documentCompleteness(application);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Review ${application.reference} from ${landlordName}. Status ${application.status.replace('_', ' ')}. ${completeness.uploaded} of ${completeness.required} required documents uploaded.`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowTop}>
        <Avatar name={landlordName} size={42} />
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {landlordName}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={2}>
            {application.reference} · submitted {formatDate(application.submittedAt)}
            {application.assignedToName ? ` · reviewer ${application.assignedToName}` : ''}
          </Text>
        </View>
        <StatusPill label={application.status.replace('_', ' ')} tone={statusTone(application.status)} />
      </View>

      <View style={styles.rowProgress}>
        <ProgressBar
          percent={completeness.percent}
          tone={completeness.missing.length === 0 ? 'success' : 'warning'}
          label="Document completeness"
        />
        <View style={styles.rowProgressLabels}>
          <Text style={styles.rowProgressText}>
            {completeness.uploaded}/{completeness.required} required documents
          </Text>
          <Text style={styles.rowProgressText}>
            {application.resubmittedAt
              ? `resubmitted ${relativeTime(application.resubmittedAt)}`
              : `updated ${relativeTime(application.updatedAt)}`}
          </Text>
        </View>
      </View>

      <View style={styles.rowAction}>
        <Text style={styles.rowActionLabel}>Review application</Text>
        <Ionicons name="arrow-forward" size={15} color={adminColors.primary} />
      </View>
    </Pressable>
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
    gap: 14,
  },
  rowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
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
  rowProgress: {
    gap: 7,
  },
  rowProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowProgressText: {
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
    fontWeight: '600',
    flexShrink: 1,
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
    paddingTop: 12,
  },
  rowActionLabel: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.primary,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  backLinkLabel: {
    fontSize: adminType.small,
    fontWeight: '700',
    color: adminColors.primary,
  },
});
