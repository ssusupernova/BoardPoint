import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { loadChecklist } from '@/services/checklist';
import { dashboardForRole, routes } from '@/routes';
import { toErrorMessage } from '@/utils/errors';
import type { UserRole } from '@/services/auth';

/** Where a signed-in role lands after auth. */
export function homeForRole(role: UserRole) {
  if (role === 'super_admin') return routes.admin;
  if (role === 'user') return routes.home;
  return dashboardForRole(role);
}

/** Sign-in form state and side effects, kept out of the LoginScreen view. */
export function useSignIn() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      !submitting &&
      !googleLoading &&
      identifier.trim().length > 0 &&
      password.length > 0,
    [submitting, googleLoading, identifier, password]
  );

  const runLogin = useCallback(async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const session = await authService.signIn({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });
      if (session.user.role === 'renter') {
        // First-time renters complete the preferences checklist before landing
        // on the dashboard; returning renters go straight home.
        const checklist = await loadChecklist(session.user.id);
        router.replace(checklist ? routes.renterDashboard : routes.preferences);
      } else {
        router.replace(dashboardForRole(session.user.role));
      }
      router.replace(homeForRole(session.user.role));
    } catch (err) {
      Alert.alert('Unable to sign in', toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [identifier, password, rememberMe]);

  const handleLogin = useCallback(() => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    void runLogin();
  }, [identifier, password, runLogin]);

  const handleGoogleLogin = useCallback(async () => {
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
  }, []);

  const handleForgotPassword = useCallback(() => {
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
  }, [identifier]);

  const handleSignUp = useCallback(() => {
    router.push(routes.chooseRole);
  }, []);

  const toggleRememberMe = useCallback(() => setRememberMe((v) => !v), []);

  return {
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
  };
}
