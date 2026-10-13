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
import { ConfirmActionModal, type ModalField } from '@/components/admin/modals';
import { useAdminToast } from '@/components/admin/toast';
import { adminRoutes, href, routes } from '@/routes';
import { formatDate, formatDateTime, relativeTime } from '@/services/admin/format';
import {
  flagListing,
  getLandlord,
  hideListing,
  reportsForTarget,
  requestListingCorrection,
  restoreListing,
  retryAdminStore,
  useAdminStore,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { currency, adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { FlagKind, ListingStatus, ModerationEvent } from '@/services/admin/types';

type ModerationAction = 'flag_suspicious' | 'flag_duplicate' | 'correction' | 'hide' | 'restore';

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function listingStatusTone(status: ListingStatus): AdminTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'flagged':
      return 'warning';
    case 'hidden':
      return 'danger';
    default:
      return 'info';
  }
}

const EVENT_LABELS: Record<ModerationEvent['action'], string> = {
  flagged: 'Listing flagged',
  correction_requested: 'Corrections requested',
  hidden: 'Listing hidden',
  restored: 'Listing restored',
  published: 'Listing published',
};

function eventPresentation(
  action: ModerationEvent['action']
): { tone: AdminTone; icon: TimelineEntry['icon'] } {
  if (action === 'flagged' || action === 'correction_requested') {
    return { tone: 'warning', icon: 'flag-outline' };
  }
  if (action === 'hidden') return { tone: 'danger', icon: 'eye-off-outline' };
  if (action === 'restored' || action === 'published') {
    return { tone: 'success', icon: 'checkmark-circle-outline' };
  }
  return { tone: 'neutral', icon: 'ellipse-outline' };
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();
  const toast = useAdminToast();

  const [action, setAction] = useState<ModerationAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const model = useMemo(() => {
    if (!db) return null;
    const listing = db.listings.find((entry) => entry.id === id) ?? null;
    if (!listing) return null;
    const landlord = getLandlord(db, listing.landlordId);
    const reports = reportsForTarget(db, 'listing', listing.id);
    const duplicates = db.listings.filter((entry) => entry.id !== listing.id);
    return { listing, landlord, reports, duplicates };
  }, [db, id]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading listing…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'The listing could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  if (!model) {
    return (
      <Screen>
        <EmptyState
          icon="business-outline"
          title="Listing not found"
          message="This property listing no longer exists in the database."
          actionLabel="Back to moderation"
          onAction={() => router.push(href(routes.adminModeration))}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to moderate property listings." />
      </Screen>
    );
  }

  const { listing, landlord, reports, duplicates } = model;
  const canModerate = actor.permissions.includes('moderation.manage');
  const isHidden = listing.status === 'hidden';
  const openReports = reports.filter((report) => report.status !== 'resolved');

  const historyEntries: TimelineEntry[] = [...listing.moderationHistory]
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((event) => ({
      id: event.id,
      at: event.at,
      title: EVENT_LABELS[event.action] ?? event.action,
      detail: event.reason,
      actor: event.actorName,
      icon: eventPresentation(event.action).icon,
      tone: eventPresentation(event.action).tone,
    }));

  const resolveDuplicate = (value: string): string => {
    const needle = value.trim().toLowerCase();
    const match =
      duplicates.find((entry) => entry.id === needle) ??
      duplicates.find((entry) => entry.title.toLowerCase().includes(needle));
    if (!match) {
      throw new Error(
        'No other listing matches that title or ID. Copy the title exactly from the moderation list.'
      );
    }
    return match.id;
  };

  const submitAction = async (values: Record<string, string>) => {
    if (!action) return;
    setBusy(true);
    setActionError(null);
    try {
      if (action === 'flag_suspicious' || action === 'flag_duplicate') {
        const kind: FlagKind = action === 'flag_duplicate' ? 'duplicate' : 'suspicious';
        const duplicateOfId =
          action === 'flag_duplicate' ? resolveDuplicate(values.duplicateOf) : undefined;
        await flagListing({ listingId: listing.id, actor, kind, reason: values.reason, duplicateOfId });
        toast.success(
          kind === 'duplicate'
            ? 'Listing flagged as a duplicate. The flag is in the audit log.'
            : 'Listing flagged as suspicious. The flag is in the audit log.'
        );
      } else if (action === 'correction') {
        await requestListingCorrection({ listingId: listing.id, actor, message: values.message });
        toast.success('Correction request sent to the landlord.');
      } else if (action === 'hide') {
        await hideListing({ listingId: listing.id, actor, reason: values.reason });
        toast.success('Listing hidden. The landlord has been notified with the reason.');
      } else {
        await restoreListing({ listingId: listing.id, actor, note: values.note });
        toast.success('Listing restored and live again. The landlord has been notified.');
      }
      setAction(null);
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const modalConfig = buildActionConfig(action, listing.title, duplicates);

  return (
    <Screen>
      {/* headline */}
      <SectionCard tone="cream">
        <View style={styles.headlineTop}>
          <View style={styles.headlineCopy}>
            <Text style={styles.headlineTitle}>{listing.title}</Text>
            <Text style={styles.headlineMeta}>
              {listing.city} · updated {relativeTime(listing.updatedAt)}
            </Text>
          </View>
          <StatusPill
            label={listing.status.replace('_', ' ')}
            tone={listingStatusTone(listing.status)}
          />
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {currency.symbol}
            {listing.price.toLocaleString()}
            <Text style={styles.priceUnit}>/month</Text>
          </Text>
          <View style={styles.priceBadges}>
            {listing.flags.length > 0 ? (
              <StatusPill
                label={`${listing.flags.length} flag${listing.flags.length === 1 ? '' : 's'}`}
                tone="warning"
                icon="flag-outline"
              />
            ) : null}
            {openReports.length > 0 ? (
              <StatusPill
                label={`${openReports.length} open report${openReports.length === 1 ? '' : 's'}`}
                tone="danger"
                icon="alert-circle-outline"
              />
            ) : null}
          </View>
        </View>

        <View style={styles.headlineActions}>
          <AdminButton
            label="Open landlord account"
            variant="secondary"
            icon="person-outline"
            onPress={() =>
              router.push(href(landlord ? adminRoutes.account(landlord.id) : routes.adminAccounts))
            }
            style={styles.flexButton}
          />
          <AdminButton
            label="Back to moderation"
            variant="ghost"
            icon="arrow-back"
            onPress={() => router.push(href(routes.adminModeration))}
            style={styles.flexButton}
          />
        </View>
      </SectionCard>

      {/* moderation actions */}
      <SectionCard
        title="Moderation actions"
        subtitle="Listing moderation never changes the landlord's verification status. Every action is confirmed, audited and notified."
      >
        {!canModerate ? (
          <AccessDenied message="Your administrator role does not include moderating listings." />
        ) : isHidden ? (
          <View style={styles.actionGroup}>
            <InlineNote tone="danger" icon="eye-off-outline">
              This listing is hidden from renters. Restoring it makes it visible again and clears its
              flags.
            </InlineNote>
            <AdminButton
              label="Restore listing"
              icon="refresh-outline"
              onPress={() => {
                setActionError(null);
                setAction('restore');
              }}
            />
          </View>
        ) : (
          <View style={styles.actionGroup}>
            <AdminButton
              label="Flag as suspicious"
              icon="flag-outline"
              onPress={() => {
                setActionError(null);
                setAction('flag_suspicious');
              }}
            />
            <AdminButton
              label="Flag as duplicate"
              icon="copy-outline"
              variant="secondary"
              onPress={() => {
                setActionError(null);
                setAction('flag_duplicate');
              }}
              disabled={duplicates.length === 0}
            />
            <AdminButton
              label="Request corrections"
              icon="create-outline"
              variant="info"
              onPress={() => {
                setActionError(null);
                setAction('correction');
              }}
            />
            <AdminButton
              label="Hide listing"
              icon="eye-off-outline"
              variant="danger"
              onPress={() => {
                setActionError(null);
                setAction('hide');
              }}
            />
            {listing.status !== 'active' ? (
              <AdminButton
                label="Restore listing"
                icon="refresh-outline"
                variant="secondary"
                onPress={() => {
                  setActionError(null);
                  setAction('restore');
                }}
              />
            ) : null}
          </View>
        )}
      </SectionCard>

      {/* listing details */}
      <SectionCard title="Listing details" subtitle="As published by the landlord.">
        <FieldRow label="Address" value={listing.address} icon="location-outline" />
        <View style={styles.separator} />
        <FieldRow label="City" value={listing.city} icon="business-outline" />
        <View style={styles.separator} />
        <FieldRow
          label="Monthly rent"
          value={`${currency.symbol}${listing.price.toLocaleString()}`}
          icon="cash-outline"
          mono
        />
        <View style={styles.separator} />
        <FieldRow
          label="Layout"
          value={`${listing.bedrooms} bed · ${listing.bathrooms} bath · ${listing.areaSqft.toLocaleString()} sqft`}
          icon="grid-outline"
        />
        <View style={styles.separator} />
        <FieldRow label="Photos" value={`${listing.imageCount} images`} icon="images-outline" />
        <View style={styles.separator} />
        <FieldRow label="Created" value={formatDateTime(listing.createdAt)} icon="calendar-outline" />
        <View style={styles.separator} />
        <FieldRow label="Last updated" value={formatDateTime(listing.updatedAt)} icon="time-outline" />
        <View style={styles.description}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{listing.description}</Text>
        </View>
      </SectionCard>

      {/* flags */}
      <SectionCard
        title="Active flags"
        subtitle="Flags are what made this listing suspicious or duplicative."
      >
        {listing.flags.length === 0 ? (
          <EmptyState
            icon="flag-outline"
            title="No flags on this listing"
            message="Nothing has been flagged by an administrator yet."
          />
        ) : (
          listing.flags.map((flag) => (
            <View key={flag.id} style={styles.flagCard}>
              <View style={styles.flagHeader}>
                <StatusPill
                  label={flag.kind === 'duplicate' ? 'Duplicate' : 'Suspicious'}
                  tone="warning"
                  icon={flag.kind === 'duplicate' ? 'copy-outline' : 'flag-outline'}
                />
                <Text style={styles.flagMeta}>
                  {flag.byName} · {formatDateTime(flag.at)}
                </Text>
              </View>
              <Text style={styles.flagReason}>{flag.reason}</Text>
              {flag.duplicateOfId ? (
                <AdminButton
                  label="Open the original listing"
                  variant="ghost"
                  icon="arrow-forward"
                  onPress={() => router.push(href(adminRoutes.listing(flag.duplicateOfId!)))}
                />
              ) : null}
            </View>
          ))
        )}
      </SectionCard>

      {/* linked reports */}
      <SectionCard
        title="Linked reports"
        subtitle="Complaints filed against this listing by renters."
        actionLabel={reports.length > 0 ? 'Reports module' : undefined}
        onAction={reports.length > 0 ? () => router.push(href(routes.adminReports)) : undefined}
      >
        {reports.length === 0 ? (
          <EmptyState
            icon="alert-circle-outline"
            title="No reports"
            message="Nobody has reported this listing."
          />
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportRow}>
              <View style={styles.flex}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {report.reference} · {report.category.replace('_', ' ')}
                </Text>
                <Text style={styles.reportMeta} numberOfLines={2}>
                  {report.status === 'resolved'
                    ? `Resolved ${formatDate(report.resolvedAt)}`
                    : `Filed ${relativeTime(report.submittedAt)} by ${report.reportedBy}`}
                </Text>
              </View>
              <StatusPill
                label={report.status}
                tone={
                  report.status === 'resolved'
                    ? 'success'
                    : report.status === 'escalated'
                      ? 'danger'
                      : report.status === 'investigating'
                        ? 'info'
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

      {/* landlord */}
      <SectionCard title="Listing owner" subtitle="Verification is tracked separately from moderation.">
        {landlord ? (
          <>
            <FieldRow label="Landlord" value={landlord.fullName} icon="person-outline" />
            <View style={styles.separator} />
            <FieldRow label="Contact" value={landlord.email} icon="mail-outline" />
            <View style={styles.separator} />
            <View style={styles.ownerPills}>
              <StatusPill
                label={landlord.verificationStatus.replace('_', ' ')}
                tone={
                  landlord.verificationStatus === 'verified'
                    ? 'success'
                    : landlord.verificationStatus === 'rejected'
                      ? 'danger'
                      : 'info'
                }
              />
              <StatusPill
                label={`Account ${landlord.accountStatus}`}
                tone={landlord.accountStatus === 'active' ? 'success' : 'danger'}
              />
            </View>
          </>
        ) : (
          <Text style={styles.missingText}>The landlord account for this listing is missing.</Text>
        )}
      </SectionCard>

      {/* moderation history */}
      <SectionCard title="Moderation history" subtitle="Newest first.">
        {historyEntries.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No moderation history"
            message="This listing has never been flagged, corrected or hidden."
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
  icon: 'flag-outline' | 'copy-outline' | 'create-outline' | 'eye-off-outline' | 'refresh-outline';
}

function buildActionConfig(
  action: ModerationAction | null,
  listingTitle: string,
  duplicates: { id: string; title: string }[]
): ActionConfig {
  const sampleTitles = duplicates
    .slice(0, 3)
    .map((entry) => entry.title)
    .join(' · ');

  switch (action) {
    case 'flag_suspicious':
      return {
        title: 'Flag as suspicious',
        description: `Flag “${listingTitle}” for suspicious content. The listing stays visible while it is flagged.`,
        impact: [
          'The listing status becomes “flagged” and shows an alert in the moderation list.',
          'Your name, reason and timestamp are written to the audit log.',
          'The landlord is not notified — flagging is an internal review marker.',
        ],
        fields: [
          {
            key: 'reason',
            label: 'Why does this listing look suspicious?',
            placeholder: 'e.g. Price is far below the market rate and the photos match another listing.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. Kept in the audit log for later reviewers.',
          },
        ],
        confirmLabel: 'Flag listing',
        tone: 'danger',
        icon: 'flag-outline',
      };
    case 'flag_duplicate':
      return {
        title: 'Flag as duplicate',
        description: `Mark “${listingTitle}” as a copy of another listing already on BoardPoint.`,
        impact: [
          'The listing status becomes “flagged” with a link to the original listing.',
          'The original listing title or ID you enter is stored with the flag.',
          'Your name, reason and timestamp are written to the audit log.',
        ],
        fields: [
          {
            key: 'duplicateOf',
            label: 'Original listing',
            placeholder: 'Title or ID of the original listing',
            required: true,
            hint: `Recent listings: ${sampleTitles}`,
          },
          {
            key: 'reason',
            label: 'Reason',
            placeholder: 'e.g. Same photos and price as an existing listing.',
            required: true,
            minChars: 8,
            multiline: true,
          },
        ],
        confirmLabel: 'Flag duplicate',
        tone: 'danger',
        icon: 'copy-outline',
      };
    case 'correction':
      return {
        title: 'Request corrections',
        description: `Tell the landlord exactly what to fix on “${listingTitle}”. The listing stays visible while they work on it.`,
        impact: [
          'The listing status becomes “correction requested”.',
          'The landlord receives your message with instructions.',
          'Your message is written to the audit log.',
        ],
        fields: [
          {
            key: 'message',
            label: 'What needs to change?',
            placeholder: 'e.g. Upload real photos and correct the monthly rent to match the contract.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. This text is what the landlord sees.',
          },
        ],
        confirmLabel: 'Send request',
        tone: 'primary',
        icon: 'create-outline',
      };
    case 'hide':
      return {
        title: 'Hide listing',
        description: `Hide “${listingTitle}” from renters. A reason is required and is shown to the landlord.`,
        impact: [
          'Renters can no longer see this listing in search results.',
          'The landlord is notified with your reason and how to fix it.',
          'Your name, reason and timestamp are written to the audit log.',
          'You can restore the listing later from this screen.',
        ],
        fields: [
          {
            key: 'reason',
            label: 'Reason for hiding',
            placeholder: 'e.g. The photos do not show the actual property.',
            required: true,
            minChars: 8,
            multiline: true,
            hint: 'Required. Sent to the landlord and written to the audit log.',
          },
        ],
        confirmLabel: 'Hide listing',
        tone: 'danger',
        icon: 'eye-off-outline',
      };
    case 'restore':
      return {
        title: 'Restore listing',
        description: `Make “${listingTitle}” visible to renters again.`,
        impact: [
          'The listing returns to “active” and all flags are cleared.',
          'The landlord is notified that the listing is live again.',
          'Your name and timestamp are written to the audit log.',
        ],
        fields: [
          {
            key: 'note',
            label: 'Review note (optional)',
            placeholder: 'e.g. Landlord uploaded corrected photos.',
            multiline: true,
          },
        ],
        confirmLabel: 'Restore listing',
        tone: 'primary',
        icon: 'refresh-outline',
      };
    default:
      return {
        title: '',
        description: '',
        impact: [],
        fields: [],
        confirmLabel: 'Confirm',
        tone: 'primary',
        icon: 'flag-outline',
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: adminType.heading,
    fontWeight: '800',
    color: adminColors.darkBrown,
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    fontSize: adminType.small,
    fontWeight: '600',
    color: adminColors.textSecondary,
  },
  priceBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  headlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flexButton: {
    flexGrow: 1,
    minWidth: 150,
  },
  actionGroup: {
    gap: 10,
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
  flagCard: {
    gap: 8,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  flagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  flagMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  flagReason: {
    fontSize: adminType.small,
    color: adminColors.textPrimary,
    lineHeight: 18,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  reportTitle: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  reportMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
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
