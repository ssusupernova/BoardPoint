import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ProfileAvatar } from '@/components/common/ProfileAvatar/ProfileAvatar';
import { RenterScreen } from '@/components/renter/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { routes } from '@/routes';
import { authService, useAuthSession } from '@/services/auth';
import { colors } from '@/theme';
import { styles } from './ProfileScreen.styles';

const LINKS = [
  { icon: 'options-outline', label: 'Room preferences', route: routes.preferences },
  { icon: 'home-outline', label: 'Tenancy details', route: routes.renterTenancy },
  { icon: 'card-outline', label: 'Bills & payment', route: routes.renterBills },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  if (!session) return null;

  const { fullName, email, username } = session.user;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authService.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <RenterScreen active="profile">
      <PageHeader title="Profile" />

      <View style={styles.card}>
        <ProfileAvatar name={fullName} size={76} />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.username}>@{username}</Text>
        <View style={styles.badgeWrap}>
          <StatusBadge text="Renter" variant="info" dot />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Account" />
        <View style={styles.panel}>
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
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick links" />
        <View style={styles.list}>
          {LINKS.map((link) => (
            <Pressable
              key={link.label}
              onPress={() => router.push(link.route)}
              accessibilityRole="button"
              accessibilityLabel={link.label}
              style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={link.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
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
        <Text style={styles.signOutLabel}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
      </Pressable>
    </RenterScreen>
  );
}
