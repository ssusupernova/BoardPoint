import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/auth';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { accountStyles as acct } from '@/styles/landlord/account.styles';
import { toErrorMessage } from '@/utils/errors';

type RowProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
};

function PasswordRow({ label, value, onChangeText, placeholder, error, show, onToggle }: RowProps) {
  return (
    <View style={acct.formGroup}>
      <Text style={acct.fieldLabel}>{label}</Text>
      <View style={[acct.field, error ? acct.fieldError : null]}>
        <Ionicons
          name="lock-closed-outline"
          size={17}
          color={LANDLORD_THEME.textMuted}
          style={acct.fieldIcon}
        />
        <TextInput
          style={acct.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LANDLORD_THEME.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
        />
        <Pressable
          onPress={onToggle}
          style={acct.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
        >
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={19}
            color={LANDLORD_THEME.textMuted}
          />
        </Pressable>
      </View>
      {error ? (
        <Text style={acct.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Change the account password. Requiring the current password is the
 * reauthentication step for this sensitive change; the new password is hashed
 * with a fresh salt and stored on-device.
 */
export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const cleared = { ...prev };
      delete cleared[key];
      return cleared;
    });

  const handleChange = async () => {
    const nextErrors: Record<string, string> = {};
    if (!current) nextErrors.current = 'Enter your current password.';
    if (next.length < 8) {
      nextErrors.next = 'Your new password must be at least 8 characters long.';
    }
    if (next && next === current) {
      nextErrors.next = 'Choose a password different from your current one.';
    }
    if (next !== confirm) nextErrors.confirm = 'Both entries of the new password must match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await authService.changePassword(current, next);
      Alert.alert(
        'Password changed',
        'Use your new password the next time you sign in.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (changeError) {
      Alert.alert("Couldn't change password", toErrorMessage(changeError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={acct.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                acct.headerBackBtn,
                pressed && acct.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={acct.headerTextCol}>
              <Text style={acct.headerTitle}>Change password</Text>
              <Text style={acct.headerSubtitle}>
                Confirm your current password, then choose a new one.
              </Text>
            </View>
          </View>

          <View style={[acct.infoCard, { marginTop: 18 }]}>
            <Text style={acct.infoCardBody}>
              For your security, changing your password always requires your
              current password. Passwords are stored on this device only.
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            <PasswordRow
              label="Current password"
              value={current}
              onChangeText={(text) => {
                setCurrent(text);
                clearError('current');
              }}
              placeholder="Enter current password"
              error={errors.current}
              show={showCurrent}
              onToggle={() => setShowCurrent((prev) => !prev)}
            />
            <PasswordRow
              label="New password"
              value={next}
              onChangeText={(text) => {
                setNext(text);
                clearError('next');
              }}
              placeholder="At least 8 characters"
              error={errors.next}
              show={showNext}
              onToggle={() => setShowNext((prev) => !prev)}
            />
            <PasswordRow
              label="Confirm new password"
              value={confirm}
              onChangeText={(text) => {
                setConfirm(text);
                clearError('confirm');
              }}
              placeholder="Re-enter new password"
              error={errors.confirm}
              show={showNext}
              onToggle={() => setShowNext((prev) => !prev)}
            />
          </View>

          <View style={{ marginTop: 22 }}>
            <Pressable
              onPress={() => void handleChange()}
              disabled={saving}
              style={({ pressed }) => [
                acct.primaryButton,
                pressed && acct.primaryButtonPressed,
                saving && acct.primaryButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Change password"
            >
              <Ionicons name="key-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={acct.primaryButtonText}>
                {saving ? 'Updating…' : 'Change Password'}
              </Text>
            </Pressable>
          </View>

          <Text style={[acct.helperText, { marginTop: 12 }]}>
            Email-based password recovery isn’t connected in this build. If you
            forget your password, contact support from the email on your account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
