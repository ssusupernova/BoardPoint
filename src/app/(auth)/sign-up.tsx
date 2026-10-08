import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { WelcomeHeader } from '@/components/auth/WelcomeHeader';
import { LoginInput } from '@/components/auth/LoginInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { ErrorBanner } from '@/components/auth/ErrorBanner';
import { LoginButton } from '@/components/auth/LoginButton';
import { SocialDivider } from '@/components/auth/SocialDivider';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { SignupPrompt } from '@/components/auth/SignupPrompt';
import { authService } from '@/services/auth';
import { colors, spacing } from '@/theme';
import { routes } from '@/routes';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.signIn);
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

            <View style={styles.welcome}>
              <WelcomeHeader
                lines={['Create Your', 'BoardPoint Account.']}
                subtitle="Set up your account to start mapping rental operations in minutes."
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
  welcome: {
    marginTop: spacing.xxl,
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
