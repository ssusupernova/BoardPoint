import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { RoleCard, type UserRole } from '@/components/auth/RoleCard';
import { SignupPrompt } from '@/components/auth/SignupPrompt';
import { colors } from '@/theme';
import { routes } from '@/routes';
import { styles } from './ChooseRoleScreen.styles';

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
      <View style={styles.decorativeTopRight} />
      <View style={styles.decorativeBottomLeft} />

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
              <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
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
