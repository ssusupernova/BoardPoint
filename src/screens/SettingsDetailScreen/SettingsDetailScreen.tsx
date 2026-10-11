import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { DetailRow } from '@/components/renter/settings/DetailRow/DetailRow';
import { SettingRow } from '@/components/renter/settings/SettingRow/SettingRow';
import { routes } from '@/routes';
import { storageGet, storageSet } from '@/services/storage';
import { colors } from '@/theme';
import { styles } from './SettingsDetailScreen.styles';

type Prefs = {
  rentReminders: boolean;
  maintenanceUpdates: boolean;
  billingReceipts: boolean;
};

const DEFAULT_PREFS: Prefs = {
  rentReminders: true,
  maintenanceUpdates: true,
  billingReceipts: true,
};

const STORAGE_KEY = 'prefs.notifications';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  password: { title: 'Password & security', subtitle: 'How your account stays protected' },
  notifications: { title: 'Notification preferences', subtitle: 'Choose what you hear about' },
  help: { title: 'Help & support', subtitle: "We're here when you need us" },
};

function ToggleRow({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHelper}>{helper}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor={colors.onPrimary}
      />
    </View>
  );
}

export default function SettingsDetailScreen() {
  const router = useRouter();
  const { section: rawSection } = useLocalSearchParams<{ section: string }>();
  const section = TITLES[rawSection] ? rawSection : 'help';
  const meta = TITLES[section];

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    let cancelled = false;
    void storageGet(STORAGE_KEY).then((raw) => {
      if (cancelled || !raw) return;
      try {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      } catch {
        // Keep the defaults on malformed cache.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePref = (key: keyof Prefs) => (next: boolean) => {
    setPrefs((current) => {
      const updated = { ...current, [key]: next };
      void storageSet(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ScreenContainer>
      <PageHeader title={meta.title} subtitle={meta.subtitle} onBack={() => router.back()} />

      {section === 'password' ? (
        <>
          <View style={styles.panel}>
            <DetailRow label="Sign-in method" value="On-device account" />
            <DetailRow label="Password" value="Managed on this device" />
            <DetailRow label="Active session" value="This device" />
          </View>
          <Text style={styles.note}>
            Your BoardPoint account is secured on this device. You&apos;ll be asked to sign in
            again if your session expires.
          </Text>
        </>
      ) : null}

      {section === 'notifications' ? (
        <View style={styles.panel}>
          <ToggleRow
            label="Rent reminders"
            helper="A nudge before your rent is due"
            value={prefs.rentReminders}
            onChange={updatePref('rentReminders')}
          />
          <ToggleRow
            label="Maintenance updates"
            helper="Changes to your reported issues"
            value={prefs.maintenanceUpdates}
            onChange={updatePref('maintenanceUpdates')}
          />
          <ToggleRow
            label="Billing & receipts"
            helper="When bills are ready and payments clear"
            value={prefs.billingReceipts}
            onChange={updatePref('billingReceipts')}
          />
        </View>
      ) : null}

      {section === 'help' ? (
        <>
          <View style={styles.panel}>
            <SettingRow
              icon="notifications-outline"
              label="Go to notifications"
              supporting="Bills, maintenance and rent updates"
              onPress={() => router.push(routes.renterAlerts)}
            />
            <SettingRow
              icon="construct-outline"
              label="Report a maintenance issue"
              supporting="Tell your landlord what needs fixing"
              onPress={() => router.push(routes.renterMaintenance)}
            />
            <SettingRow
              icon="card-outline"
              label="Bills & payments"
              supporting="Review balances and past receipts"
              onPress={() => router.push(routes.renterBills)}
            />
          </View>
          <Text style={styles.note}>
            For anything urgent, reach out to your landlord directly — they&apos;ll get your
            maintenance updates right away.
          </Text>
        </>
      ) : null}
    </ScreenContainer>
  );
}
