import { routes } from '@/routes';
import { accountStyles as acct } from '@/styles/landlord/account.styles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandlordVerificationStartScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: LANDLORD_THEME.badgePeachBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mail-unread-outline" size={34} color={LANDLORD_THEME.primaryDark} />
            </View>
          </View>
          <Text style={[acct.headerTitle, { textAlign: 'center' }]}>
            Confirm your email first
          </Text>
          <Text style={[acct.headerSubtitle, { textAlign: 'center', marginTop: 10 }]}>
            We created your landlord account. Open the confirmation link in your email, then sign
            in to submit your landlord verification documents.
          </Text>

          <View style={[acct.infoCard, { marginTop: 24 }]}>
            <Text style={acct.infoCardTitle}>What happens next?</Text>
            <Text style={[acct.infoCardBody, { marginTop: 8 }]}>
              After you sign in, you can submit your ID and address documents for review. Your
              landlord account stays in view-only mode until an administrator approves it.
            </Text>
          </View>

          <Pressable
            onPress={() => router.replace(routes.signIn)}
            style={({ pressed }) => [
              acct.primaryButton,
              { marginTop: 24 },
              pressed && acct.primaryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in"
          >
            <Text style={acct.primaryButtonText}>Continue to sign in</Text>
            <Ionicons name="arrow-forward" size={18} color={LANDLORD_THEME.onPrimary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
