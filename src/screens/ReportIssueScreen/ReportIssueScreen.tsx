import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { submitMaintenanceTicket } from '@/services/maintenance';
import { colors } from '@/theme';
import { styles } from './ReportIssueScreen.styles';

const CATEGORIES = ['Plumbing', 'Electrical', 'Appliance', 'Pest', 'Other'] as const;

export default function ReportIssueScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [detail, setDetail] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo access to attach a picture to your maintenance report.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? null);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !detail.trim()) {
      setError('Please add a title and a short description.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await submitMaintenanceTicket({ title, category, detail, photoUri: photoUri ?? undefined });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Report an issue"
        subtitle="Tell your landlord what needs fixing"
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Leaking faucet"
            placeholderTextColor={colors.textDisabled}
            style={styles.input}
          />
        </View>

        <View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((option) => {
              const selected = category === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setCategory(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={detail}
            onChangeText={setDetail}
            placeholder="Describe the problem so it can be fixed quickly…"
            placeholderTextColor={colors.textDisabled}
            multiline
            style={[styles.input, styles.textarea]}
          />
        </View>

        <View>
          <Text style={styles.label}>Photo (optional)</Text>
          {photoUri ? (
            <View style={styles.photoWrap}>
              <Image
                source={{ uri: photoUri }}
                style={styles.photo}
                contentFit="cover"
                transition={150}
              />
              <Pressable
                onPress={() => setPhotoUri(null)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                style={({ pressed }) => [styles.photoRemove, pressed && styles.photoRemovePressed]}
              >
                <Ionicons name="close" size={16} color={colors.onPrimary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void pickPhoto()}
              accessibilityRole="button"
              accessibilityLabel="Add a photo to your report"
              style={({ pressed }) => [styles.photoPicker, pressed && styles.photoPickerPressed]}
            >
              <View style={styles.photoPickerIcon}>
                <Ionicons name="camera-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.photoPickerText}>Add a photo</Text>
              <Text style={styles.photoPickerHint}>Show your landlord what&apos;s wrong</Text>
            </Pressable>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.submit}>
          <PrimaryButton
            label="Submit report"
            onPress={() => void handleSubmit()}
            loading={saving}
            accessibilityLabel="Submit maintenance report"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
