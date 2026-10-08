import {
  useState } from 'react';
import { Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader/BrandHeader';
import { authService,
  useAuthSession } from '@/services/auth';
import { routes } from '@/routes';
import { colors
} from '@/theme';
import { styles } from './HomeScreen.styles';

const HIGHLIGHTS = [
  { icon: 'business-outline', title: 'Properties', detail: 'Track buildings, units and occupancy.' },
  { icon: 'people-outline', title: 'Tenants', detail: 'Keep leases and contacts in one place.' },
  { icon: 'card-outline', title: 'Payments', detail: 'See rent collection at a glance.' },
] as const;

export default function HomeScreen() {
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
              You’re signed in to BoardPoint. Your rental operations workspace is ready below.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(routes.preferences)}
            accessibilityRole="button"
            accessibilityLabel="Set your room preferences"
            style={({ pressed }) => [styles.preferencesCta, pressed && styles.preferencesCtaPressed]}
          >
            <View style={styles.preferencesIcon}>
              <Ionicons name="options-outline" size={20} color={colors.onPrimary} />
            </View>
            <View style={styles.preferencesCopy}>
              <Text style={styles.preferencesTitle}>Set your room preferences</Text>
              <Text style={styles.preferencesDetail}>
                Tell us what you need — we&apos;ll match rooms against your checklist.
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
          </Pressable>

          <Text style={styles.sectionLabel}>YOUR WORKSPACE</Text>

          <View style={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <View key={item.title} style={styles.highlight}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.highlightCopy}>
                  <Text style={styles.highlightTitle}>{item.title}</Text>
                  <Text style={styles.highlightDetail}>{item.detail}</Text>
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


