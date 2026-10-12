import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/landlord/BrandHeader';
import { authService, useAuthSession } from '@/services/auth';
import { landlordMockListings } from '@/data/mock';
import { routes } from '@/routes';
import { landlordColors } from '@/theme';
import { formatNumber } from '@/utils/date';
import { styles } from './LandlordDashboardScreen.styles';

const TOTAL_UNITS = landlordMockListings.reduce((sum, listing) => sum + listing.totalUnits, 0);
const OCCUPIED_UNITS = landlordMockListings.reduce(
  (sum, listing) => sum + listing.occupiedUnits,
  0
);
const OCCUPANCY = Math.round((OCCUPIED_UNITS / TOTAL_UNITS) * 100);

export default function LandlordDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  if (!session) return null;

  const { fullName, email, username } = session.user;
  const firstName = fullName.split(' ')[0] || username;

  const stats = [
    { icon: 'business-outline', value: String(landlordMockListings.length), key: 'Listings' },
    { icon: 'key-outline', value: `${OCCUPIED_UNITS}/${TOTAL_UNITS}`, key: 'Units rented' },
    { icon: 'pulse-outline', value: `${OCCUPANCY}%`, key: 'Occupancy' },
  ] as const;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.decorativeShape} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 24 },
        ]}
        bounces={false}
      >
        <View style={styles.inner}>
          <BrandHeader />

          <View style={styles.card}>
            <Text style={styles.greeting}>Welcome back, {firstName}.</Text>
            <Text style={styles.subtitle}>
              Manage your boarding-house listings, units and occupancy from one place.
            </Text>
          </View>

          <View style={styles.stats}>
            {stats.map((stat) => (
              <View key={stat.key} style={styles.stat}>
                <View style={styles.statIcon}>
                  <Ionicons name={stat.icon} size={16} color="#C17D3F" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statKey}>{stat.key}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push(routes.landlordListSpace)}
            accessibilityRole="button"
            accessibilityLabel="List a new room"
            style={({ pressed }) => [styles.listCta, pressed && styles.listCtaPressed]}
          >
            <View style={styles.listCtaIcon}>
              <Ionicons name="add-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.listCtaCopy}>
              <Text style={styles.listCtaTitle}>List a new space</Text>
              <Text style={styles.listCtaDetail}>
                Submit a property for verification to start renting it out.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.sectionLabel}>YOUR LISTINGS</Text>

          <View style={styles.listings}>
            {landlordMockListings.slice(0, 3).map((listing) => (
              <View key={listing.id} style={styles.listing}>
                <View style={styles.listingIcon}>
                  <Ionicons name="home-outline" size={22} color="#C17D3F" />
                </View>
                <View style={styles.listingCopy}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {listing.propertyName}
                  </Text>
                  <Text style={styles.listingMeta} numberOfLines={1}>
                    {listing.occupiedUnits}/{listing.totalUnits} units · ₱
                    {formatNumber(String(listing.monthlyRent))}/mo
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{listing.status}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.card}>
            <View style={styles.accountRow}>
              <Ionicons name="person-outline" size={18} color={landlordColors.textSecondary} />
              <View style={styles.accountCopy}>
                <Text style={styles.accountValue}>{fullName}</Text>
                <Text style={styles.accountKey}>Name</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Ionicons name="mail-outline" size={18} color={landlordColors.textSecondary} />
              <View style={styles.accountCopy}>
                <Text style={styles.accountValue}>{email}</Text>
                <Text style={styles.accountKey}>Email</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Ionicons name="at-outline" size={18} color={landlordColors.textSecondary} />
              <View style={styles.accountCopy}>
                <Text style={styles.accountValue}>{username}</Text>
                <Text style={styles.accountKey}>Username</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => void handleSignOut()}
            disabled={signingOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of your BoardPoint account"
            accessibilityState={{ disabled: signingOut, busy: signingOut }}
            style={({ pressed }) => [
              styles.signOut,
              pressed && !signingOut && styles.signOutPressed,
              signingOut && styles.signOutDisabled,
            ]}
          >
            <Ionicons name="log-out-outline" size={18} color={landlordColors.textPrimary} />
            <Text style={styles.signOutLabel}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}