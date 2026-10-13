import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubmitButton } from '@/components/landlord/SubmitButton';
import { useAuthSession } from '@/services/auth';
import {
  VERIFICATION_DEMO_NOTICE,
  VERIFICATION_SUCCESS_MESSAGE,
  submitLandlordVerification,
} from '@/services/verificationDemo';
import { routes } from '@/routes';
import { accountStyles as acct } from '@/styles/landlord/account.styles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';

const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

type Errors = Partial<Record<'fullName' | 'phone' | 'city' | 'idNumber' | 'confirmed', string>>;

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
  icon: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  keyboardType = 'default',
  autoCapitalize = 'words',
  icon,
  editable = true,
}: FieldProps) {
  return (
    <View style={acct.formGroup}>
      <Text style={acct.fieldLabel}>{label}</Text>
      <View style={[acct.field, error ? acct.fieldError : null, !editable && { opacity: 0.7 }]}>
        <Ionicons
          name={icon}
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
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          accessibilityLabel={label}
        />
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

/**
 * Landlord verification setup.
 *
 * Collects the identity details the admin team reviews, then hands off to
 * `submitLandlordVerification` — currently a frontend demo stub (see
 * `@/services/verificationDemo`). Swap that service for a real backend call
 * when Supabase integration lands; this screen's logic stays the same.
 */
export default function LandlordVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();

  const [fullName, setFullName] = useState(session?.user?.fullName ?? '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const validate = (): Errors => {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = 'Enter your full legal name.';
    if (!phone.trim()) next.phone = 'Enter your phone number.';
    else if (!PHONE_PATTERN.test(phone.trim())) next.phone = 'Enter a valid phone number.';
    if (!city.trim()) next.city = 'Enter the city or municipality of your properties.';
    if (!idNumber.trim()) next.idNumber = 'Enter the number shown on your valid ID.';
    if (!confirmed) next.confirmed = 'Confirm that your information is correct.';
    return next;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitLandlordVerification({
        fullName: fullName.trim(),
        email: session?.user?.email ?? '',
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        idNumber: idNumber.trim(),
      });
      Alert.alert(
        'Submitted — demo',
        `${VERIFICATION_SUCCESS_MESSAGE}\n\n${VERIFICATION_DEMO_NOTICE}`,
        [
          {
            text: 'OK',
            // TODO(verification): route to the Pending Verification screen
            // (`routes.landlordVerificationPending`) once the backend is connected.
            onPress: () => router.replace(routes.landlordDashboard),
          },
        ]
      );
    } catch (submitError) {
      Alert.alert(
        'Could not submit',
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong while submitting. Please try again.'
      );
    } finally {
      setSubmitting(false);
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
              disabled={submitting}
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
              <Text style={acct.headerTitle}>Landlord verification</Text>
              <Text style={acct.headerSubtitle}>
                Confirm your details so the BoardPoint team can review your account.
              </Text>
            </View>
          </View>

          {/* Intro */}
          <View style={[acct.infoCard, { marginTop: 18 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="shield-checkmark-outline" size={17} color={LANDLORD_THEME.primaryDark} />
              <Text style={acct.infoCardTitle}>Why verify?</Text>
            </View>
            <Text style={acct.infoCardBody}>
              Verified landlords earn a badge renters can trust. The admin team
              reviews your details — you can’t verify your own account.
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 14, marginTop: 4 }}>
            <Field
              label="Full legal name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearError('fullName');
              }}
              placeholder="e.g. Maria Santos"
              icon="person-outline"
              error={errors.fullName}
            />
            <Field
              label="Email address"
              value={session?.user?.email ?? ''}
              onChangeText={() => {}}
              icon="mail-outline"
              editable={false}
              hint="Your account email — update it from Edit Profile if needed."
            />
            <Field
              label="Phone number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearError('phone');
              }}
              placeholder="e.g. +63 917 123 4567"
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />
            <Field
              label="City or municipality"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                clearError('city');
              }}
              placeholder="e.g. Dapitan City"
              icon="location-outline"
              error={errors.city}
            />
            <Field
              label="Business address"
              value={address}
              onChangeText={setAddress}
              placeholder="Street, barangay (optional)"
              icon="home-outline"
            />
            <Field
              label="Valid ID number"
              value={idNumber}
              onChangeText={(text) => {
                setIdNumber(text);
                clearError('idNumber');
              }}
              placeholder="e.g. P123456789012"
              autoCapitalize="characters"
              icon="card-outline"
              error={errors.idNumber}
              hint="Enter the number printed on your government-issued ID."
            />

            {/* Confirmation checkbox */}
            <Pressable
              onPress={() => {
                setConfirmed((prev) => !prev);
                clearError('confirmed');
              }}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: LANDLORD_THEME.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: errors.confirmed ? '#B0433A' : LANDLORD_THEME.border,
                  padding: 14,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: confirmed }}
              accessibilityLabel="Confirm your information is correct"
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  borderWidth: 1.5,
                  borderColor: confirmed ? LANDLORD_THEME.primary : LANDLORD_THEME.border,
                  backgroundColor: confirmed ? LANDLORD_THEME.primary : LANDLORD_THEME.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {confirmed ? (
                  <Ionicons name="checkmark" size={15} color={LANDLORD_THEME.onPrimary} />
                ) : null}
              </View>
              <Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: LANDLORD_THEME.textSecondary }}>
                I confirm the information above is true and correct.
              </Text>
            </Pressable>
            {errors.confirmed ? (
              <Text style={acct.errorText} accessibilityRole="alert">
                {errors.confirmed}
              </Text>
            ) : null}
          </View>

          {/* Submit */}
          <View style={{ marginTop: 22, gap: 10 }}>
            <SubmitButton onPress={() => void handleSubmit()} loading={submitting} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="information-circle-outline" size={14} color={LANDLORD_THEME.textMuted} />
              <Text style={[acct.helperText, { flex: 1 }]}>
                {VERIFICATION_DEMO_NOTICE}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
