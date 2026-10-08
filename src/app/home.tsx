import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { authService, useAuthSession } from '@/services/auth';
import { colors, radii, spacing } from '@/theme';

const HIGHLIGHTS = [
  { icon: 'business-outline', title: 'Properties', detail: 'Track buildings, units and occupancy.' },
  { icon: 'people-outline', title: 'Tenants', detail: 'Keep leases and contacts in one place.' },
  { icon: 'card-outline', title: 'Payments', detail: 'See rent collection at a glance.' },
] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -120,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.decorativeCircle,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: -spacing.xs,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.4,
  },
  highlights: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.surfacePressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCopy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  highlightDetail: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountCopy: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountKey: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  signOut: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  signOutPressed: {
    backgroundColor: colors.surfacePressed,
  },
  signOutDisabled: {
    opacity: 0.55,
  },
  signOutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
});
