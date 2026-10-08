import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/landlord/BrandHeader';
import { UploadCard } from '@/components/landlord/UploadCard';
import { SubmitButton } from '@/components/landlord/SubmitButton';
import { spacing } from '@/theme';
import { landlordColors } from '@/theme/landlord';

export default function ListSpaceScreen() {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('Potol, Tambak Street');

  // TODO(landlord): hand the uploaded documents to the verification service.
  const handleSubmit = () => {
    Alert.alert(
      'Submitted for Verification',
      'Your documents are under review. We will let you know once your listing is approved.'
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={styles.decorativeShape} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.inner}>
            <BrandHeader />

            <View style={styles.heading}>
              <Text style={styles.title}>List Your Space. Find</Text>
              <Text style={styles.title}>the Right Renters.</Text>
              <Text style={styles.subtitle}>
                Create your landlord account and start managing{'\n'}
                your boarding-house listings with BoardPoint.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Landlord Information</Text>

              <View style={styles.group}>
                <Text style={styles.fieldLabel}>Boarding House Address</Text>
                <View style={styles.field}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={landlordColors.textSecondary}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your boarding house address"
                    placeholderTextColor={landlordColors.textSecondary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    accessibilityLabel="Boarding house address"
                  />
                </View>
              </View>

              <View style={styles.group}>
                <Text style={styles.fieldLabel}>Government ID / Verification Document</Text>
                {/* TODO(landlord): wire an image picker for document upload. */}
                <UploadCard accessibilityLabel="Upload a photo of your government ID or verification document" />
              </View>

              <View style={styles.group}>
                <Text style={styles.fieldLabel}>Proof of Ownership or Authorization</Text>
                {/* TODO(landlord): wire an image picker for document upload. */}
                <UploadCard accessibilityLabel="Upload a photo proving ownership or authorization" />
              </View>

              <View style={styles.actions}>
                <SubmitButton
                  onPress={handleSubmit}
                  disabled={address.trim().length === 0}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landlordColors.background,
  },
  flex: {
    flex: 1,
  },
  decorativeShape: {
    position: 'absolute',
    top: -132,
    right: -112,
    width: 264,
    height: 264,
    borderRadius: 132,
    backgroundColor: landlordColors.decorativeShape,
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
  heading: {
    marginTop: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    color: landlordColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: landlordColors.textSecondary,
  },
  form: {
    marginTop: 36,
    gap: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: landlordColors.textPrimary,
    letterSpacing: 0.2,
  },
  group: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: landlordColors.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: landlordColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: landlordColors.border,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: landlordColors.textPrimary,
    paddingVertical: 0,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
