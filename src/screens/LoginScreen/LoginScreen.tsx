import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { useSignIn } from '@/hooks/useSignIn';
import { styles } from './LoginScreen.styles';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    rememberMe,
    toggleRememberMe,
    submitting,
    googleLoading,
    errorMessage,
    canSubmit,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleSignUp,
  } = useSignIn();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.decorativeCircle} />

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
                onToggleRemember={toggleRememberMe}
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
