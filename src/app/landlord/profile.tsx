import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { routes } from '@/routes';
import { authService, useAuthSession } from '@/services/auth';
import { useLandlordSummary } from '@/services/landlordData';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileStyles } from '../../styles/landlord/profile.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';


export default function LandlordProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const summary = useLandlordSummary();
  const [signingOut, setSigningOut] = useState(false);

  const fullName = session?.user?.fullName || 'Jamie Dela Cruz';
  const email = session?.user?.email || 'jamie.landlord@boardpoint.app';
  const username = session?.user?.username || 'jamie_owner';
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your BoardPoint landlord account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await authService.signOut();
            } finally {
              setSigningOut(false);
            }
          },
        },
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
              <Text style={styles.brandSubtitle}>ACCOUNT & PROPERTY MANAGEMENT</Text>
            </View>
          </View>

          {/* Profile Card */}
          <View style={styles.greetingCard}>
            <View style={profileStyles.heroRow}>
              <View style={profileStyles.avatarContainer}>
                <Text style={profileStyles.avatarText}>{initials}</Text>
              </View>
              <View style={profileStyles.heroCopy}>
                <Text style={styles.greetingTitle}>{fullName}</Text>
                <Text style={profileStyles.heroEmail}>
                  @{username} · {email}
                </Text>
              </View>
            </View>

            <View style={profileStyles.badgesRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>✓ Verified Owner</Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>
                  {summary.totalProperties} Active{' '}
                  {summary.totalProperties === 1 ? 'Listing' : 'Listings'}
                </Text>
              </View>
            </View>
          </View>

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

          {/* Operations Menu */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operations</Text>
          </View>

          <View style={styles.cardItem}>
            <Pressable
              onPress={() => router.push(routes.landlordAddProperty)}
              style={({ pressed }) => [
                profileStyles.menuItem,
                pressed && profileStyles.menuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="List a new boarding space"
            >
              <View style={profileStyles.menuIcon}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </View>
              <View style={profileStyles.menuTextContainer}>
                <Text style={profileStyles.menuTitle}>List a New Space</Text>
                <Text style={profileStyles.menuSubtitle}>
                  Submit rooms or buildings for verification
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={LANDLORD_THEME.textMuted} />
            </Pressable>

            <View style={profileStyles.menuDivider} />

            <Pressable
              onPress={() => router.push(routes.landlordBills)}
              style={({ pressed }) => [
                profileStyles.menuItem,
                pressed && profileStyles.menuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Rental bills and due dates"
            >
              <View style={[profileStyles.menuIcon, profileStyles.menuIconBlue]}>
                <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={profileStyles.menuTextContainer}>
                <Text style={profileStyles.menuTitle}>Rental Bills & Due Dates</Text>
                <Text style={profileStyles.menuSubtitle}>
                  Track tenant monthly rent bills and payment due dates
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={LANDLORD_THEME.textMuted} />
            </Pressable>

            <View style={profileStyles.menuDivider} />

            <Pressable
              onPress={() => router.push(routes.landlordNotificationSettings)}
              style={({ pressed }) => [
                profileStyles.menuItem,
                pressed && profileStyles.menuItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notification settings"
            >
              <View style={[profileStyles.menuIcon, profileStyles.menuIconBrown]}>
                <Ionicons name="notifications" size={18} color="#FFFFFF" />
              </View>
              <View style={profileStyles.menuTextContainer}>
                <Text style={profileStyles.menuTitle}>Notification Alerts</Text>
                <Text style={profileStyles.menuSubtitle}>
                  Choose which in-app alerts you receive
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={LANDLORD_THEME.textMuted} />
            </Pressable>
          </View>

          {/* Account Actions */}
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
