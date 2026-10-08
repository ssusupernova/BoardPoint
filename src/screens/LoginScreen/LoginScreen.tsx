import {
  useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/auth/BrandHeader/BrandHeader';
import { WelcomeHeader } from '@/components/auth/WelcomeHeader/WelcomeHeader';
import { LoginInput } from '@/components/auth/LoginInput/LoginInput';
import { PasswordInput } from '@/components/auth/PasswordInput/PasswordInput';
import { RememberForgotRow } from '@/components/auth/RememberForgotRow/RememberForgotRow';
import { ErrorBanner } from '@/components/auth/ErrorBanner/ErrorBanner';
import { LoginButton } from '@/components/auth/LoginButton/LoginButton';
import { SocialDivider } from '@/components/auth/SocialDivider/SocialDivider';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton/GoogleLoginButton';
import { SignupPrompt } from '@/components/auth/SignupPrompt/SignupPrompt';
import { authService } from '@/services/auth';

import { routes } from '@/routes';
import { styles } from './LoginScreen.styles';

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    !submitting && !googleLoading && identifier.trim().length > 0 && password.length > 0;

  const runLogin = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await authService.signIn({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });
      router.replace(routes.home);
    } catch (err) {
      Alert.alert('Unable to sign in', toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    void runLogin();
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      await authService.signInWithGoogle();
      // TODO(auth): replace with an authenticated home route once OAuth returns a session.
      Alert.alert('Welcome back', 'You will be taken to your BoardPoint dashboard.');
    } catch (err) {
      Alert.alert('Unable to continue with Google', toErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!identifier.trim()) {
      setErrorMessage('Enter your email or username above, then tap “Forgot password?”.');
      return;
    }
    setErrorMessage(null);
    void authService
      .resetPassword(identifier.trim())
      .then(() => {
        Alert.alert(
          'Password reset sent',
          'Check your inbox for instructions to reset your password.'
        );
      })
      .catch((err) => {
        Alert.alert('Password recovery', toErrorMessage(err));
      });
  };

  const handleSignUp = () => {
    router.push(routes.signUp);
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
              <WelcomeHeader />
            </View>

            <View style={styles.fields}>
              <LoginInput
                label="Email or username"
                placeholder="Enter your email or username"
                value={identifier}
                onChangeText={setIdentifier}
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                textContentType="password"
                onSubmitEditing={handleLogin}
              />

              <RememberForgotRow
                rememberMe={rememberMe}
                onToggleRemember={() => setRememberMe((v) => !v)}
                onForgotPassword={handleForgotPassword}
              />
            </View>

            {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

            <View style={styles.actions}>
              <LoginButton
                onPress={handleLogin}
                loading={submitting}
                disabled={googleLoading || !canSubmit}
              />
              <SocialDivider />
              <GoogleLoginButton
                onPress={() => void handleGoogleLogin()}
                loading={googleLoading}
                disabled={submitting}
              />
            </View>

            <View style={styles.spacer} />

            <SignupPrompt onAction={handleSignUp} disabled={submitting || googleLoading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

