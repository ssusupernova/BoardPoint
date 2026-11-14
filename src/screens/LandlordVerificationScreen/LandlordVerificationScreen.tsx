import { SubmitButton } from "@/components/landlord/SubmitButton";
import { routes } from "@/routes";
import { useAuthSession } from "@/services/auth";
import { useLandlordVerification } from "@/services/landlordVerification";
import {
  submitLandlordVerification,
  type LandlordVerificationDocumentKind,
  type SelectedVerificationDocument,
} from "@/services/landlordVerification";
import { accountStyles as acct } from "@/styles/landlord/account.styles";
import { LANDLORD_THEME, styles } from "@/styles/landlord/styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PHONE_PATTERN = /^[+()\d\s-]{7,}$/;

/**
 * `Alert.alert` is a no-op on react-native-web, so on web we fall back to the
 * browser dialog (with an optional callback fired after the user dismisses it).
 */
function notify(title: string, message: string, onDismiss?: () => void) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onDismiss?.();
    return;
  }
  Alert.alert(
    title,
    message,
    onDismiss ? [{ text: "OK", onPress: onDismiss }] : undefined,
  );
}

type Errors = Partial<Record<"fullName" | "phone" | "city" | "confirmed" | "documents", string>>;

const DOCUMENT_FIELDS: {
  kind: LandlordVerificationDocumentKind;
  label: string;
  description: string;
  required: boolean;
}[] = [
  {
    kind: "id_front",
    label: "Government ID — front",
    description: "A clear photo of the front of your valid ID.",
    required: true,
  },
  {
    kind: "id_back",
    label: "Government ID — back",
    description: "A clear photo of the back of your valid ID.",
    required: true,
  },
  {
    kind: "selfie",
    label: "Selfie holding your ID",
    description: "Make sure your face and ID are readable.",
    required: true,
  },
  {
    kind: "proof_of_address",
    label: "Proof of address",
    description: "A recent utility bill or other address document.",
    required: true,
  },
  {
    kind: "ownership_proof",
    label: "Proof of property ownership",
    description: "Optional supporting document.",
    required: false,
  },
];

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  keyboardType?: "default" | "phone-pad";
  autoCapitalize?: "none" | "words" | "characters";
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
  keyboardType = "default",
  autoCapitalize = "words",
  icon,
  editable = true,
}: FieldProps) {
  return (
    <View style={acct.formGroup}>
      <Text style={acct.fieldLabel}>{label}</Text>
      <View
        style={[
          acct.field,
          error ? acct.fieldError : null,
          !editable && { opacity: 0.7 },
        ]}
      >
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
 * Collects identity details and uploads them to the private verification bucket.
 */
export default function LandlordVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const verification = useLandlordVerification(session?.user.id);

  const [fullName, setFullName] = useState(session?.user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [documents, setDocuments] = useState<
    Partial<Record<LandlordVerificationDocumentKind, SelectedVerificationDocument>>
  >({});
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
    if (!fullName.trim()) next.fullName = "Enter your full legal name.";
    if (!phone.trim()) next.phone = "Enter your phone number.";
    else if (!PHONE_PATTERN.test(phone.trim()))
      next.phone = "Enter a valid phone number.";
    if (!city.trim())
      next.city = "Enter the city or municipality of your properties.";
    if (DOCUMENT_FIELDS.some((field) => field.required && !documents[field.kind]))
      next.documents = "Upload all required verification documents.";
    if (!confirmed)
      next.confirmed = "Confirm that your information is correct.";
    return next;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!session?.user?.id) {
      notify("Sign in required", "Sign in with your confirmed email before submitting verification.");
      return;
    }

    setSubmitting(true);
    try {
      await submitLandlordVerification({
        fullName: fullName.trim(),
        email: session.user.email,
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        documents,
      }, session.user.id);
      notify(
        "Application submitted",
        "Your documents were sent securely for admin review. Your landlord account will remain in view-only mode until it is approved.",
        () => router.replace(routes.landlordVerificationPending),
      );
    } catch (submitError) {
      notify(
        "Could not submit",
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pickDocument = async (field: (typeof DOCUMENT_FIELDS)[number]) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify("Photo access needed", "Allow photo access to upload your verification documents.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
        selectionLimit: 1,
        base64: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        notify("Could not select file", "Choose an image and try again.");
        return;
      }
      if (!asset.base64) {
        notify("Could not read file", "The selected image could not be prepared for secure upload.");
        return;
      }
      setDocuments((previous) => ({
        ...previous,
        [field.kind]: {
          base64: asset.base64,
          name: asset.fileName ?? field.label,
          mimeType: "image/jpeg",
        },
      }));
      clearError("documents");
    } catch (pickerError) {
      notify(
        "Could not select file",
        pickerError instanceof Error ? pickerError.message : "Choose the image and try again.",
      );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
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
              <Ionicons
                name="arrow-back"
                size={20}
                color={LANDLORD_THEME.textPrimary}
              />
            </Pressable>
            <View style={acct.headerTextCol}>
              <Text style={acct.headerTitle}>Landlord verification</Text>
              <Text style={acct.headerSubtitle}>
                Confirm your details so the BoardPoint team can review your
                account.
              </Text>
            </View>
          </View>

          {/* Intro */}
          <View style={[acct.infoCard, { marginTop: 18 }]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={LANDLORD_THEME.primaryDark}
              />
              <Text style={acct.infoCardTitle}>Why verify?</Text>
            </View>
            {verification.status === "more_information_requested" && verification.reviewerNotes ? (
              <View style={[acct.infoCard, { marginTop: 12, borderColor: LANDLORD_THEME.primary }]}>
                <Text style={acct.infoCardTitle}>Update requested by the admin team</Text>
                <Text style={[acct.infoCardBody, { marginTop: 6 }]}>
                  {verification.reviewerNotes}
                </Text>
              </View>
            ) : null}
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
                clearError("fullName");
              }}
              placeholder="e.g. Maria Santos"
              icon="person-outline"
              error={errors.fullName}
            />
            <Field
              label="Email address"
              value={session?.user?.email ?? ""}
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
                clearError("phone");
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
                clearError("city");
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
            <View style={{ gap: 10 }}>
              <Text style={acct.fieldLabel}>Verification documents</Text>
              <Text style={acct.helperText}>
                Upload clear image photos. Each file must be 8 MB or smaller.
              </Text>
              {DOCUMENT_FIELDS.map((field) => {
                const selected = documents[field.kind];
                return (
                  <Pressable
                    key={field.kind}
                    onPress={() => void pickDocument(field)}
                    disabled={submitting}
                    style={({ pressed }) => ({
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: errors.documents ? "#B0433A" : LANDLORD_THEME.border,
                      backgroundColor: LANDLORD_THEME.surface,
                      padding: 14,
                      opacity: pressed ? 0.78 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    })}
                    accessibilityRole="button"
                    accessibilityLabel={`Upload ${field.label}`}
                  >
                    <Ionicons
                      name={selected ? "checkmark-circle" : "cloud-upload-outline"}
                      size={22}
                      color={selected ? LANDLORD_THEME.primaryDark : LANDLORD_THEME.textMuted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={acct.fieldLabel}>
                        {field.label}{field.required ? " *" : " (optional)"}
                      </Text>
                      <Text style={acct.helperText} numberOfLines={2}>
                        {selected?.name ?? field.description}
                      </Text>
                    </View>
                    <Text style={acct.helperText}>{selected ? "Change" : "Add"}</Text>
                  </Pressable>
                );
              })}
              {errors.documents ? (
                <Text style={acct.errorText} accessibilityRole="alert">
                  {errors.documents}
                </Text>
              ) : null}
            </View>

            {/* Confirmation checkbox */}
            <Pressable
              onPress={() => {
                setConfirmed((prev) => !prev);
                clearError("confirmed");
              }}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: LANDLORD_THEME.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: errors.confirmed
                    ? "#B0433A"
                    : LANDLORD_THEME.border,
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
                  borderColor: confirmed
                    ? LANDLORD_THEME.primary
                    : LANDLORD_THEME.border,
                  backgroundColor: confirmed
                    ? LANDLORD_THEME.primary
                    : LANDLORD_THEME.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {confirmed ? (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={LANDLORD_THEME.onPrimary}
                  />
                ) : null}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  lineHeight: 19,
                  color: LANDLORD_THEME.textSecondary,
                }}
              >
                I confirm the information and documents above are true and correct.
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
            <SubmitButton
              onPress={() => void handleSubmit()}
              loading={submitting}
            />
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={LANDLORD_THEME.textMuted}
              />
              <Text style={[acct.helperText, { flex: 1 }]}>
                Documents are private and can only be accessed by you and authorized administrators.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
