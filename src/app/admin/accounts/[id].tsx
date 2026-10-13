import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
import { ConfirmActionModal } from '@/components/admin/modals';
import { useAdminToast } from '@/components/admin/toast';
import { adminRoutes, href, routes } from '@/routes';
import { formatDate, formatDateTime, relativeTime } from '@/services/admin/format';
import {
  applicationsForLandlord,
  auditPresentation,
  AUDIT_ACTION_LABELS,
  listingsForLandlord,
  noticesForLandlord,
  reactivateLandlord,
  reportsForTarget,
  suspendLandlord,
  useAdminStore,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { LandlordVerificationState } from '@/services/admin/types';

type ActionKind = 'suspend' | 'reactivate';

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function verificationTone(state: LandlordVerificationState): AdminTone {
  switch (state) {
    case 'verified':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'info_requested':
      return 'warning';
    case 'resubmitted':
      return 'info';
    case 'pending':
      return 'primary';
    default:
      return 'neutral';
  }
}

function listingTone(status: string): AdminTone {
  if (status === 'active') return 'success';
  if (status === 'hidden') return 'danger';
  if (status === 'flagged') return 'warning';
  return 'info';
}

export default function LandlordAccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();
  const toast = useAdminToast();

  const [action, setAction] = useState<ActionKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const model = useMemo(() => {
    if (!db) return null;
    const landlord = db.landlords.find((entry) => entry.id === id) ?? null;
    if (!landlord) return null;

    const applications = applicationsForLandlord(db, landlord.id);
    const listings = listingsForLandlord(db, landlord.id);
    const applicationIds = new Set(applications.map((application) => application.id));
    const listingIds = new Set(listings.map((listing) => listing.id));

    const reports = [
      ...reportsForTarget(db, 'account', landlord.id),
      ...listings.flatMap((listing) => reportsForTarget(db, 'listing', listing.id)),
    ].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

    const audit = db.auditLogs.filter(
      (entry) =>
        entry.targetId === landlord.id ||
        applicationIds.has(entry.targetId) ||
        listingIds.has(entry.targetId) ||
        (entry.targetType === 'document' &&
          applications.some((application) => entry.targetLabel.includes(application.reference)))
    );

    return {
      landlord,
      applications,
      listings,
      reports,
      audit,
      notices: noticesForLandlord(db, landlord.id),
    };
  }, [db, id]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading account…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'This account could not be loaded.'}
          onRetry={() => router.push(href(routes.adminAccounts))}
        />
      </Screen>
    );
  }

  if (!model) {
    return (
      <Screen>
        <EmptyState
          icon="person-outline"
          title="Account not found"
          message="This landlord account no longer exists."
          actionLabel="Back to accounts"
          onAction={() => router.push(href(routes.adminAccounts))}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to manage landlord accounts." />
      </Screen>
    );
  }

  const { landlord, applications, listings, reports, audit, notices } = model;
  const canManage = actor.permissions.includes('accounts.manage');
  const suspended = landlord.accountStatus === 'suspended';

  const submit = async (values: Record<string, string>) => {
    setBusy(true);
    setActionError(null);
    try {
      if (action === 'suspend') {
        await suspendLandlord({ landlordId: landlord.id, actor, reason: values.reason });
        toast.success(`${landlord.fullName} was suspended and notified.`);
      } else {
        await reactivateLandlord({ landlordId: landlord.id, actor, note: values.note });
        toast.success(`${landlord.fullName}'s account is active again.`);
      }
      setAction(null);
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const auditEntries: TimelineEntry[] = audit.slice(0, 8).map((entry) => {
    const presentation = auditPresentation(entry.action);
    return {
      id: entry.id,
      at: entry.at,
      title: AUDIT_ACTION_LABELS[entry.action],
      detail: entry.reason ?? entry.targetLabel,
      actor: entry.actorName,
      icon: presentation.icon as TimelineEntry['icon'],
      tone: presentation.tone,
    };
  });

  return (
    <Screen>
      {/* headline */}
      <SectionCard tone="cream">
        <View style={styles.headline}>
          <View style={styles.headlineCopy}>
            <Text style={styles.headlineTitle}>{landlord.fullName}</Text>
            <Text style={styles.headlineMeta}>
              {landlord.email} · {landlord.city}
            </Text>
          </View>
        </View>
        <View style={styles.pillRow}>
          <StatusPill
            label={landlord.verificationStatus.replace('_', ' ')}
            tone={verificationTone(landlord.verificationStatus)}
            icon="shield-checkmark-outline"
          />
          <StatusPill
            label={landlord.accountStatus}
            tone={suspended ? 'danger' : 'success'}
            icon={suspended ? 'pause-circle-outline' : 'checkmark-circle-outline'}
          />
        </View>
      </SectionCard>

      {/* actions */}
      <SectionCard
        title="Account actions"
        subtitle="Suspensions require a reason and are recorded with your name and timestamp."
      >
        {!canManage ? (
          <AccessDenied message="Your administrator role does not include suspending or reactivating accounts." />
        ) : (
          <View style={styles.actionStack}>
            {suspended ? (
              <>
                <InlineNote tone="danger" icon="pause-circle-outline">
                  Suspended {relativeTime(landlord.suspendedAt)} by {landlord.suspendedBy}. Reason:{' '}
                  {landlord.suspensionReason}
                </InlineNote>
                <AdminButton
                  label="Reactivate account"
                  icon="play-circle-outline"
                  onPress={() => {
                    setActionError(null);
                    setAction('reactivate');
                  }}
                />
              </>
            ) : (
              <>
                <AdminButton
                  label="Suspend account"
                  icon="pause-circle-outline"
                  variant="danger"
                  onPress={() => {
                    setActionError(null);
                    setAction('suspend');
                  }}
                />
                <Text style={styles.actionHint}>
                  Suspension blocks sign-in and publishing until an administrator reactivates the
                  account. Existing listings stay visible but cannot be edited.
                </Text>
              </>
            )}
          </View>
        )}
      </SectionCard>

      {/* profile */}
      <SectionCard title="Account profile">
        <FieldRow label="Email" value={landlord.email} icon="mail-outline" />
        <View style={styles.separator} />
        <FieldRow label="Phone" value={landlord.phone} icon="call-outline" />
        <View style={styles.separator} />
        <FieldRow label="City" value={landlord.city} icon="location-outline" />
        <View style={styles.separator} />
        <FieldRow label="Address" value={landlord.address} icon="home-outline" />
        <View style={styles.separator} />
        <FieldRow label="National ID reference" value={landlord.idNumberMasked} icon="card-outline" mono />
        <View style={styles.separator} />
        <FieldRow label="Account joined" value={formatDate(landlord.joinedAt)} icon="calendar-outline" />
        {landlord.reactivatedAt ? (
          <>
            <View style={styles.separator} />
            <FieldRow
              label="Last reactivated"
              value={formatDateTime(landlord.reactivatedAt)}
              icon="refresh-outline"
            />
          </>
        ) : null}
      </SectionCard>

      {/* verification history */}
      <SectionCard
        title="Verification history"
        subtitle="Applications submitted by this landlord."
        actionLabel={applications.length > 0 ? 'Open queue' : undefined}
        onAction={() => router.push(href(routes.adminVerification))}
      >
        {applications.length === 0 ? (
          <EmptyState
            icon="shield-outline"
            title="No applications"
            message="This landlord has never submitted a verification application."
          />
        ) : (
          applications.map((application) => (
            <View key={application.id} style={styles.listRow}>
              <View style={styles.flex}>
                <Text style={styles.listRowTitle}>{application.reference}</Text>
                <Text style={styles.listRowMeta}>
                  submitted {formatDate(application.submittedAt)}
                  {application.decidedAt ? ` · decided ${formatDate(application.decidedAt)}` : ''}
                </Text>
              </View>
              <StatusPill
                label={application.status.replace('_', ' ')}
                tone={verificationTone(
                  application.status === 'approved' ? 'verified' : application.status
                )}
              />
              <AdminButton
                label="Open"
                variant="ghost"
                icon="chevron-forward"
                onPress={() => router.push(href(adminRoutes.application(application.id)))}
              />
            </View>
          ))
        )}
      </SectionCard>

      {/* listings */}
      <SectionCard
        title="Related listings"
        subtitle="Moderation history stays independent of verification status."
        actionLabel={listings.length > 0 ? 'Open moderation' : undefined}
        onAction={() => router.push(href(routes.adminModeration))}
      >
        {listings.length === 0 ? (
          <EmptyState
            icon="business-outline"
            title="No listings"
            message="This landlord has not published any listings."
          />
        ) : (
          listings.map((listing) => (
            <View key={listing.id} style={styles.listRow}>
              <View style={styles.flex}>
                <Text style={styles.listRowTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                <Text style={styles.listRowMeta} numberOfLines={1}>
                  {listing.city} · updated {relativeTime(listing.updatedAt)}
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

      {/* reports */}
      <SectionCard title="Reports linked to this account">
        {reports.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="No reports"
            message="Nothing has been reported about this landlord or their listings."
          />
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.listRow}>
              <View style={styles.flex}>
                <Text style={styles.listRowTitle} numberOfLines={1}>
                  {report.reference} · {report.category.replace(/_/g, ' ')}
                </Text>
                <Text style={styles.listRowMeta} numberOfLines={1}>
                  {report.targetLabel} · {relativeTime(report.submittedAt)}
                </Text>
              </View>
              <StatusPill
                label={report.status}
                tone={
                  report.status === 'resolved'
                    ? 'success'
                    : report.status === 'escalated'
                      ? 'danger'
                      : 'warning'
                }
              />
              <AdminButton
                label="Open"
                variant="ghost"
                icon="chevron-forward"
                onPress={() => router.push(href(adminRoutes.report(report.id)))}
              />
            </View>
          ))
        )}
      </SectionCard>

      {/* administrative history */}
      <SectionCard title="Administrative history" subtitle="Audit entries touching this account.">
        {auditEntries.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No recorded actions"
            message="No administrative action has touched this account yet."
          />
        ) : (
          <Timeline entries={auditEntries} />
        )}
      </SectionCard>

      {/* notifications sent */}
      <SectionCard title="Notifications sent to this landlord" tone="blue">
        {notices.length === 0 ? (
          <Text style={styles.noticeEmpty}>No notifications have been sent to this landlord.</Text>
        ) : (
          notices.slice(0, 5).map((notice) => (
            <View key={notice.id} style={styles.noticeItem}>
              <Text style={styles.noticeTitle}>{notice.title}</Text>
              <Text style={styles.noticeBody} numberOfLines={3}>
                {notice.body}
              </Text>
              <Text style={styles.noticeMeta}>
                {formatDateTime(notice.at)} · {notice.delivery}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <ConfirmActionModal
        visible={action !== null}
        title={action === 'suspend' ? 'Suspend account' : 'Reactivate account'}
        description={
          action === 'suspend'
            ? `${landlord.fullName} will be blocked from signing in and publishing listings.`
            : `${landlord.fullName} will be able to sign in and manage listings again.`
        }
        impact={
          action === 'suspend'
            ? [
                'The reason is stored on the account and in the audit log.',
                'The landlord is notified with the reason and the appeal steps.',
                'Existing listings remain visible but cannot be edited.',
              ]
            : [
                'The suspension record is cleared and the reactivation is logged.',
                'The landlord is notified that access has been restored.',
              ]
        }
        fields={
          action === 'suspend'
            ? [
                {
                  key: 'reason',
                  label: 'Reason for suspension',
                  placeholder: 'e.g. Three renters reported advance payment requests.',
                  required: true,
                  minChars: 8,
                  multiline: true,
                  hint: 'Required. Shown to the landlord and stored in the audit log.',
                },
              ]
            : [
                {
                  key: 'note',
                  label: 'Reactivation note (optional)',
                  placeholder: 'e.g. Reports reviewed and closed with the landlord.',
                  multiline: true,
                },
              ]
        }
        confirmLabel={action === 'suspend' ? 'Suspend account' : 'Reactivate'}
        tone={action === 'suspend' ? 'danger' : 'primary'}
        icon={action === 'suspend' ? 'pause-circle-outline' : 'play-circle-outline'}
        busy={busy}
        errorMessage={actionError}
        onCancel={() => {
          setAction(null);
          setActionError(null);
        }}
        onConfirm={(values) => void submit(values)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionStack: {
    gap: 10,
  },
  actionHint: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    lineHeight: 17,
  },
  separator: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  listRowTitle: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  listRowMeta: {
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
  noticeItem: {
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: '#C4E0EF',
    borderRadius: adminRadii.md,
    padding: 12,
    gap: 4,
  },
  noticeTitle: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  noticeBody: {
    fontSize: adminType.small,
    color: adminColors.textPrimary,
    lineHeight: 18,
  },
  noticeMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
});
