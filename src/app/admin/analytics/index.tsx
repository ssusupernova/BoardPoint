import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
  StatCard,
  StatGrid,
} from '@/components/admin/containers';
import { Divider, ProgressBar, StatusPill } from '@/components/admin/primitives';
import { href, routes } from '@/routes';
import { formatDuration } from '@/services/admin/format';
import { analyticsSummary, retryAdminStore, useAdminStore } from '@/services/admin';
import { adminColors, adminRadii, adminType } from '@/theme/admin';
import type { ListingStatus, ReportStatus, VerificationStatus } from '@/services/admin/types';

function hours(value: number | null): string {
  return value === null ? '—' : formatDuration(value);
}

function percentOf(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}

const QUEUE_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pending review',
  info_requested: 'Info requested',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

const LISTING_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  flagged: 'Flagged',
  correction_requested: 'Correction requested',
  hidden: 'Hidden',
};

const REPORT_LABELS: Record<ReportStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

function BreakdownRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
}) {
  return (
    <View style={styles.breakRow}>
      <View style={styles.breakHeader}>
        <Text style={styles.breakLabel}>{label}</Text>
        <Text style={styles.breakValue}>
          {count}
          <Text style={styles.breakPercent}> · {percentOf(count, total)}%</Text>
        </Text>
      </View>
      <ProgressBar percent={percentOf(count, total)} tone={tone} label={label} />
    </View>
  );
}

export default function AnalyticsScreen() {
  const { status, db, error } = useAdminStore();

  const summary = useMemo(() => (db ? analyticsSummary(db) : null), [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Crunching the numbers…" />
      </Screen>
    );
  }

  if (status === 'error' || !db || !summary) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Analytics could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  const { outcomes, turnaround, weekly, listings, reports, verificationQueue, moderationActions } =
    summary;

  const maxWeek = Math.max(1, ...weekly.map((week) => Math.max(week.submitted, week.decided)));
  const maxAdminAverage = Math.max(1, ...turnaround.byAdmin.map((entry) => entry.averageHours));

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Analytics</Text>
        <Text style={styles.introText}>
          Verification outcomes, turnaround time and moderation activity — computed live from the
          records in this database.
        </Text>
      </View>

      {/* outcomes */}
      <SectionCard
        title="Verification outcomes"
        subtitle={`${outcomes.total} applications on record.`}
      >
        <StatGrid>
          <StatCard
            label="Approved"
            value={outcomes.approved}
            icon="checkmark-circle-outline"
            tone="success"
            hint={`${outcomes.approvalRate}% approval rate`}
          />
          <StatCard
            label="Rejected"
            value={outcomes.rejected}
            icon="close-circle-outline"
            tone="danger"
            hint={`${outcomes.rejectionRate}% rejection rate`}
          />
          <StatCard
            label="Still pending"
            value={outcomes.pending + outcomes.infoRequested + outcomes.resubmitted}
            icon="hourglass-outline"
            tone="warning"
            hint={`${outcomes.infoRequested} waiting on landlord`}
          />
        </StatGrid>

        <Divider spaced />

        {Object.entries(verificationQueue)
          .filter(([key]) => key !== 'total')
          .map(([key, value]) => (
            <BreakdownRow
              key={key}
              label={QUEUE_LABELS[key as VerificationStatus]}
              count={value as number}
              total={verificationQueue.total}
              tone={
                key === 'approved'
                  ? 'success'
                  : key === 'rejected'
                    ? 'danger'
                    : key === 'pending'
                      ? 'warning'
                      : 'info'
              }
            />
          ))}
      </SectionCard>

      {/* turnaround */}
      <SectionCard
        title="Turnaround time"
        subtitle="From application submission to a recorded decision."
      >
        <StatGrid>
          <StatCard
            label="Average decision"
            value={Math.round(turnaround.averageHours ?? 0)}
            icon="speedometer-outline"
            tone="info"
            hint={hours(turnaround.averageHours)}
          />
          <StatCard
            label="Median decision"
            value={Math.round(turnaround.medianHours ?? 0)}
            icon="stats-chart-outline"
            tone="primary"
            hint={hours(turnaround.medianHours)}
          />
          <StatCard
            label="Decided cases"
            value={turnaround.decided}
            icon="checkmark-done-outline"
            tone="success"
          />
        </StatGrid>

        <View style={styles.rangeRow}>
          <StatusPill label={`Fastest ${hours(turnaround.fastestHours)}`} tone="success" icon="flash-outline" />
          <StatusPill label={`Longest ${hours(turnaround.longestHours)}`} tone="warning" icon="hourglass-outline" />
          <StatusPill
            label={`Waiting average ${hours(turnaround.awaitingAverageHours)}`}
            tone="info"
            icon="time-outline"
          />
        </View>

        <Divider spaced />

        <Text style={styles.subheading}>By reviewing administrator</Text>
        {turnaround.byAdmin.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No decisions yet"
            message="Turnaround time appears once applications are decided."
          />
        ) : (
          turnaround.byAdmin.map((entry) => (
            <View key={entry.name} style={styles.adminRow}>
              <View style={styles.adminHeader}>
                <Text style={styles.adminName}>{entry.name}</Text>
                <Text style={styles.adminMeta}>
                  {entry.decisions} decision{entry.decisions === 1 ? '' : 's'} ·{' '}
                  {formatDuration(entry.averageHours)} avg
                </Text>
              </View>
              <ProgressBar
                percent={percentOf(entry.averageHours, maxAdminAverage)}
                tone="info"
                label={`${entry.name} average turnaround`}
              />
            </View>
          ))
        )}
      </SectionCard>

      {/* weekly activity */}
      <SectionCard title="Weekly activity" subtitle="Applications submitted and decided per week.">
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: adminColors.primary }]} />
            <Text style={styles.legendLabel}>Submitted</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: adminColors.lightBlue }]} />
            <Text style={styles.legendLabel}>Decided</Text>
          </View>
        </View>

        {weekly.map((week) => (
          <View key={week.key} style={styles.weekRow}>
            <Text style={styles.weekLabel}>{week.label}</Text>
            <View style={styles.weekBars}>
              <View
                style={[
                  styles.weekBar,
                  {
                    width: `${percentOf(week.submitted, maxWeek)}%`,
                    backgroundColor: adminColors.primary,
                  },
                ]}
              />
              <View
                style={[
                  styles.weekBar,
                  {
                    width: `${percentOf(week.decided, maxWeek)}%`,
                    backgroundColor: adminColors.lightBlue,
                  },
                ]}
              />
            </View>
            <Text style={styles.weekValue}>
              {week.submitted}/{week.decided}
            </Text>
          </View>
        ))}
      </SectionCard>

      {/* listings */}
      <SectionCard
        title="Listings & moderation"
        subtitle={`${listings.total} listings on the platform.`}
        actionLabel="Open moderation"
        onAction={() => router.push(href(routes.adminModeration))}
      >
        {Object.entries(listings)
          .filter(([key]) => key !== 'total')
          .map(([key, value]) => (
            <BreakdownRow
              key={key}
              label={LISTING_LABELS[key as ListingStatus]}
              count={value as number}
              total={listings.total}
              tone={
                key === 'active'
                  ? 'success'
                  : key === 'hidden'
                    ? 'danger'
                    : key === 'flagged'
                      ? 'warning'
                      : 'info'
              }
            />
          ))}

        <Divider spaced />

        <Text style={styles.subheading}>Moderation actions taken</Text>
        <View style={styles.chipWrap}>
          {moderationActions.map((entry) => (
            <StatusPill
              key={entry.label}
              label={`${entry.label} ${entry.count}`}
              tone={entry.count > 0 ? 'warning' : 'neutral'}
              icon="construct-outline"
            />
          ))}
        </View>
      </SectionCard>

      {/* reports */}
      <SectionCard
        title="Reports performance"
        subtitle={`${reports.total} reports filed in total.`}
        actionLabel="Open reports"
        onAction={() => router.push(href(routes.adminReports))}
      >
        <StatGrid>
          <StatCard
            label="Resolution rate"
            value={reports.resolutionRate}
            icon="checkmark-done-outline"
            tone="success"
            hint="% of reports resolved"
          />
          <StatCard
            label="Still open"
            value={reports.open + reports.investigating + reports.escalated}
            icon="alert-circle-outline"
            tone="warning"
            hint={`${reports.escalated} escalated`}
          />
          <StatCard
            label="Avg resolution"
            value={Math.round(reports.averageResolutionHours ?? 0)}
            icon="time-outline"
            tone="info"
            hint={hours(reports.averageResolutionHours)}
          />
        </StatGrid>

        <Divider spaced />

        {Object.entries(reports)
          .filter(([key]) => !['total', 'resolutionRate', 'averageResolutionHours'].includes(key))
          .map(([key, value]) => (
            <BreakdownRow
              key={key}
              label={REPORT_LABELS[key as ReportStatus]}
              count={value as number}
              total={reports.total}
              tone={
                key === 'resolved'
                  ? 'success'
                  : key === 'escalated'
                    ? 'danger'
                    : key === 'investigating'
                      ? 'info'
                      : 'warning'
              }
            />
          ))}
      </SectionCard>
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
  subheading: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  breakRow: {
    gap: 6,
  },
  breakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  breakLabel: {
    fontSize: adminType.small,
    fontWeight: '700',
    color: adminColors.textPrimary,
    flexShrink: 1,
  },
  breakValue: {
    fontSize: adminType.small,
    fontWeight: '800',
    color: adminColors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  breakPercent: {
    fontWeight: '600',
    color: adminColors.textSecondary,
  },
  rangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminRow: {
    gap: 6,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  adminName: {
    fontSize: adminType.small,
    fontWeight: '800',
    color: adminColors.textPrimary,
    flexShrink: 1,
  },
  adminMeta: {
    fontSize: adminType.tiny,
    fontWeight: '600',
    color: adminColors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    color: adminColors.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekLabel: {
    width: 56,
    fontSize: adminType.tiny,
    fontWeight: '700',
    color: adminColors.textSecondary,
  },
  weekBars: {
    flex: 1,
    gap: 4,
  },
  weekBar: {
    height: 8,
    borderRadius: adminRadii.full,
    minWidth: 2,
  },
  weekValue: {
    width: 46,
    textAlign: 'right',
    fontSize: adminType.tiny,
    fontWeight: '800',
    color: adminColors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
