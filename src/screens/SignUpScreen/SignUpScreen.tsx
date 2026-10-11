import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/auth/BrandHeader/BrandHeader';
import { WelcomeHeader } from '@/components/auth/WelcomeHeader/WelcomeHeader';
import { LoginInput } from '@/components/auth/LoginInput/LoginInput';
import { PasswordInput } from '@/components/auth/PasswordInput/PasswordInput';
import { ErrorBanner } from '@/components/auth/ErrorBanner/ErrorBanner';
import { LoginButton } from '@/components/auth/LoginButton/LoginButton';
import { SocialDivider } from '@/components/auth/SocialDivider/SocialDivider';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton/GoogleLoginButton';
import { SignupPrompt } from '@/components/auth/SignupPrompt/SignupPrompt';
import { useSignUp, type SignUpRole } from '@/hooks/useSignUp';
import { colors } from '@/theme';
import { routes } from '@/routes';
import { styles } from './SignUpScreen.styles';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();
  const role: SignUpRole = params.role === 'landlord' ? 'landlord' : 'renter';

  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    googleLoading,
    errorMessage,
    canSubmit,
    handleCreateAccount,
    handleGoogleSignUp,
  } = useSignUp(role);

  const handleBackToLogin = () => {
    router.replace(routes.signIn);
  };

  const handleChangeRole = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.chooseRole);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.decorativeCircle} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.inner}>
            <BrandHeader />

            <View style={styles.roleBadgeRow}>
              <Pressable
                onPress={handleChangeRole}
                accessibilityRole="button"
                accessibilityLabel={`Signing up as ${role}. Tap to change role.`}
                style={styles.roleBadge}
              >
                <Ionicons
                  name={role === 'landlord' ? 'home-outline' : 'briefcase-outline'}
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.roleBadgeText}>
                  Signing up as {role === 'landlord' ? 'Landlord' : 'Renter'}
                </Text>
                <Text style={styles.roleBadgeChange}>Change</Text>
              </Pressable>
            </View>

            <View style={styles.welcome}>
              <WelcomeHeader
                lines={[
                  'Create Your',
                  role === 'landlord' ? 'Landlord Account.' : 'BoardPoint Account.',
                ]}
                subtitle={
                  role === 'landlord'
                    ? 'Set up your landlord account to start managing and listing boarding-houses.'
                    : 'Set up your account to start mapping rental operations in minutes.'
                }
              />
            </View>

            <View style={styles.fields}>
              <LoginInput
                label="Full name"
                placeholder="Enter your full name"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
                textContentType="name"
                autoComplete="name"
                returnKeyType="next"
              />

              <LoginInput
                label="Email address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="next"
              />

              <PasswordInput
                label="Confirm password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={() => void handleCreateAccount()}
              />
            </View>

            {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

            <View style={styles.actions}>
              <LoginButton
                onPress={() => void handleCreateAccount()}
                loading={submitting}
                disabled={googleLoading || !canSubmit}
              />
              <SocialDivider />
              <GoogleLoginButton
                onPress={() => void handleGoogleSignUp()}
                loading={googleLoading}
                disabled={submitting}
              />
            </View>

            <View style={styles.spacer} />

            <SignupPrompt
              prompt="Already have an account?"
              actionLabel="Log in"
              onAction={handleBackToLogin}
              disabled={submitting || googleLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
