import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  authService,
  useAuthSession,
} from '@/services/auth';
import {
  saveAccountProfile,
  setProfileDraft,
  useAccountProfile,
  useProfileDraft,
} from '@/services/accountProfile';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { accountStyles as acct } from '@/styles/landlord/account.styles';
import { toErrorMessage } from '@/utils/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  photoUri: string | null;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  showSecureToggle?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
  secureTextEntry,
  onToggleSecure,
  showSecureToggle,
}: FieldProps) {
  return (
    <View style={acct.formGroup}>
      <Text style={acct.fieldLabel}>{label}</Text>
      <View style={[acct.field, error ? acct.fieldError : null]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={LANDLORD_THEME.textMuted}
            style={acct.fieldIcon}
          />
        ) : null}
        <TextInput
          style={acct.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LANDLORD_THEME.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          accessibilityLabel={label}
        />
        {showSecureToggle ? (
          <Pressable
            onPress={onToggleSecure}
            style={acct.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={19}
              color={LANDLORD_THEME.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={acct.helperText}>{hint}</Text> : null}
      {error ? (
        <Text style={acct.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '?'
  );
}

/**
 * Edit the signed-in landlord's profile: photo, name, email, and phone.
 *
 * Changing the email requires the account password (reauthentication); the
 * name, phone, and photo are saved directly to the on-device account store.
 * Edits are mirrored into a draft so the account screen can warn before sign-out.
 */
export default function LandlordEditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const userId = session?.user?.id ?? null;
  const savedProfile = useAccountProfile(userId);
  const existingDraft = useProfileDraft(userId);
  const seededRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(() => ({
    fullName: existingDraft?.fullName ?? session?.user?.fullName ?? '',
    email: existingDraft?.email ?? session?.user?.email ?? '',
    phone: existingDraft?.phone ?? savedProfile.phone,
    photoUri: existingDraft?.photoUri ?? savedProfile.photoUri,
  }));
  const [password, setPassword] = useState('');

  // Account profile hydrates from storage after mount; adopt it once unless a
  // draft is already being resumed.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (seededRef.current) return;
      seededRef.current = true;
      if (existingDraft) return;
      setForm((prev) => ({
        ...prev,
        phone: prev.phone || savedProfile.phone,
        photoUri: prev.photoUri ?? savedProfile.photoUri,
      }));
    }, 0);
    return () => clearTimeout(timer);
  }, [savedProfile, existingDraft]);

  if (!session || !userId) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
      </View>
    );
  }

  const savedName = session.user.fullName;
  const savedEmail = session.user.email;
  const emailChanged =
    form.email.trim().toLowerCase() !== savedEmail.trim().toLowerCase();

  const markDraft = (next: FormState) => {
    const dirty =
      next.fullName.trim() !== savedName.trim() ||
      next.email.trim().toLowerCase() !== savedEmail.trim().toLowerCase() ||
      next.phone.trim() !== savedProfile.phone.trim() ||
      (next.photoUri ?? null) !== savedProfile.photoUri;
    setProfileDraft(
      userId,
      dirty
        ? {
            fullName: next.fullName,
            email: next.email,
            phone: next.phone,
            photoUri: next.photoUri,
          }
        : null
    );
  };

  const updateField = (patch: Partial<FormState>) => {
    const next = { ...form, ...patch };
    setForm(next);
    setErrors((prev) => {
      const cleared = { ...prev };
      for (const key of Object.keys(patch)) delete cleared[key];
      return cleared;
    });
    markDraft(next);
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo access to choose a profile picture. Your photo stays on this device.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (uri) updateField({ photoUri: uri });
  };

  const handleSave = async () => {
    if (!userId) return;
    const nextErrors: Record<string, string> = {};
    const name = form.fullName.trim();
    const mail = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name) nextErrors.fullName = 'Please enter your full name.';
    if (!EMAIL_PATTERN.test(mail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      nextErrors.phone = 'Enter a valid phone number, or leave this blank.';
    }
    if (emailChanged && !password) {
      nextErrors.password = 'Enter your password to confirm the email change.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (name !== savedName) await authService.updateProfile({ fullName: name });
      if (emailChanged) await authService.updateEmail(mail, password);
      await saveAccountProfile(userId, { phone, photoUri: form.photoUri });
      setProfileDraft(userId, null);
      Alert.alert('Profile updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (saveError) {
      Alert.alert("Couldn't save changes", toErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const dirty =
      form.fullName.trim() !== savedName.trim() ||
      form.email.trim().toLowerCase() !== savedEmail.trim().toLowerCase() ||
      form.phone.trim() !== savedProfile.phone.trim() ||
      (form.photoUri ?? null) !== savedProfile.photoUri;
    if (!dirty) {
      router.back();
      return;
    }
    Alert.alert(
      'Discard unsaved changes?',
      'Your profile edits haven’t been saved yet.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setProfileDraft(userId, null);
            router.back();
          },
        },
      ]
    );
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
              onPress={handleBack}
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
              <Text style={acct.headerTitle}>Edit profile</Text>
              <Text style={acct.headerSubtitle}>
                Update your photo, name, email, and phone number.
              </Text>
            </View>
          </View>

          {/* Photo */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Profile photo</Text>
          </View>
          <View style={acct.photoEditorCard}>
            <View style={acct.photoAvatar}>
              {form.photoUri ? (
                <Image
                  source={{ uri: form.photoUri }}
                  style={acct.photoAvatarImage}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <Text style={acct.photoAvatarText}>{initialsOf(form.fullName)}</Text>
              )}
            </View>
            <View style={acct.photoActions}>
              <Pressable
                onPress={() => void pickPhoto()}
                style={({ pressed }) => [
                  acct.secondaryButton,
                  pressed && acct.secondaryButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Choose a new profile photo"
              >
                <Ionicons name="image-outline" size={17} color={LANDLORD_THEME.primaryDark} />
                <Text style={acct.secondaryButtonText}>
                  {form.photoUri ? 'Change photo' : 'Add photo'}
                </Text>
              </Pressable>
              {form.photoUri ? (
                <Pressable
                  onPress={() => updateField({ photoUri: null })}
                  style={({ pressed }) => [
                    acct.dangerTextButton,
                    pressed && acct.dangerTextButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Remove profile photo"
                >
                  <Ionicons name="trash-outline" size={16} color="#B0433A" />
                  <Text style={acct.dangerTextButtonText}>Remove photo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Text style={acct.helperText}>
            Your photo is stored on this device with your account.
          </Text>

          {/* Details */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Personal details</Text>
          </View>
          <View style={{ gap: 14 }}>
            <Field
              label="Full name"
              value={form.fullName}
              onChangeText={(text) => updateField({ fullName: text })}
              placeholder="e.g. Maria Santos"
              autoCapitalize="words"
              icon="person-outline"
              error={errors.fullName}
            />
            <Field
              label="Email address"
              value={form.email}
              onChangeText={(text) => updateField({ email: text })}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
              hint={
                emailChanged
                  ? 'Confirm your password below before this email change is saved.'
                  : undefined
              }
            />
            <Field
              label="Phone number"
              value={form.phone}
              onChangeText={(text) => updateField({ phone: text })}
              placeholder="e.g. +63 917 123 4567"
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
              hint="Optional — renters can call you from your listings."
            />
            {emailChanged ? (
              <Field
                label="Current password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your account password"
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
                showSecureToggle
                onToggleSecure={() => setShowPassword((prev) => !prev)}
                error={errors.password}
                hint="For your security, changing your email requires your password."
              />
            ) : null}
          </View>

          <View style={{ marginTop: 22 }}>
            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              style={({ pressed }) => [
                acct.primaryButton,
                pressed && acct.primaryButtonPressed,
                saving && acct.primaryButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={acct.primaryButtonText}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>

          <Text style={[acct.helperText, { marginTop: 12 }]}>
            Your account details are private. Only renters viewing your listings
            see the contact information you publish.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
