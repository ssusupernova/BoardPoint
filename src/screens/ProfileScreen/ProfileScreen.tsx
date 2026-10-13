import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileAvatar } from '@/components/common/ProfileAvatar/ProfileAvatar';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { DetailRow } from '@/components/renter/settings/DetailRow/DetailRow';
import { SettingRow } from '@/components/renter/settings/SettingRow/SettingRow';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { renterProfile } from '@/data/mock';
import { routes } from '@/routes';
import { authService, useAuthSession } from '@/services/auth';
import { useRenterContact } from '@/services/profile';
import { activeTenancy, isVerifiedRenter, useRentalRequestsState } from '@/services/rentalRequests';
import { MONTH_ABBRS, parseISODate } from '@/utils/date';
import { formatPeso } from '@/utils/currency';
import { styles } from './ProfileScreen.styles';

function formatLeasePeriod(startIso: string, endIso: string): string {
  const start = parseISODate(startIso);
  const end = parseISODate(endIso);
  if (!start || !end) return '';
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = `${start.getDate()} ${MONTH_ABBRS[start.getMonth()]}${
    sameYear ? '' : ` ${start.getFullYear()}`
  }`;
  const endLabel = `${end.getDate()} ${MONTH_ABBRS[end.getMonth()]} ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

function ordinal(day: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = day % 100;
  return `${day}${suffixes[(value - 20) % 10] ?? suffixes[value] ?? suffixes[0]}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const contact = useRenterContact();
  const { requests, ready } = useRentalRequestsState();
  const [signingOut, setSigningOut] = useState(false);

  if (!session) return null;

  const fullName = session.user.fullName || renterProfile.fullName;
  const email = session.user.email || renterProfile.email;
  const verified = isVerifiedRenter(requests);
  const tenancy = activeTenancy(requests);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <RenterScreen
      active="profile"
      title="Your profile"
      subtitle="Keep your details and tenancy up to date."
    >
      <View style={styles.hero}>
        <ProfileAvatar name={fullName} size={76} />
        <Text style={styles.name}>{fullName}</Text>
        {ready ? (
          <View style={styles.verifyBadge}>
            <StatusBadge
              text={verified ? 'Active renter' : 'Not yet verified'}
              variant={verified ? 'success' : 'neutral'}
              dot
            />
          </View>
        ) : null}
        <Text style={styles.memberSince}>{renterProfile.memberSince}</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Personal details"
          actionLabel="Edit"
          onAction={() => router.push(routes.renterProfileEdit)}
        />
        <View style={styles.panel}>
          <DetailRow label="Full name" value={fullName} />
          <DetailRow label="Email" value={email} />
          <DetailRow label="Mobile" value={contact.mobile} />
          <DetailRow label="Emergency contact" value={contact.emergencyContact} />
        </View>
      </View>

      {ready && verified && tenancy ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <SectionHeader title="Your tenancy" />
            <StatusBadge text={tenancy.status} variant="success" dot />
          </View>
          <View style={styles.panel}>
            <Text style={styles.tenancyName}>{tenancy.propertyName}</Text>
            <Text style={styles.tenancyUnit}>
              {tenancy.unitLabel} · {tenancy.address}
            </Text>

            <View style={styles.divider} />

            <DetailRow
              label="Lease period"
              value={formatLeasePeriod(tenancy.leaseStartedAt, tenancy.leaseEndsAt)}
            />
            <DetailRow label="Monthly rent" value={formatPeso(tenancy.monthlyRent)} />
            <DetailRow
              label="Security deposit"
              value={tenancy.depositHeld != null ? formatPeso(tenancy.depositHeld) : '—'}
            />
            <DetailRow
              label="Rent due"
              value={tenancy.rentDueDay ? `${ordinal(tenancy.rentDueDay)} of each month` : '—'}
            />

            <View style={styles.renewal}>
              <Text style={styles.renewalTitle}>Renewal awaiting confirmation</Text>
              <Text style={styles.renewalText}>
                Your lease ends {formatLeasePeriod(tenancy.leaseStartedAt, tenancy.leaseEndsAt)}
                . Contact your landlord to discuss your next stay.
              </Text>
            </View>

            <OutlineButton
              label="View lease agreement"
              icon="document-text-outline"
              onPress={() => router.push(routes.renterTenancy)}
              accessibilityLabel="View lease agreement"
            />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Your search" />
        <View style={styles.panel}>
          <SettingRow
            icon="list-outline"
            label="My room requests"
            onPress={() => router.push(routes.renterApplications)}
          />
          <SettingRow
            icon="options-outline"
            label="Room preferences"
            onPress={() => router.push(routes.preferences)}
          />
          <SettingRow
            icon="sparkles-outline"
            label="Recommended rooms"
            onPress={() => router.push(routes.renterRecommended)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Account & support" />
        <View style={styles.panel}>
          <SettingRow
            icon="shield-checkmark-outline"
            label="Password & security"
            onPress={() => router.push(routes.renterSetting('password'))}
          />
          <SettingRow
            icon="notifications-outline"
            label="Notification preferences"
            onPress={() => router.push(routes.renterSetting('notifications'))}
          />
          <SettingRow
            icon="help-circle-outline"
            label="Help & support"
            onPress={() => router.push(routes.renterSetting('help'))}
          />
        </View>
      </View>

      <View style={styles.signOut}>
        <OutlineButton
          label={signingOut ? 'Signing out…' : 'Sign out'}
          icon="log-out-outline"
          onPress={() => void handleSignOut()}
          disabled={signingOut}
          accessibilityLabel="Sign out of your BoardPoint account"
        />
      </View>
    </RenterScreen>
  );
}
