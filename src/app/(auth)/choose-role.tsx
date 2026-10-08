import { routes } from '@/routes';
import { colors, radii, spacing } from '@/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { RoleCard, type UserRole } from '@/components/auth/RoleCard';
import { SignupPrompt } from '@/components/auth/SignupPrompt';

export default function ChooseRoleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');

  const handleContinue = () => {
    router.push({
      pathname: '/sign-up' as any,
      params: { role: selectedRole },
    });
  };

  const handleBackToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.signIn);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {/* Top-right subtle light blue decorative circle */}
      <View pointerEvents="none" style={styles.decorativeTopRight} />
      {/* Bottom-left subtle warm peach decorative circle */}
      <View pointerEvents="none" style={styles.decorativeBottomLeft} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 26,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.inner}>
          <BrandHeader />

          <View style={styles.heading}>
            <Text style={styles.title}>Find Your Place.</Text>
            <Text style={styles.title}>Build Your Space.</Text>
            <Text style={styles.subtitle}>
              Whether you&apos;re looking for a place to stay or listing a space
              to rent, BoardPoint connects you with the right opportunities.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>I am a</Text>
            <View style={styles.rolesRow}>
              <RoleCard
                role="renter"
                title="RENTER"
                selected={selectedRole === 'renter'}
                onPress={() => setSelectedRole('renter')}
                accessibilityLabel="Choose Renter account"
              />

              <RoleCard
                role="landlord"
                title="LANDLORD"
                selected={selectedRole === 'landlord'}
                onPress={() => setSelectedRole('landlord')}
                accessibilityLabel="Choose Landlord account"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel={`Continue sign up as ${selectedRole}`}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>
                {selectedRole === 'landlord'
                  ? 'Continue as Landlord'
                  : 'Continue as Renter'}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.onPrimary}
              />
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <SignupPrompt
            prompt="Already have an account?"
            actionLabel="Log in"
            onAction={handleBackToLogin}
          />
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
  decorativeTopRight: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.decorativeCircle,
  },
  decorativeBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F5E6D3',
    opacity: 0.85,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flex: 1,
  },
  heading: {
    marginTop: spacing.xxl + 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 34,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actions: {
    marginTop: spacing.xl,
  },
  continueButton: {
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  continueButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
});
