import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader/BrandHeader';
import { authService, useAuthSession } from '@/services/auth';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { colors } from '@/theme';
import { formatNumber } from '@/utils/date';
import { styles } from './RenterDashboardScreen.styles';

const STATS = [
  { icon: 'grid-outline', value: '24', key: 'Matches' },
  { icon: 'bookmark-outline', value: '6', key: 'Saved' },
  { icon: 'calendar-outline', value: '2', key: 'Tours' },
] as const;

export default function RenterDashboardScreen() {
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.decorativeCircle} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 },
        ]}
        bounces={false}
      >
        <View style={styles.inner}>
          <BrandHeader />

          <View style={styles.card}>
            <Text style={styles.greeting}>Welcome back, {firstName}.</Text>
            <Text style={styles.subtitle}>
              Here are rooms we matched against your preferences. Update your checklist to
              see more relevant places.
            </Text>
          </View>

          <View style={styles.stats}>
            {STATS.map((stat) => (
              <View key={stat.key} style={styles.stat}>
                <View style={styles.statIcon}>
                  <Ionicons name={stat.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statKey}>{stat.key}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push(routes.preferences)}
            accessibilityRole="button"
            accessibilityLabel="Update your room preferences"
            style={({ pressed }) => [styles.preferencesCta, pressed && styles.preferencesCtaPressed]}
          >
            <View style={styles.preferencesIcon}>
              <Ionicons name="options-outline" size={20} color={colors.onPrimary} />
            </View>
            <View style={styles.preferencesCopy}>
              <Text style={styles.preferencesTitle}>Update room preferences</Text>
              <Text style={styles.preferencesDetail}>
                Refine your checklist to get better room matches.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
          </Pressable>

          <Text style={styles.sectionLabel}>MATCHED ROOMS</Text>

          <View style={styles.rooms}>
            {renterMockRooms.slice(0, 3).map((room) => (
              <View key={room.id} style={styles.room}>
                <View style={styles.roomIcon}>
                  <Ionicons name="bed-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.roomCopy}>
                  <Text style={styles.roomTitle} numberOfLines={1}>
                    {room.title}
                  </Text>
                  <Text style={styles.roomMeta} numberOfLines={1}>
                    {room.area} · {room.distanceKm} km away
                  </Text>
                  <Text style={styles.price}>₱{formatNumber(String(room.price))}/mo</Text>
                </View>
                <View style={styles.matchPill}>
                  <Text style={styles.matchPillText}>{room.matchPercent}% match</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.card}>
            <View style={styles.accountRow}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <View style={styles.accountCopy}>
                <Text style={styles.accountValue}>{fullName}</Text>
                <Text style={styles.accountKey}>Name</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <View style={styles.accountCopy}>
                <Text style={styles.accountValue}>{email}</Text>
                <Text style={styles.accountKey}>Email</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Ionicons name="at-outline" size={18} color={colors.textSecondary} />
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
            <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.signOutLabel}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}