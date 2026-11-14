import { dashboardForRole, routes } from '@/routes';
import { authService } from '@/services/auth';
import { toErrorMessage } from '@/utils/errors';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignUpRole = 'renter' | 'landlord';

/** Sign-up form state and side effects, kept out of the SignUpScreen view. */
export function useSignUp(role: SignUpRole) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = useCallback((): string | null => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username.trim())) {
      return 'Username must be 3-30 characters using letters, numbers, dots, underscores, or hyphens.';
    }
    if (!email.trim()) return 'Please enter your email address.';
    if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Your password must be at least 8 characters long.';
    if (password !== confirmPassword) return 'Your passwords do not match.';
    return null;
  }, [fullName, username, email, password, confirmPassword]);

  const handleCreateAccount = useCallback(async () => {
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const session = await authService.signUp({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      if (!session) {
        router.replace(role === 'landlord' ? routes.landlordVerificationStart : routes.signIn);
        if (role !== 'landlord') {
          Alert.alert(
            'Check your email',
            'Your account was created. Confirm your email address, then sign in.',
          );
        }
        return;
      }
      const firstName = session.user.fullName.split(' ')[0];

      if (session.user.role === 'landlord') {
        // Landlords start with verification; Add Property comes after review.
        // The session was already established by signUp, so go straight there.
        router.replace(routes.landlordVerification);
        Alert.alert(
          'Account created',
          `Welcome to BoardPoint, ${firstName}! Submit your details so our team can review your landlord account.`
        );
      } else {
        router.replace(dashboardForRole('renter'));
        Alert.alert(
          'Account created',
          `Welcome to BoardPoint, ${firstName}! Your account is ready.`
        );
      }
    } catch (err) {
      Alert.alert('Unable to create account', toErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [validate, fullName, username, email, password, role]);

  const handleGoogleSignUp = useCallback(async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
      router.replace(dashboardForRole(undefined));
    } catch (err) {
      Alert.alert('Unable to continue with Google', toErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  return {
    fullName,
    setFullName,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    submitting,
    googleLoading,
    errorMessage,
    handleCreateAccount,
    handleGoogleSignUp,
  };
}
