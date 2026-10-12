import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
  Timeline,
  type TimelineEntry,
} from '@/components/admin/containers';
import { AdminButton, FieldRow, InlineNote, StatusPill } from '@/components/admin/primitives';
import { ConfirmActionModal, type ModalField } from '@/components/admin/modals';
import { useAdminToast } from '@/components/admin/toast';
import { adminRoutes, href, routes } from '@/routes';
import { formatDateTime, hoursBetween, relativeTime } from '@/services/admin/format';
import {
  addReportFindings,
  assignReportToMe,
  escalateReport,
  getLandlord,
  getListing,
  resolveReport,
  useAdminStore,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { currency, adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { ReportEvent } from '@/services/admin/types';
import { REPORT_CATEGORY_LABELS, reportStatusTone } from './index';

type CaseAction = 'findings' | 'resolve' | 'escalate';

const OVERDUE_TARGET_HOURS = 48;

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

const EVENT_LABELS: Record<ReportEvent['action'], string> = {
  filed: 'Report filed',
  assigned: 'Assigned to a reviewer',
  findings_added: 'Findings recorded',
  resolved: 'Case resolved',
  escalated: 'Case escalated',
};

function eventPresentation(
  action: ReportEvent['action']
): { tone: AdminTone; icon: TimelineEntry['icon'] } {
  if (action === 'filed') return { tone: 'warning', icon: 'alert-circle-outline' };
  if (action === 'assigned' || action === 'findings_added') {
    return { tone: 'info', icon: 'person-outline' };
  }
  if (action === 'resolved') return { tone: 'success', icon: 'checkmark-done-outline' };
  return { tone: 'danger', icon: 'arrow-up-circle-outline' };
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();
  const toast = useAdminToast();

  const [action, setAction] = useState<CaseAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const model = useMemo(() => {
    if (!db) return null;
    const report = db.reports.find((entry) => entry.id === id) ?? null;
    if (!report) return null;
    const targetListing = report.targetType === 'listing' ? getListing(db, report.targetId) : null;
    const targetLandlord = getLandlord(db, report.targetId);
    return { report, targetListing, targetLandlord };
  }, [db, id]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading report…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The report could not be loaded.'}
          onRetry={() => router.push(href(routes.adminReports))}
        />
      </Screen>
    );
  }

  if (!model) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Report not found"
          message="This report no longer exists in the database."
          actionLabel="Back to reports"
          onAction={() => router.push(href(routes.adminReports))}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to investigate reports." />
      </Screen>
    );
  }

  const { report, targetListing, targetLandlord } = model;
  const canManage = actor.permissions.includes('reports.manage');
  const isResolved = report.status === 'resolved';
  const waitingHours = hoursBetween(report.submittedAt, report.resolvedAt ?? new Date().toISOString());
  const isOverdue = !isResolved && waitingHours !== null && waitingHours > OVERDUE_TARGET_HOURS;
  const assignedToMe = report.assignedTo === actor.id;

  const historyEntries: TimelineEntry[] = [...report.history]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((event) => ({
      id: event.id,
      at: event.at,
      title: EVENT_LABELS[event.action] ?? event.action,
      detail: event.note,
      actor: event.actorName,
      icon: eventPresentation(event.action).icon,
      tone: eventPresentation(event.action).tone,
    }));

  const assignToMe = async () => {
    try {
      await assignReportToMe(report.id, actor);
      toast.success('Case assigned to you. Its status is now “investigating”.');
    } catch (err) {
      toast.error(toMessage(err));
    }
  };

  const submitAction = async (values: Record<string, string>) => {
    if (!action) return;
    setBusy(true);
    setActionError(null);
    try {
      if (action === 'findings') {
        await addReportFindings({ reportId: report.id, actor, findings: values.findings });
        toast.success('Findings saved on the case file.');
      } else if (action === 'resolve') {
        await resolveReport({
          reportId: report.id,
          actor,
          findings: values.findings,
          resolutionNotes: values.resolutionNotes,
        });
        toast.success('Report resolved with notes. The case is closed.');
      } else {
        await escalateReport({ reportId: report.id, actor, reason: values.reason });
        toast.success('Report escalated. A critical notification was pushed.');
      }
      setAction(null);
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const modalConfig = buildActionConfig(action, report.reference, report.findings);

  return (
    <Screen>
      {/* headline */}
      <SectionCard tone="cream">
        <View style={styles.headlineTop}>
          <View style={styles.headlineCopy}>
            <Text style={styles.headlineTitle}>{report.reference}</Text>
            <Text style={styles.headlineMeta}>
              {REPORT_CATEGORY_LABELS[report.category]} · filed {relativeTime(report.submittedAt)}
            </Text>
          </View>
          <StatusPill label={report.status} tone={reportStatusTone(report.status)} />
        </View>

        <View style={styles.headlinePills}>
          <StatusPill
            label={report.targetType === 'listing' ? 'Listing report' : 'Account report'}
            tone="info"
            icon={report.targetType === 'listing' ? 'business-outline' : 'person-outline'}
            subtle
          />
          <StatusPill
            label={isOverdue ? 'Overdue' : isResolved ? 'Closed in time' : 'Within 48h target'}
            tone={isOverdue ? 'danger' : isResolved ? 'success' : 'neutral'}
            icon={isOverdue ? 'alarm-outline' : 'time-outline'}
            subtle
          />
        </View>

        <AdminButton
          label="Back to reports queue"
          variant="secondary"
          icon="arrow-back"
          onPress={() => router.push(href(routes.adminReports))}
        />
      </SectionCard>

      {isOverdue ? (
        <InlineNote tone="danger" icon="alarm-outline">
          This case has been waiting {Math.round(waitingHours ?? 0)} hours — past the 48-hour
          resolution target. Document your findings and resolve or escalate it.
        </InlineNote>
      ) : null}

      {/* case actions */}
      <SectionCard
        title="Case actions"
        subtitle="Assign, document findings, resolve with notes, or escalate. Every step is audited with your name."
      >
        {!canManage ? (
          <AccessDenied message="Your administrator role does not include investigating reports." />
        ) : isResolved ? (
          <View style={styles.resolvedBox}>
            <View style={[styles.resolvedIcon, { backgroundColor: adminColors.successBg }]}>
              <Ionicons name="checkmark-done" size={22} color={adminColors.success} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.resolvedTitle}>
                Resolved by{' '}
                {db.admins.find((admin) => admin.id === report.resolvedBy)?.fullName ??
                  'an administrator'}
              </Text>
              <Text style={styles.resolvedMeta}>{formatDateTime(report.resolvedAt)}</Text>
              <Text style={styles.resolvedNotes}>“{report.resolutionNotes}”</Text>
            </View>
          </View>
        ) : (
          <View style={styles.actionGroup}>
            {!report.assignedTo || !assignedToMe ? (
              <AdminButton
                label={
                  report.assignedTo ? `Assigned: ${report.assignedToName}` : 'Assign this case to me'
                }
                variant={report.assignedTo ? 'ghost' : 'info'}
                icon="person-outline"
                onPress={() => void assignToMe()}
                disabled={Boolean(report.assignedTo)}
              />
            ) : (
              <StatusPill label="You are reviewing this case" tone="success" icon="checkmark-circle-outline" />
            )}

            <AdminButton
              label="Record investigation findings"
              icon="document-text-outline"
              variant="secondary"
              onPress={() => {
                setActionError(null);
                setAction('findings');
              }}
            />

            <AdminButton
              label="Resolve report"
              icon="checkmark-done-outline"
              onPress={() => {
                setActionError(null);
                setAction('resolve');
              }}
            />

            {report.status !== 'escalated' ? (
              <AdminButton
                label="Escalate case"
                icon="arrow-up-circle-outline"
                variant="danger"
                onPress={() => {
                  setActionError(null);
                  setAction('escalate');
                }}
              />
            ) : null}
          </View>
        )}
      </SectionCard>

      {/* report detail */}
      <SectionCard title="Report details" subtitle="As filed by the reporter.">
        <FieldRow label="Category" value={REPORT_CATEGORY_LABELS[report.category]} icon="pricetag-outline" />
        <View style={styles.separator} />
        <FieldRow label="Reported by" value={report.reportedBy} icon="person-outline" />
        <View style={styles.separator} />
        <FieldRow label="Filed" value={formatDateTime(report.submittedAt)} icon="calendar-outline" />
        <View style={styles.separator} />
        <FieldRow
          label="Reviewer"
          value={report.assignedToName ?? 'Unassigned'}
          icon="shield-outline"
        />
        <View style={styles.separator} />
        <FieldRow label="Escalated" value={formatDateTime(report.escalatedAt)} icon="arrow-up-circle-outline" />
        <View style={styles.description}>
          <Text style={styles.descriptionLabel}>Reporter description</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>
        {report.escalationReason ? (
          <InlineNote tone="danger" icon="arrow-up-circle-outline">
            Escalation reason: {report.escalationReason}
          </InlineNote>
        ) : null}
      </SectionCard>

      {/* target */}
      <SectionCard
        title={report.targetType === 'listing' ? 'Reported listing' : 'Reported account'}
        subtitle="Open the target to moderate it or review the account."
      >
        {report.targetType === 'listing' ? (
          targetListing ? (
            <>
              <FieldRow label="Listing" value={targetListing.title} icon="business-outline" />
              <View style={styles.separator} />
              <FieldRow
                label="Price"
                value={`${currency.symbol}${targetListing.price.toLocaleString()}/month`}
                icon="cash-outline"
                mono
              />
              <View style={styles.separator} />
              <View style={styles.ownerPills}>
                <StatusPill
                  label={targetListing.status.replace('_', ' ')}
                  tone={
                    targetListing.status === 'active'
                      ? 'success'
                      : targetListing.status === 'hidden'
                        ? 'danger'
                        : targetListing.status === 'flagged'
                          ? 'warning'
                          : 'info'
                  }
                />
              </View>
              <AdminButton
                label="Open in moderation"
                icon="construct-outline"
                variant="secondary"
                onPress={() => router.push(href(adminRoutes.listing(targetListing.id)))}
              />
            </>
          ) : (
            <Text style={styles.missingText}>
              The reported listing no longer exists. The report history is kept for the audit trail.
            </Text>
          )
        ) : targetLandlord ? (
          <>
            <FieldRow label="Landlord" value={targetLandlord.fullName} icon="person-outline" />
            <View style={styles.separator} />
            <FieldRow label="Email" value={targetLandlord.email} icon="mail-outline" />
            <View style={styles.separator} />
            <View style={styles.ownerPills}>
              <StatusPill
                label={`Account ${targetLandlord.accountStatus}`}
                tone={targetLandlord.accountStatus === 'active' ? 'success' : 'danger'}
              />
              <StatusPill
                label={targetLandlord.verificationStatus.replace('_', ' ')}
                tone={targetLandlord.verificationStatus === 'verified' ? 'success' : 'info'}
              />
            </View>
            <AdminButton
              label="Open account"
              icon="person-outline"
              variant="secondary"
              onPress={() => router.push(href(adminRoutes.account(targetLandlord.id)))}
            />
          </>
        ) : (
          <Text style={styles.missingText}>
            The reported account no longer exists. The report history is kept for the audit trail.
          </Text>
        )}
      </SectionCard>

      {/* findings + resolution */}
      <SectionCard title="Investigation record" subtitle="What was found and how the case ended.">
        <FieldRow label="Findings" value={report.findings ?? 'No findings recorded yet.'} icon="search-outline" />
        <View style={styles.separator} />
        <FieldRow
          label="Resolution notes"
          value={report.resolutionNotes ?? 'Not resolved yet.'}
          icon="checkmark-done-outline"
        />
        <View style={styles.separator} />
        <FieldRow
          label="Resolved"
          value={report.resolvedAt ? formatDateTime(report.resolvedAt) : 'Awaiting resolution'}
          icon="time-outline"
        />
      </SectionCard>

      {/* history */}
      <SectionCard title="Case history" subtitle="Newest first.">
        {historyEntries.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No history yet"
            message="No investigation events have been recorded for this report."
          />
        ) : (
          <Timeline entries={historyEntries} />
        )}
      </SectionCard>

      {/* action confirmation */}
      <ConfirmActionModal
        visible={action !== null}
        title={modalConfig.title}
        description={modalConfig.description}
        impact={modalConfig.impact}
        fields={modalConfig.fields}
        confirmLabel={modalConfig.confirmLabel}
        tone={modalConfig.tone}
        icon={modalConfig.icon}
        busy={busy}
        errorMessage={actionError}
        onCancel={() => {
          setAction(null);
          setActionError(null);
        }}
        onConfirm={(values) => void submitAction(values)}
      />
    </Screen>
  );
}

interface ActionConfig {
  title: string;
  description: string;
  impact: string[];
  fields: ModalField[];
  confirmLabel: string;
  tone: 'primary' | 'danger';
  icon: 'document-text-outline' | 'checkmark-done-outline' | 'arrow-up-circle-outline';
}

function buildActionConfig(
  action: CaseAction | null,
  reference: string,
  existingFindings: string | null
): ActionConfig {
  switch (action) {
    case 'findings':
      return {
        title: 'Record investigation findings',
        description: `Document what you verified for ${reference}. The case stays open until you resolve or escalate it.`,
        impact: [
          'The case moves to “investigating” and is assigned to you if nobody owns it.',
          'Your findings are stored with your name and timestamp.',
          'Nothing is sent to the reporter or the target yet.',
        ],
        fields: [
          {
            key: 'findings',
            label: 'What did you find?',
            placeholder: 'e.g. Photos match another listing; landlord confirmed the unit exists.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. This becomes part of the permanent case record.',
          },
        ],
        confirmLabel: 'Save findings',
        tone: 'primary',
        icon: 'document-text-outline',
      };
    case 'resolve':
      return {
        title: 'Resolve report',
        description: `Close ${reference}. Resolution notes are required so the decision can be audited later.`,
        impact: [
          'The case status becomes “resolved” and leaves the open queue.',
          'Resolution notes are stored with your name and timestamp in the audit log.',
          'A resolved report can no longer be investigated or escalated.',
          existingFindings
            ? 'Your existing findings are kept on the case file.'
            : 'You can capture findings in the same step since none are recorded yet.',
        ],
        fields: [
          ...(existingFindings
            ? []
            : [
                {
                  key: 'findings',
                  label: 'Findings (optional)',
                  placeholder: 'What the investigation showed.',
                  multiline: true,
                },
              ]),
          {
            key: 'resolutionNotes',
            label: 'Resolution notes',
            placeholder: 'e.g. Listing hidden and reporter notified; no further action needed.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. This text is what future reviewers and auditors read.',
          },
        ],
        confirmLabel: 'Resolve report',
        tone: 'primary',
        icon: 'checkmark-done-outline',
      };
    case 'escalate':
      return {
        title: 'Escalate case',
        description: `Escalate ${reference} to the Trust & Safety lead. A reason is required.`,
        impact: [
          'The case status becomes “escalated” and a critical admin notification is pushed.',
          'Your reason is stored with the escalation and shown to whoever picks it up.',
          'The case can still be resolved after escalation.',
        ],
        fields: [
          {
            key: 'reason',
            label: 'Why does this need escalating?',
            placeholder: 'e.g. Suspected fraud pattern across multiple listings — needs a lead review.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. Written to the audit log.',
          },
        ],
        confirmLabel: 'Escalate case',
        tone: 'danger',
        icon: 'arrow-up-circle-outline',
      };
    default:
      return {
        title: '',
        description: '',
        impact: [],
        fields: [],
        confirmLabel: 'Confirm',
        tone: 'primary',
        icon: 'document-text-outline',
      };
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headlineTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headlineCopy: {
    flex: 1,
    gap: 3,
  },
  headlineTitle: {
    fontSize: adminType.title,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.4,
  },
  headlineMeta: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  headlinePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionGroup: {
    gap: 10,
  },
  resolvedBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 14,
  },
  resolvedIcon: {
    width: 40,
    height: 40,
    borderRadius: adminRadii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolvedTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  resolvedMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  resolvedNotes: {
    marginTop: 8,
    fontSize: adminType.small,
    color: adminColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  separator: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  description: {
    gap: 6,
    paddingTop: 4,
  },
  descriptionLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontSize: adminType.body,
    color: adminColors.textPrimary,
    lineHeight: 21,
  },
  ownerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
  },
  missingText: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
});
