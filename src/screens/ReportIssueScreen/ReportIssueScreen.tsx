import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !detail.trim()) {
      setError('Please add a title and a short description.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await submitMaintenanceTicket({ title, category, detail });
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
