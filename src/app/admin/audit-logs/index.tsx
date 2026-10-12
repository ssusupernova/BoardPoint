import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
} from '@/components/admin/containers';
import { FilterChips, SearchField, StatusPill } from '@/components/admin/primitives';
import { formatDateTime } from '@/services/admin/format';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_TARGET_LABELS,
  auditPresentation,
  filterAuditLogs,
  retryAdminStore,
  useAdminStore,
  type DateRange,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';

type GroupFilter = 'all' | 'verification' | 'account' | 'listing' | 'report' | 'document' | 'system';

const GROUP_OPTIONS: { value: GroupFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verification', label: 'Verification' },
  { value: 'account', label: 'Accounts' },
  { value: 'listing', label: 'Listings' },
  { value: 'report', label: 'Reports' },
  { value: 'document', label: 'Documents' },
  { value: 'system', label: 'Settings' },
];

const RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const;

function inGroup(action: string, group: GroupFilter): boolean {
  if (group === 'all') return true;
  if (group === 'system') {
    return action.startsWith('admin.') || action.startsWith('settings.') || action.startsWith('database.');
  }
  return action.startsWith(`${group}.`);
}

export default function AuditLogsScreen() {
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<GroupFilter>('all');
  const [actorId, setActorId] = useState<string>('all');
  const [range, setRange] = useState<DateRange>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return filterAuditLogs(db, { query, actorId, range }).filter((entry) =>
      inGroup(entry.action, group)
    );
  }, [db, query, group, actorId, range]);

  const groupCounts = useMemo(() => {
    const tally: Record<GroupFilter, number> = {
      all: 0,
      verification: 0,
      account: 0,
      listing: 0,
      report: 0,
      document: 0,
      system: 0,
    };
    if (db) {
      for (const entry of db.auditLogs) {
        tally.all += 1;
        for (const option of GROUP_OPTIONS) {
          if (option.value !== 'all' && inGroup(entry.action, option.value)) tally[option.value] += 1;
        }
      }
    }
    return tally;
  }, [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading audit trail…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The audit log could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to read the audit trail." />
      </Screen>
    );
  }

  if (!actor.permissions.includes('audit.view')) {
    return (
      <Screen>
        <AccessDenied message="Your administrator role does not include reading audit logs. Ask a super admin for access." />
      </Screen>
    );
  }

  const actorOptions = [
    { value: 'all', label: 'Everyone' },
    ...db.admins.map((admin) => ({ value: admin.id, label: admin.fullName.split(' ')[0] })),
  ];

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Audit logs</Text>
        <Text style={styles.introText}>
          Append-only record of every administrative action: who acted, when, on which record, and
          why. Entries cannot be edited or deleted.
        </Text>
      </View>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search actor, target or reason…"
        accessibilityLabel="Search audit log entries"
      />

      <SectionCard title="Filters">
        <FilterChips
          label="Module"
          options={GROUP_OPTIONS.map((option) => ({
            ...option,
            count: groupCounts[option.value],
          }))}
          value={group}
          onChange={setGroup}
        />
        <FilterChips
          label="Administrator"
          options={actorOptions}
          value={actorId}
          onChange={setActorId}
        />
        <FilterChips
          label="Date"
          options={RANGE_OPTIONS.map((option) => ({ ...option }))}
          value={range}
          onChange={setRange}
        />
      </SectionCard>

      <Text style={styles.resultCount}>
        {rows.length} of {db.auditLogs.length} entries shown
      </Text>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="file-tray-outline"
            title="No audit entries match"
            message="Adjust the module, administrator, date range or search text."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setGroup('all');
              setActorId('all');
              setRange('all');
            }}
          />
        </SectionCard>
      ) : (
        rows.map((entry) => {
          const presentation = auditPresentation(entry.action);
          const tone = presentation.tone as AdminTone;
          return (
            <View key={entry.id} style={styles.row}>
              <View style={styles.rowTop}>
                <View
                  style={[
                    styles.rowIcon,
                    { backgroundColor: adminColors.neutralBg, borderColor: adminColors.border },
                  ]}
                >
                  <Ionicons
                    name={presentation.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={adminColors.darkBrown}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>
                    {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {entry.actorName} · {formatDateTime(entry.at)}
                  </Text>
                </View>
                <StatusPill label="Super admin" tone={tone} subtle />
              </View>

              <View style={styles.rowTarget}>
                <Text style={styles.rowTargetLabel}>
                  {AUDIT_TARGET_LABELS[entry.targetType] ?? entry.targetType}
                </Text>
                <Text style={styles.rowTargetValue} numberOfLines={2}>
                  {entry.targetLabel}
                </Text>
              </View>

              {entry.reason ? (
                <Text style={styles.rowReason} numberOfLines={4}>
                  “{entry.reason}”
                </Text>
              ) : null}
            </View>
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
    padding: 14,
    gap: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: adminRadii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  rowTarget: {
    gap: 2,
    backgroundColor: adminColors.neutralBg,
    borderRadius: adminRadii.sm,
    borderWidth: 1,
    borderColor: adminColors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTargetLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  rowTargetValue: {
    fontSize: adminType.small,
    color: adminColors.textPrimary,
    fontWeight: '700',
  },
  rowReason: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
