import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BrandHeader } from '@/components/landlord/BrandHeader';
import { UploadCard } from '@/components/landlord/UploadCard';
import { SubmitButton } from '@/components/landlord/SubmitButton';
import { landlordColors } from '@/theme';
import { styles } from './ListSpaceScreen.styles';

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
                <Text style={styles.fieldLabel}>
                  Government ID / Verification Document
                </Text>
                {/* TODO(landlord): wire an image picker for document upload. */}
                <UploadCard accessibilityLabel="Upload a photo of your government ID or verification document" />
              </View>

              <View style={styles.group}>
                <Text style={styles.fieldLabel}>
                  Proof of Ownership or Authorization
                </Text>
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
