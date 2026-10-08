export { default } from '@/screens/SignUpScreen/SignUpScreen';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { LoginButton } from '@/components/auth/LoginButton';
import { LoginInput } from '@/components/auth/LoginInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SignupPrompt } from '@/components/auth/SignupPrompt';
import { SocialDivider } from '@/components/auth/SocialDivider';
import { WelcomeHeader } from '@/components/auth/WelcomeHeader';
import { routes } from '@/routes';
import { authService } from '@/services/auth';
import { colors, radii, spacing } from '@/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '../../components/auth/BrandHeader';
import { ErrorBanner } from '../../components/auth/ErrorBanner';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = params.role === 'landlord' ? 'landlord' : 'renter';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    !submitting &&
    !googleLoading &&
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email address.';
    if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Your password must be at least 8 characters long.';
    if (password !== confirmPassword) return 'Your passwords do not match.';
    return null;
  };

  const handleCreateAccount = async () => {
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await authService.signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace(routes.home);
    } catch (err) {
      Alert.alert('Unable to create account', toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
      router.replace(routes.home);
    } catch (err) {
      Alert.alert('Unable to continue with Google', toErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

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
  roleBadgeRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: '#F5ECE0',
    borderWidth: 1,
    borderColor: '#E8DCCC',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleBadgeChange: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  welcome: {
    marginTop: spacing.md,
  },
  fields: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
});
