import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  AccessDenied,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
} from '@/components/admin/containers';
import { AdminButton, FilterChips, InlineNote, StatusPill } from '@/components/admin/primitives';
import { ConfirmActionModal } from '@/components/admin/modals';
import { useAdminToast } from '@/components/admin/toast';
import { formatDateTime } from '@/services/admin/format';
import {
  ADMIN_SEED_ACCOUNTS,
  resetDemoData,
  retryAdminStore,
  updatePreferences,
  useAdminStore,
} from '@/services/admin';
import { useAdminActor } from '@/services/admin/actor';
import { adminColors, adminRadii, adminType } from '@/theme/admin';
import type { AdminPreferences, DateRange } from '@/services/admin/types';
import { PERMISSION_LABELS } from '@/services/admin/types';

const AUTO_LOCK_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
];

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
];

const TOGGLES: {
  key: 'notifyVerification' | 'notifyReports' | 'notifyUnresolved' | 'dailyDigest';
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'notifyVerification',
    label: 'Verification submissions',
    description: 'Notify when a landlord submits or resubmits an application.',
    icon: 'document-text-outline',
  },
  {
    key: 'notifyReports',
    label: 'New reports',
    description: 'Notify when a renter files a report or complaint.',
    icon: 'alert-circle-outline',
  },
  {
    key: 'notifyUnresolved',
    label: 'Unresolved cases',
    description: 'Notify about escalated and overdue cases.',
    icon: 'alarm-outline',
  },
  {
    key: 'dailyDigest',
    label: 'Daily digest',
    description: 'Bundle the day’s activity into one summary notification.',
    icon: 'mail-outline',
  },
];

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/** Builds a typed patch for a boolean preference toggle. */
function togglePatch(
  key: 'notifyVerification' | 'notifyReports' | 'notifyUnresolved' | 'dailyDigest',
  value: boolean
): Partial<AdminPreferences> {
  switch (key) {
    case 'notifyVerification':
      return { notifyVerification: value };
    case 'notifyReports':
      return { notifyReports: value };
    case 'notifyUnresolved':
      return { notifyUnresolved: value };
    default:
      return { dailyDigest: value };
  }
}

export default function AdminSettingsScreen() {
  const { status, db, error } = useAdminStore();
  const actor = useAdminActor();
  const toast = useAdminToast();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading settings…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Settings could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  if (!actor) {
    return (
      <Screen>
        <AccessDenied message="Sign in with an administrator account to open admin settings." />
      </Screen>
    );
  }

  const canEditSettings = actor.permissions.includes('settings.manage');
  const prefs = db.preferences;

  const savePreferences = async (patch: Partial<AdminPreferences>) => {
    setBusy(true);
    setActionError(null);
    try {
      await updatePreferences(actor, patch);
      toast.success('Settings saved.');
    } catch (err) {
      const message = toMessage(err);
      setActionError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await resetDemoData(actor);
      setResetOpen(false);
      toast.success('Demo database restored to its seeded state.');
    } catch (err) {
      setActionError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Admin settings</Text>
        <Text style={styles.introText}>
          Preferences, demo credentials and data controls for this panel. Restricted actions
          are logged in the audit trail.
        </Text>
      </View>

      {/* profile */}
      <SectionCard title="Your administrator account">
        <View style={styles.profileRow}>
          <View style={styles.flex}>
            <Text style={styles.profileName}>{actor.fullName}</Text>
            <Text style={styles.profileMeta}>
              {actor.title} · {actor.email}
            </Text>
          </View>
          <StatusPill
            label="Super admin"
            tone="primary"
            icon="shield-checkmark-outline"
          />
        </View>
        <View style={styles.permissionWrap}>
          {actor.permissions.map((permission) => (
            <StatusPill key={permission} label={PERMISSION_LABELS[permission]} tone="success" subtle />
          ))}
        </View>
        <InlineNote tone="info" icon="lock-closed-outline">
          The panel has a single administrator role — super admin — which includes every module.
        </InlineNote>
      </SectionCard>

      {/* preferences */}
      <SectionCard
        title="Notification preferences"
        subtitle="Controls which events push a notification to this panel's inbox."
      >
        {!canEditSettings ? (
          <AccessDenied message="Your administrator role does not include changing admin settings." />
        ) : (
          <>
            {TOGGLES.map((toggle) => {
              const value = prefs[toggle.key] as boolean;
              return (
                <View key={toggle.key} style={styles.toggleRow}>
                  <View style={styles.toggleIcon}>
                    <Ionicons name={toggle.icon as keyof typeof Ionicons.glyphMap} size={16} color={adminColors.darkBrown} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.toggleLabel}>{toggle.label}</Text>
                    <Text style={styles.toggleDescription}>{toggle.description}</Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={(next) => void savePreferences(togglePatch(toggle.key, next))}
                    disabled={busy}
                    trackColor={{ false: adminColors.borderStrong, true: adminColors.lightBlue }}
                    thumbColor={value ? adminColors.primary : adminColors.surface}
                    accessibilityLabel={`${toggle.label} notifications`}
                  />
                </View>
              );
            })}

            <View style={styles.divider} />

            <FilterChips
              label="Auto-lock session after inactivity"
              options={AUTO_LOCK_OPTIONS}
              value={String(prefs.autoLockMinutes)}
              onChange={(value) => void savePreferences({ autoLockMinutes: Number(value) })}
            />
            <FilterChips
              label="Default date range on module screens"
              options={RANGE_OPTIONS}
              value={prefs.defaultDateRange}
              onChange={(value) => void savePreferences({ defaultDateRange: value })}
            />

            {actionError ? <InlineNote tone="danger" icon="alert-circle-outline">{actionError}</InlineNote> : null}
          </>
        )}
      </SectionCard>

      {/* demo credentials */}
      <SectionCard
        title="Demo sign-in credentials"
        subtitle="Local accounts seeded on this device. Replace them when a real backend lands."
        tone="blue"
      >
        {ADMIN_SEED_ACCOUNTS.map((account) => (
          <View key={account.id} style={styles.credentialRow}>
            <View style={styles.flex}>
              <Text style={styles.credentialEmail}>{account.email}</Text>
              <Text style={styles.credentialPassword}>{account.password}</Text>
            </View>
            <StatusPill label="Super admin" tone="primary" />
          </View>
        ))}
        <InlineNote tone="warning" icon="warning-outline">
          These passwords are for local development only. Remove them before any production build.
        </InlineNote>
      </SectionCard>

      {/* data */}
      <SectionCard
        title="Data & storage"
        subtitle="Everything in this panel is stored locally on the device."
      >
        <View style={styles.storageRow}>
          <View style={styles.storageIcon}>
            <Ionicons name="server-outline" size={17} color={adminColors.infoText} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.storageTitle}>Local database (seeded)</Text>
            <Text style={styles.storageText}>
              {db.landlords.length} landlords · {db.applications.length} applications ·{' '}
              {db.listings.length} listings · {db.reports.length} reports · {db.auditLogs.length}{' '}
              audit entries
            </Text>
            <Text style={styles.storageText}>Seeded {formatDateTime(db.seededAt)}</Text>
          </View>
        </View>

        <InlineNote tone="info" icon="cloud-offline-outline">
          No backend is connected yet. The services layer is written so the same screens can later
          point at Supabase without changing the UI.
        </InlineNote>

        <AdminButton
          label="Reset demo data"
          icon="refresh-outline"
          variant="danger"
          onPress={() => {
            setActionError(null);
            setResetOpen(true);
          }}
          disabled={!canEditSettings}
        />
        {!canEditSettings ? (
          <Text style={styles.hint}>
            Resetting the database requires the settings permission.
          </Text>
        ) : null}
      </SectionCard>

      <ConfirmActionModal
        visible={resetOpen}
        title="Reset demo data"
        description="Restore the seeded dataset for this panel."
        impact={[
          'All decisions, flags, reports and preferences made in this session are discarded.',
          'The seeded landlords, applications, listings and reports come back exactly as shipped.',
          'The reset is recorded in the audit log with your name.',
        ]}
        confirmLabel="Reset database"
        tone="danger"
        icon="refresh-outline"
        busy={busy}
        errorMessage={actionError}
        onCancel={() => {
          setResetOpen(false);
          setActionError(null);
        }}
        onConfirm={() => void confirmReset()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileName: {
    fontSize: adminType.heading,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  profileMeta: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  permissionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: adminRadii.sm,
    backgroundColor: adminColors.cream,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  toggleDescription: {
    marginTop: 2,
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    padding: 12,
  },
  credentialEmail: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  credentialPassword: {
    marginTop: 3,
    fontSize: adminType.small,
    color: adminColors.infoText,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  storageRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: adminColors.lightBlueSoft,
    borderWidth: 1,
    borderColor: '#C4E0EF',
    borderRadius: adminRadii.md,
    padding: 14,
  },
  storageIcon: {
    width: 34,
    height: 34,
    borderRadius: adminRadii.full,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: '#C4E0EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageTitle: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  storageText: {
    marginTop: 3,
    fontSize: adminType.tiny,
    color: adminColors.infoText,
    fontWeight: '600',
    lineHeight: 16,
  },
  hint: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
