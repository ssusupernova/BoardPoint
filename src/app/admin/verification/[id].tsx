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
import {
  AdminButton,
  FieldRow,
  InlineNote,
  ProgressBar,
  StatusPill,
} from '@/components/admin/primitives';
import {
  ConfirmActionModal,
  InfoSheet,
  SecureDocumentModal,
  type ModalField,
} from '@/components/admin/modals';
import { useAdminToast } from '@/components/admin/toast';
import { adminRoutes, href, routes } from '@/routes';
import { formatDate, formatDateTime, relativeTime } from '@/services/admin/format';
import {
  approveApplication,
  assignApplication,
  documentCompleteness,
  getLandlord,
  listingsForLandlord,
  noticesForLandlord,
  rejectApplication,
  requestAdditionalInformation,
  reviewResubmission,
  useAdminStore,
} from '@/services/admin';
import { openDocumentSecurely } from '@/services/admin/documents';
import { useAdminActor } from '@/services/admin/actor';
import { currency, adminColors, adminRadii, adminType, toneStyles } from '@/theme/admin';
import type { AdminTone } from '@/theme/admin';
import type { VerificationDocument, VerificationStatus } from '@/services/admin/types';

type DecisionKind = 'approve' | 'reject' | 'info' | 'resubmit';

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function statusTone(status: VerificationStatus): AdminTone {
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

function reviewTone(action: string): { tone: AdminTone; icon: TimelineEntry['icon'] } {
  if (action === 'approved') return { tone: 'success', icon: 'checkmark-circle-outline' };
  if (action === 'rejected') return { tone: 'danger', icon: 'close-circle-outline' };
  if (action === 'info_requested') return { tone: 'warning', icon: 'help-circle-outline' };
  if (action === 'resubmitted') return { tone: 'info', icon: 'cloud-upload-outline' };
  if (action === 'documents_reviewed') return { tone: 'info', icon: 'document-text-outline' };
  if (action === 'assigned') return { tone: 'neutral', icon: 'person-outline' };
  return { tone: 'neutral', icon: 'ellipse-outline' };
}

const REVIEW_LABELS: Record<string, string> = {
  submitted: 'Application submitted',
  assigned: 'Assigned for review',
  info_requested: 'More information requested',
  resubmitted: 'Documents resubmitted',
  documents_reviewed: 'Resubmission reviewed',
  approved: 'Verification approved',
  rejected: 'Verification rejected',
};

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();
  const toast = useAdminToast();

  const [decision, setDecision] = useState<DecisionKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const [docTarget, setDocTarget] = useState<VerificationDocument | null>(null);
  const [docBusy, setDocBusy] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docAccess, setDocAccess] = useState<Record<string, string>>({});

  const [historyOpen, setHistoryOpen] = useState(false);

  const model = useMemo(() => {
    if (!db) return null;
    const application = db.applications.find((entry) => entry.id === id) ?? null;
    if (!application) return null;
    const landlord = getLandlord(db, application.landlordId);
    return {
      application,
      landlord,
      listings: listingsForLandlord(db, application.landlordId),
      notices: noticesForLandlord(db, application.landlordId).filter(
        (notice) => notice.applicationId === application.id
      ),
      completeness: documentCompleteness(application),
    };
  }, [db, id]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading application…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The application could not be loaded.'}
          onRetry={() => router.push(href(routes.adminVerification))}
        />
      </Screen>
    );
  }

  if (!model || !model.landlord) {
    return (
      <Screen>
        <EmptyState
          icon="document-outline"
          title="Application not found"
          message="This verification application no longer exists in the database."
          actionLabel="Back to verification queue"
          onAction={() => router.push(href(routes.adminVerification))}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to review verification applications." />
      </Screen>
    );
  }

  const { application, landlord, listings, notices, completeness } = model;
  const canDecide = actor.permissions.includes('verification.decide');
  const decided = application.status === 'approved' || application.status === 'rejected';
  const missingDocs = completeness.missing;

  const historyEntries: TimelineEntry[] = [...application.reviewHistory]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((event) => ({
      id: event.id,
      at: event.at,
      title: REVIEW_LABELS[event.action] ?? event.action,
      detail: event.reason ?? event.note ?? null,
      actor: event.actorName,
      icon: reviewTone(event.action).icon,
      tone: reviewTone(event.action).tone,
    }));

  const submitDecision = async (values: Record<string, string>) => {
    if (!decision) return;
    setBusy(true);
    setDecisionError(null);
    try {
      if (decision === 'approve') {
        await approveApplication({ applicationId: application.id, actor, note: values.note });
        toast.success(`${landlord.fullName} is now verified. The landlord has been notified.`);
      } else if (decision === 'reject') {
        await rejectApplication({ applicationId: application.id, actor, reason: values.reason });
        toast.success('Application rejected. The reason was sent to the landlord.');
      } else if (decision === 'info') {
        await requestAdditionalInformation({
          applicationId: application.id,
          actor,
          message: values.message,
        });
        toast.success('Information request sent to the landlord.');
      } else {
        await reviewResubmission({ applicationId: application.id, actor, note: values.note });
        toast.success('Resubmission reviewed. The application is back in the pending queue.');
      }
      setDecision(null);
    } catch (err) {
      setDecisionError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const assignToMe = async () => {
    try {
      await assignApplication(application.id, actor);
      toast.success('Application assigned to you.');
    } catch (err) {
      toast.error(toMessage(err));
    }
  };

  const requestDocumentAccess = async () => {
    if (!docTarget) return;
    setDocBusy(true);
    setDocError(null);
    try {
      const access = await openDocumentSecurely({
        applicationId: application.id,
        documentId: docTarget.id,
        actor,
      });
      setDocAccess((previous) => ({ ...previous, [docTarget.id]: access.viewedAt }));
      toast.info('Document access recorded in the audit log.');
    } catch (err) {
      setDocError(toMessage(err));
    } finally {
      setDocBusy(false);
    }
  };

  const modalConfig = buildDecisionConfig(decision, landlord.fullName, application.reference, missingDocs);

  return (
    <Screen>
      {/* headline */}
      <SectionCard tone="cream">
        <View style={styles.headlineTop}>
          <View style={styles.headlineCopy}>
            <Text style={styles.headlineTitle}>{landlord.fullName}</Text>
            <Text style={styles.headlineMeta}>
              {application.reference} · submitted {relativeTime(application.submittedAt)}
            </Text>
          </View>
          <StatusPill
            label={application.status.replace('_', ' ')}
            tone={statusTone(application.status)}
          />
        </View>

        <View style={styles.headlineActions}>
          <AdminButton
            label="View decision history"
            variant="secondary"
            icon="time-outline"
            onPress={() => setHistoryOpen(true)}
            style={styles.flexButton}
          />
          {!application.assignedTo || application.assignedTo !== actor.id ? (
            <AdminButton
              label={application.assignedTo ? `Assigned: ${application.assignedToName}` : 'Assign to me'}
              variant={application.assignedTo ? 'ghost' : 'info'}
              icon="person-outline"
              onPress={() => void assignToMe()}
              disabled={Boolean(application.assignedTo) || !canDecide}
              style={styles.flexButton}
            />
          ) : (
            <StatusPill label="You are reviewing this" tone="success" icon="checkmark-circle-outline" />
          )}
        </View>
      </SectionCard>

      {/* decision panel */}
      <SectionCard title="Review decision" subtitle="Every decision requires confirmation and is stored with your name.">
        {!canDecide ? (
          <AccessDenied message="Your administrator role does not include deciding verifications." />
        ) : decided ? (
          <View style={styles.decidedBox}>
            <View style={[styles.decidedIcon, { backgroundColor: toneStyles[statusTone(application.status)].background }]}>
              <Ionicons
                name={application.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={toneStyles[statusTone(application.status)].foreground}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.decidedTitle}>
                {application.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                {application.decidedByName ?? 'an administrator'}
              </Text>
              <Text style={styles.decidedMeta}>{formatDateTime(application.decidedAt)}</Text>
              {application.lastReason ? (
                <Text style={styles.decidedReason}>“{application.lastReason}”</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.decisionButtons}>
            {application.status === 'resubmitted' ? (
              <AdminButton
                label="Review resubmitted documents"
                icon="document-text-outline"
                onPress={() => {
                  setDecisionError(null);
                  setDecision('resubmit');
                }}
              />
            ) : null}

            <AdminButton
              label="Approve verification"
              icon="shield-checkmark-outline"
              onPress={() => {
                setDecisionError(null);
                setDecision('approve');
              }}
              disabled={missingDocs.length > 0}
            />

            {missingDocs.length > 0 ? (
              <InlineNote icon="lock-closed-outline" tone="warning">
                Approval is blocked: {missingDocs.length} required document
                {missingDocs.length === 1 ? ' is' : 's are'} missing ({missingDocs.join(', ')}).
                Request them from the landlord instead — verification cannot be bypassed.
              </InlineNote>
            ) : null}

            <AdminButton
              label="Request additional information"
              icon="help-circle-outline"
              variant="secondary"
              onPress={() => {
                setDecisionError(null);
                setDecision('info');
              }}
            />

            <AdminButton
              label="Reject application"
              icon="close-circle-outline"
              variant="danger"
              onPress={() => {
                setDecisionError(null);
                setDecision('reject');
              }}
            />
          </View>
        )}
      </SectionCard>

      {/* profile */}
      <SectionCard title="Landlord profile" subtitle="As submitted with the application.">
        <FieldRow label="Full name" value={landlord.fullName} icon="person-outline" />
        <View style={styles.separator} />
        <FieldRow label="National ID reference" value={landlord.idNumberMasked} icon="card-outline" mono />
        <View style={styles.separator} />
        <FieldRow label="City" value={landlord.city} icon="location-outline" />
        <View style={styles.separator} />
        <FieldRow label="Address" value={landlord.address} icon="home-outline" />
        <View style={styles.separator} />
        <FieldRow label="Account joined" value={formatDate(landlord.joinedAt)} icon="calendar-outline" />
        <View style={styles.separator} />
        <View style={styles.statusRow}>
          <Text style={styles.fieldRowLabel}>Account status</Text>
          <View style={styles.statusPills}>
            <StatusPill
              label={landlord.accountStatus}
              tone={landlord.accountStatus === 'active' ? 'success' : 'danger'}
            />
            <StatusPill
              label={landlord.verificationStatus.replace('_', ' ')}
              tone={statusTone(
                landlord.verificationStatus === 'verified'
                  ? 'approved'
                  : landlord.verificationStatus === 'unverified'
                    ? 'pending'
                    : landlord.verificationStatus
              )}
            />
          </View>
        </View>
      </SectionCard>

      {/* contact */}
      <SectionCard title="Contact information" subtitle="Used to reach the landlord about this review.">
        <FieldRow label="Email" value={landlord.email} icon="mail-outline" />
        <View style={styles.separator} />
        <FieldRow label="Phone" value={landlord.phone} icon="call-outline" />
      </SectionCard>

      {/* documents */}
      <SectionCard
        title="Required supporting documents"
        subtitle="Stored in a private bucket. Opening a file is permission-checked and logged."
      >
        <View style={styles.docSummary}>
          <ProgressBar
            percent={completeness.percent}
            tone={completeness.missing.length === 0 ? 'success' : 'warning'}
            label="Document completeness"
          />
          <Text style={styles.docSummaryText}>
            {completeness.uploaded} of {completeness.required} required documents ready for review
          </Text>
        </View>

        {application.documents.map((document) => {
          const viewedAt = docAccess[document.id];
          const tone =
            document.status === 'uploaded'
              ? 'success'
              : document.status === 'missing'
                ? 'neutral'
                : 'warning';
          return (
            <View key={document.id} style={styles.docRow}>
              <View style={styles.flex}>
                <Text style={styles.docLabel}>
                  {document.label}
                  {document.required ? '' : ' (optional)'}
                </Text>
                <Text style={styles.docMeta}>
                  {document.uploadedAt
                    ? `uploaded ${formatDate(document.uploadedAt)}`
                    : 'not uploaded yet'}
                  {viewedAt ? ' · you viewed this file' : ''}
                </Text>
              </View>
              <View style={styles.docActions}>
                <StatusPill label={document.status} tone={tone} />
                <AdminButton
                  label={viewedAt ? 'Viewed' : 'View'}
                  variant="secondary"
                  icon="lock-open-outline"
                  onPress={() => {
                    setDocError(null);
                    setDocTarget(document);
                  }}
                  disabled={document.status === 'missing' || !canDecide}
                />
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* related property */}
      <SectionCard
        title="Related property information"
        subtitle="Listings linked to this landlord. Moderation stays independent of verification."
      >
        {listings.length === 0 ? (
          <EmptyState
            icon="business-outline"
            title="No listings yet"
            message="This landlord has not published any property listings."
          />
        ) : (
          listings.map((listing) => (
            <View key={listing.id} style={styles.listingRow}>
              <View style={styles.flex}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                <Text style={styles.listingMeta} numberOfLines={1}>
                  {currency.symbol}
                  {listing.price.toLocaleString()}/month · {listing.city}
                </Text>
              </View>
              <StatusPill label={listing.status.replace('_', ' ')} tone={listingTone(listing.status)} />
              <AdminButton
                label="Open"
                variant="ghost"
                icon="chevron-forward"
                onPress={() => router.push(href(adminRoutes.listing(listing.id)))}
              />
            </View>
          ))
        )}
      </SectionCard>

      {/* timestamps */}
      <SectionCard title="Submission timestamps">
        <FieldRow label="Submitted" value={formatDateTime(application.submittedAt)} icon="calendar-outline" />
        <View style={styles.separator} />
        <FieldRow
          label="Resubmitted"
          value={application.resubmittedAt ? formatDateTime(application.resubmittedAt) : 'No resubmission'}
          icon="refresh-outline"
        />
        <View style={styles.separator} />
        <FieldRow label="Last updated" value={formatDateTime(application.updatedAt)} icon="time-outline" />
        <View style={styles.separator} />
        <FieldRow
          label="Decision"
          value={application.decidedAt ? formatDateTime(application.decidedAt) : 'Awaiting decision'}
          icon="checkmark-done-outline"
        />
      </SectionCard>

      {/* review history */}
      <SectionCard title="Previous review history" subtitle="Newest first.">
        {historyEntries.length === 0 ? (
          <EmptyState icon="time-outline" title="No history" message="No review events recorded yet." />
        ) : (
          <Timeline entries={historyEntries.slice(0, 5)} />
        )}
        <AdminButton
          label="View full decision history"
          variant="secondary"
          icon="list-outline"
          onPress={() => setHistoryOpen(true)}
        />
      </SectionCard>

      {/* landlord notice */}
      <SectionCard title="Landlord notification" tone="blue" subtitle="What the landlord was told about this review.">
        {notices.length === 0 ? (
          <Text style={styles.noticeEmpty}>
            No notification has been sent for this application yet. One is sent automatically with
            every decision.
          </Text>
        ) : (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>{notices[0].title}</Text>
            <Text style={styles.noticeBody}>{notices[0].body}</Text>
            <Text style={styles.noticeSteps}>Next steps: {notices[0].nextSteps}</Text>
            <Text style={styles.noticeMeta}>
              Sent {formatDateTime(notices[0].at)} · delivery {notices[0].delivery}
            </Text>
          </View>
        )}
      </SectionCard>

      {/* decision confirmation */}
      <ConfirmActionModal
        visible={decision !== null}
        title={modalConfig.title}
        description={modalConfig.description}
        impact={modalConfig.impact}
        fields={modalConfig.fields}
        confirmLabel={modalConfig.confirmLabel}
        tone={modalConfig.tone}
        icon={modalConfig.icon}
        busy={busy}
        errorMessage={decisionError}
        onCancel={() => {
          setDecision(null);
          setDecisionError(null);
        }}
        onConfirm={(values) => void submitDecision(values)}
      />

      {/* secure document viewer */}
      <SecureDocumentModal
        visible={docTarget !== null}
        document={docTarget}
        applicationReference={application.reference}
        landlordName={landlord.fullName}
        busy={docBusy}
        errorMessage={docError}
        viewedAt={docTarget ? docAccess[docTarget.id] ?? null : null}
        onClose={() => {
          setDocTarget(null);
          setDocError(null);
        }}
        onOpen={() => void requestDocumentAccess()}
      />

      {/* full decision history */}
      <InfoSheet visible={historyOpen} title="Decision history" onClose={() => setHistoryOpen(false)}>
        <Text style={styles.historyIntro}>
          {application.reference} · {landlord.fullName}
        </Text>
        <Timeline entries={historyEntries} />
      </InfoSheet>
    </Screen>
  );
}

function listingTone(status: string): AdminTone {
  if (status === 'active') return 'success';
  if (status === 'hidden') return 'danger';
  if (status === 'flagged') return 'warning';
  return 'info';
}

interface DecisionConfig {
  title: string;
  description: string;
  impact: string[];
  fields: ModalField[];
  confirmLabel: string;
  tone: 'primary' | 'danger';
  icon: 'checkmark-circle-outline' | 'close-circle-outline' | 'help-circle-outline' | 'document-text-outline';
}

function buildDecisionConfig(
  decision: DecisionKind | null,
  landlordName: string,
  reference: string,
  missingDocs: string[]
): DecisionConfig {
  switch (decision) {
    case 'approve':
      return {
        title: 'Approve verification',
        description: `Confirm that you reviewed the identity documents for ${landlordName} (${reference}).`,
        impact: [
          `${landlordName} becomes a verified landlord and can publish listings.`,
          'Your name, the timestamp and any note are stored in the audit log.',
          'The landlord is notified with the next steps.',
        ],
        fields: [
          {
            key: 'note',
            label: 'Note for the file (optional)',
            placeholder: 'e.g. Documents match the submitted profile.',
            multiline: true,
          },
        ],
        confirmLabel: 'Approve',
        tone: 'primary',
        icon: 'checkmark-circle-outline',
      };
    case 'reject':
      return {
        title: 'Reject application',
        description: `Rejecting ${reference} for ${landlordName}. A reason is required and is sent to the landlord.`,
        impact: [
          'The landlord stays unverified and cannot publish listings.',
          'The reason is stored with the decision and shown to the landlord.',
          'The landlord can submit a new application after fixing the issue.',
          missingDocs.length > 0
            ? `Currently missing: ${missingDocs.join(', ')}.`
            : 'All required documents were present at the time of rejection.',
        ],
        fields: [
          {
            key: 'reason',
            label: 'Reason for rejection',
            placeholder: 'Explain exactly what is wrong and how to fix it.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. Sent to the landlord and written to the audit log.',
          },
        ],
        confirmLabel: 'Reject application',
        tone: 'danger',
        icon: 'close-circle-outline',
      };
    case 'info':
      return {
        title: 'Request additional information',
        description: `Tell ${landlordName} what is still needed for ${reference}. The review pauses until they respond.`,
        impact: [
          'The application moves to “info requested”.',
          'The landlord receives your message with upload instructions.',
          'You can decide the application again once they respond.',
        ],
        fields: [
          {
            key: 'message',
            label: 'Message to the landlord',
            placeholder: 'e.g. Upload a proof of address dated within the last 3 months.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. This text is what the landlord sees.',
          },
        ],
        confirmLabel: 'Send request',
        tone: 'primary',
        icon: 'help-circle-outline',
      };
    case 'resubmit':
      return {
        title: 'Review resubmitted documents',
        description: `Confirm you checked the re-uploaded documents for ${landlordName} (${reference}).`,
        impact: [
          'The application returns to the pending queue with the new documents.',
          'The review is recorded with your name and timestamp.',
          'You can then approve or reject the application.',
        ],
        fields: [
          {
            key: 'note',
            label: 'Review note (optional)',
            placeholder: 'e.g. New selfie and ID photo are legible.',
            multiline: true,
          },
        ],
        confirmLabel: 'Confirm review',
        tone: 'primary',
        icon: 'document-text-outline',
      };
    default:
      return {
        title: '',
        description: '',
        impact: [],
        fields: [],
        confirmLabel: 'Confirm',
        tone: 'primary',
        icon: 'checkmark-circle-outline',
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
  headlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  flexButton: {
    flexGrow: 1,
    minWidth: 150,
  },
  decisionButtons: {
    gap: 10,
  },
  decidedBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 14,
  },
  decidedIcon: {
    width: 40,
    height: 40,
    borderRadius: adminRadii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decidedTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  decidedMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  decidedReason: {
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
  statusRow: {
    paddingVertical: 10,
    gap: 8,
  },
  fieldRowLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  statusPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  docSummary: {
    gap: 7,
  },
  docSummaryText: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '700',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  docLabel: {
    fontSize: adminType.body,
    fontWeight: '700',
    color: adminColors.textPrimary,
  },
  docMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
    fontWeight: '600',
  },
  docActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  listingTitle: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  listingMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  noticeEmpty: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
  noticeBox: {
    gap: 6,
  },
  noticeTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  noticeBody: {
    fontSize: adminType.body,
    color: adminColors.textPrimary,
    lineHeight: 20,
  },
  noticeSteps: {
    fontSize: adminType.small,
    color: adminColors.infoText,
    fontWeight: '700',
    lineHeight: 18,
  },
  noticeMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  historyIntro: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    fontWeight: '700',
  },
});
