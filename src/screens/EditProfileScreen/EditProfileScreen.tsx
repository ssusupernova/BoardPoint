import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { saveRenterContact, useRenterContact } from '@/services/profile';
import { colors } from '@/theme';
import { styles } from './EditProfileScreen.styles';

/** Edits the renter's contact details. Name and email stay account-managed. */
export default function EditProfileScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const contact = useRenterContact();
  const [mobile, setMobile] = useState(contact.mobile);
  const [emergency, setEmergency] = useState(contact.emergencyContact);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRenterContact({ mobile: mobile.trim(), emergencyContact: emergency.trim() });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Edit profile"
        subtitle="Update your contact details"
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <View style={styles.readonly}>
          <Text style={styles.readonlyLabel}>Full name</Text>
          <Text style={styles.readonlyValue}>{session?.user.fullName ?? '—'}</Text>
        </View>

        <View style={styles.readonly}>
          <Text style={styles.readonlyLabel}>Email</Text>
          <Text style={styles.readonlyValue}>{session?.user.email ?? '—'}</Text>
        </View>

        <View>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            placeholder="+63 9XX XXX XXXX"
            placeholderTextColor={colors.textDisabled}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <View>
          <Text style={styles.label}>Emergency contact</Text>
          <TextInput
            value={emergency}
            onChangeText={setEmergency}
            placeholder="Name · phone number"
            placeholderTextColor={colors.textDisabled}
            style={styles.input}
          />
        </View>

        <View style={styles.submit}>
          <PrimaryButton
            label="Save changes"
            onPress={() => void handleSave()}
            loading={saving}
            accessibilityLabel="Save profile changes"
          />
        </View>

        <Text style={styles.note}>
          Your name and email are tied to your BoardPoint account.
        </Text>

        <Text
          style={styles.link}
          onPress={() => router.push(routes.renterSetting('password'))}
          accessibilityRole="link"
        >
          Manage password & security
        </Text>
      </View>
    </ScreenContainer>
  );
}
