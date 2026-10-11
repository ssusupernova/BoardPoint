import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { BrandHeader } from '@/components/landlord/BrandHeader';
import { UploadCard } from '@/components/landlord/UploadCard';
import { SubmitButton } from '@/components/landlord/SubmitButton';
import { routes } from '@/routes';
import { landlordColors } from '@/theme';
import { styles } from './ListSpaceScreen.styles';

export default function ListSpaceScreen() {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('Potol, Tambak Street');
  const [idDocUri, setIdDocUri] = useState<string | null>(null);
  const [ownershipDocUri, setOwnershipDocUri] = useState<string | null>(null);

  const pickDocument = async (apply: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo access to upload your verification documents.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) apply(uri);
    }
  };

  const canSubmit = address.trim().length > 0 && Boolean(idDocUri) && Boolean(ownershipDocUri);

  // TODO(landlord): replace with a real verification flow once an admin page exists.
  const handleSubmit = () => {
    router.replace(routes.landlordDashboard);
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
                <UploadCard
                  accessibilityLabel="Upload a photo of your government ID or verification document"
                  imageUri={idDocUri ?? undefined}
                  onPress={() => void pickDocument(setIdDocUri)}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.fieldLabel}>
                  Proof of Ownership or Authorization
                </Text>
                <UploadCard
                  accessibilityLabel="Upload a photo proving ownership or authorization"
                  imageUri={ownershipDocUri ?? undefined}
                  onPress={() => void pickDocument(setOwnershipDocUri)}
                />
              </View>

              <View style={styles.group}>
                <Text style={styles.subtitle}>
                  Your account is pending verification. Submit it for review to
                  start listing your space.
                </Text>
              </View>

              <View style={styles.actions}>
                <SubmitButton onPress={handleSubmit} disabled={!canSubmit} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
