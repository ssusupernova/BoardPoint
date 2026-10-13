import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { routes } from '@/routes';
import { authService, useAuthSession } from '@/services/auth';
import { useAccountStanding, useAccountProfile, useProfileDraft } from '@/services/accountProfile';
import { useLandlordSummary } from '@/services/landlordData';
import type { LandlordVerificationState } from '@/services/admin/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileStyles } from '../../styles/landlord/profile.styles';
import { accountStyles as acct } from '../../styles/landlord/account.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

type PillTone = 'verified' | 'pending' | 'urgent' | 'neutral';

const VERIFICATION_META: Record<
  LandlordVerificationState,
  { label: string; tone: PillTone; icon: keyof typeof Ionicons.glyphMap }
> = {
  verified: { label: 'Verified landlord', tone: 'verified', icon: 'checkmark-circle' },
  pending: { label: 'Verification in review', tone: 'pending', icon: 'time-outline' },
  resubmitted: { label: 'Verification in review', tone: 'pending', icon: 'time-outline' },
  info_requested: { label: 'Verification: action needed', tone: 'urgent', icon: 'alert-circle-outline' },
  rejected: { label: 'Verification needs attention', tone: 'urgent', icon: 'close-circle-outline' },
  unverified: { label: 'Not verified yet', tone: 'neutral', icon: 'ellipse-outline' },
};

function toneStyles(tone: PillTone): [object, object] {
  switch (tone) {
    case 'verified':
      return [acct.pillVerified, acct.pillVerifiedText];
    case 'pending':
      return [acct.pillPending, acct.pillPendingText];
    case 'urgent':
      return [acct.pillUrgent, acct.pillUrgentText];
    default:
      return [acct.pillNeutral, acct.pillNeutralText];
  }
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        profileStyles.menuItem,
        pressed && profileStyles.menuItemPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={profileStyles.menuIcon}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={profileStyles.menuTextContainer}>
        <Text style={profileStyles.menuTitle}>{title}</Text>
        <Text style={profileStyles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={LANDLORD_THEME.textMuted} />
    </Pressable>
  );
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '?'
  );
}

/**
 * Landlord account hub: profile details (photo, name, email, phone), the real
 * admin-verified account standing, and links to account settings. Sign-out asks
 * for confirmation, with a stronger warning while profile edits are unsaved.
 */
export default function LandlordProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const summary = useLandlordSummary();
  const [signingOut, setSigningOut] = useState(false);

  const userId = session?.user?.id ?? null;
  const accountProfile = useAccountProfile(userId);
  const draft = useProfileDraft(userId);
  const standing = useAccountStanding(session?.user?.email ?? null);

  const fullName = session?.user?.fullName || 'Landlord';
  const email = session?.user?.email || '';
  const username = session?.user?.username || '';
  const phone = accountProfile.phone;
  const suspended = standing.accountStatus === 'suspended';
  const verificationMeta = VERIFICATION_META[standing.verification];

  const doSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (draft) {
      Alert.alert(
        'Sign out with unsaved changes?',
        'Your profile edits haven’t been saved yet and will be lost if you sign out.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Keep Editing',
            onPress: () => router.push(routes.landlordProfileEdit),
          },
          {
            text: 'Discard & Sign Out',
            style: 'destructive',
            onPress: () => void doSignOut(),
          },
        ]
      );
      return;
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your BoardPoint landlord account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => void doSignOut() },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="person" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.brandTitle}>Landlord Profile</Text>
              <Text style={styles.brandSubtitle}>ACCOUNT & SETTINGS</Text>
            </View>
          </View>

          {/* Profile card */}
          <View style={styles.greetingCard}>
            <View style={profileStyles.heroRow}>
              <View style={acct.heroAvatar}>
                {accountProfile.photoUri ? (
                  <Image
                    source={{ uri: accountProfile.photoUri }}
                    style={acct.heroAvatarImage}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <Text style={acct.heroAvatarText}>{initialsOf(fullName)}</Text>
                )}
              </View>
              <View style={profileStyles.heroCopy}>
                <Text style={styles.greetingTitle}>{fullName}</Text>
                <Text style={profileStyles.heroEmail}>
                  {username ? `@${username} · ` : ''}
                  {email}
                </Text>
              </View>
            </View>

            {/* Detail rows */}
            <View style={acct.detailCard}>
              <View style={acct.detailRow}>
                <Text style={acct.detailLabel}>Phone</Text>
                <Text
                  style={[acct.detailValue, !phone && acct.detailValueMuted]}
                >
                  {phone || 'Not added yet'}
                </Text>
              </View>
              <View style={acct.detailRow}>
                <Text style={acct.detailLabel}>Account status</Text>
                <View
                  style={[
                    acct.pill,
                    suspended ? acct.pillUrgent : acct.pillPending,
                  ]}
                >
                  <Ionicons
                    name={suspended ? 'ban-outline' : 'shield-checkmark-outline'}
                    size={12}
                    color={suspended ? LANDLORD_THEME.badgeUrgentText : LANDLORD_THEME.badgePeachText}
                  />
                  <Text
                    style={[
                      suspended ? acct.pillUrgentText : acct.pillPendingText,
                    ]}
                  >
                    {suspended ? 'Suspended' : 'Active'}
                  </Text>
                </View>
              </View>
              <View style={acct.detailRow}>
                <Text style={acct.detailLabel}>Verification</Text>
                <View style={[acct.pill, toneStyles(verificationMeta.tone)[0]]}>
                  <Ionicons
                    name={verificationMeta.icon}
                    size={12}
                    color={
                      verificationMeta.tone === 'verified'
                        ? LANDLORD_THEME.badgeBlueText
                        : verificationMeta.tone === 'urgent'
                          ? LANDLORD_THEME.badgeUrgentText
                          : verificationMeta.tone === 'pending'
                            ? LANDLORD_THEME.badgePeachText
                            : LANDLORD_THEME.textSecondary
                    }
                  />
                  <Text style={toneStyles(verificationMeta.tone)[1]}>
                    {standing.loading ? 'Checking status…' : verificationMeta.label}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={acct.verificationNote}>
              Verification is reviewed by the BoardPoint team — it can’t be
              changed from this screen.
            </Text>

            <View style={profileStyles.badgesRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>
                  {summary.totalProperties} Active{' '}
                  {summary.totalProperties === 1 ? 'Listing' : 'Listings'}
                </Text>
              </View>
            </View>
          </View>

          {/* Suspended notice */}
          {suspended ? (
            <View style={acct.suspendedBanner}>
              <Ionicons name="alert-circle" size={18} color={LANDLORD_THEME.badgeUrgentText} />
              <Text style={acct.suspendedBannerText}>
                Your account is suspended
                {standing.suspensionReason ? `: ${standing.suspensionReason}` : '.'}{' '}
                Contact support if you have questions about this decision.
              </Text>
            </View>
          ) : null}

          {/* Unsaved profile edits */}
          {draft ? (
            <View style={acct.unsavedCard}>
              <Ionicons name="create-outline" size={18} color={LANDLORD_THEME.badgePeachText} />
              <Text style={acct.unsavedCardText}>
                You have unsaved profile changes.
              </Text>
              <Pressable
                onPress={() => router.push(routes.landlordProfileEdit)}
                style={({ pressed }) => [
                  acct.unsavedCardButton,
                  pressed && { opacity: 0.75 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue editing your profile"
              >
                <Text style={acct.unsavedCardButtonText}>Continue</Text>
              </Pressable>
            </View>
          ) : null}

          {/* Portfolio Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Rooms</Text>
              <Text style={styles.metricValue}>{summary.totalRooms}</Text>
              <Text style={styles.metricSub}>
                {summary.totalProperties}{' '}
                {summary.totalProperties === 1 ? 'property' : 'properties'}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Monthly Rent</Text>
              <Text style={[styles.metricValue, styles.metricValuePrimary]}>
                {summary.totalRooms > 0
                  ? `${Math.round(summary.monthlyRentRoll / 1000)}k`
                  : '—'}
              </Text>
              <Text style={styles.metricSub}>
                {summary.occupiedRooms} occupied
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Occupancy</Text>
              <Text style={styles.metricValue}>
                {summary.totalRooms > 0
                  ? `${Math.round((summary.occupiedRooms / summary.totalRooms) * 100)}%`
                  : '—'}
              </Text>
              <Text style={styles.metricSub}>
                {summary.totalRooms > 0
                  ? `${summary.occupiedRooms} of ${summary.totalRooms} rooms`
                  : 'No rooms yet'}
              </Text>
            </View>
          </View>

          {/* Account settings */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account settings</Text>
          </View>

          <View style={styles.cardItem}>
            <MenuRow
              icon="person-outline"
              title="Edit Profile"
              subtitle="Photo, name, email, and phone number"
              onPress={() => router.push(routes.landlordProfileEdit)}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="key-outline"
              title="Change Password"
              subtitle="Confirm your current password to change it"
              onPress={() => router.push(routes.landlordChangePassword)}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="notifications-outline"
              title="Notification Preferences"
              subtitle="Choose which in-app alerts you receive"
              onPress={() => router.push(routes.landlordNotificationSettings)}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="lock-closed-outline"
              title="Privacy Information"
              subtitle="How your account and listing data are handled"
              onPress={() => router.push(routes.landlordSetting('privacy'))}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="document-text-outline"
              title="Terms and Conditions"
              subtitle="The agreement for using BoardPoint"
              onPress={() => router.push(routes.landlordSetting('terms'))}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="help-circle-outline"
              title="Help and Support"
              subtitle="Contact support and common questions"
              onPress={() => router.push(routes.landlordSetting('help'))}
            />
          </View>

          {/* Operations */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operations</Text>
          </View>

          <View style={styles.cardItem}>
            <MenuRow
              icon="shield-checkmark-outline"
              title="Landlord Verification"
              subtitle="Submit your details for review by the admin team"
              onPress={() => router.push(routes.landlordVerification)}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="add"
              title="List a New Space"
              subtitle="Submit rooms or buildings for verification"
              onPress={() => router.push(routes.landlordAddProperty)}
            />
            <View style={profileStyles.menuDivider} />
            <MenuRow
              icon="receipt-outline"
              title="Rental Bills & Due Dates"
              subtitle="Track tenant monthly rent bills and payment due dates"
              onPress={() => router.push(routes.landlordBills)}
            />
          </View>

          {/* Sign out */}
          <View style={profileStyles.signOutContainer}>
            <Pressable
              onPress={handleSignOut}
              disabled={signingOut}
              style={({ pressed }) => [
                profileStyles.signOutButton,
                pressed && profileStyles.signOutButtonPressed,
                signingOut && profileStyles.signOutDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign out of your account"
            >
              <Ionicons name="log-out-outline" size={18} color={LANDLORD_THEME.primary} />
              <Text style={profileStyles.signOutText}>
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="profile" />
    </View>
  );
}
