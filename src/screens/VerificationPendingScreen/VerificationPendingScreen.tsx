import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { useLandlordVerification } from '@/services/landlordVerification';
import { accountStyles as acct } from '@/styles/landlord/account.styles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerificationPendingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const verification = useLandlordVerification(session?.user.id);
  const approved = verification.status === 'approved';
  const needsResubmission =
    verification.status === 'rejected' || verification.status === 'more_information_requested';

  const title = approved
    ? 'Landlord account approved'
    : needsResubmission
      ? 'Action needed on your application'
      : 'Application pending review';
  const statusLabel = approved
    ? 'Approved'
    : verification.status === 'under_review'
      ? 'Under review'
      : verification.status === 'rejected'
        ? 'Not approved'
        : verification.status === 'more_information_requested'
          ? 'More information requested'
          : 'Pending review';
  const message = approved
    ? 'Your account is verified. You can now manage properties and landlord features.'
    : needsResubmission
      ? verification.reviewerNotes
        ?? 'The admin team needs an updated application. Review your information and submit again.'
      : 'You can view your landlord account while the admin team reviews your documents. Property and account changes are disabled until approval.';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { paddingTop: 48 }]}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: approved ? '#E6F0FA' : LANDLORD_THEME.badgePeachBg,
                borderWidth: 2,
                borderColor: LANDLORD_THEME.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={approved ? 'checkmark-circle-outline' : 'time-outline'}
                size={40}
                color={LANDLORD_THEME.primary}
              />
            </View>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: LANDLORD_THEME.textPrimary,
              textAlign: 'center',
              marginTop: 20,
              letterSpacing: -0.4,
            }}
          >
            {title}
          </Text>

          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: LANDLORD_THEME.badgePeachBg,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Ionicons name="ellipse-outline" size={12} color={LANDLORD_THEME.badgePeachText} />
              <Text style={{ fontSize: 12, fontWeight: '800', color: LANDLORD_THEME.badgePeachText }}>
                {verification.loading ? 'Checking status…' : statusLabel}
              </Text>
            </View>
          </View>

          <View style={[acct.infoCard, { marginTop: 22 }]}>
            {verification.loading ? (
              <ActivityIndicator color={LANDLORD_THEME.primary} />
            ) : verification.error ? (
              <Text style={acct.infoCardBody}>{verification.error}</Text>
            ) : (
              <Text style={acct.infoCardBody}>{message}</Text>
            )}
          </View>

          {!approved && !needsResubmission ? (
            <View style={acct.infoFooter}>
              <Ionicons name="information-circle-outline" size={15} color={LANDLORD_THEME.textMuted} />
              <Text style={acct.infoFooterText}>
                Verification documents are private and reviewed only by authorized administrators.
              </Text>
            </View>
          ) : null}

          <View style={{ marginTop: 24, gap: 10 }}>
            {verification.error ? (
              <Pressable
                onPress={() => void verification.refresh()}
                style={({ pressed }) => [acct.primaryButton, pressed && acct.primaryButtonPressed]}
                accessibilityRole="button"
              >
                <Text style={acct.primaryButtonText}>Retry status check</Text>
              </Pressable>
            ) : approved ? (
              <Pressable
                onPress={() => router.replace(routes.landlordDashboard)}
                style={({ pressed }) => [acct.primaryButton, pressed && acct.primaryButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel="Go to landlord dashboard"
              >
                <Ionicons name="home-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                <Text style={acct.primaryButtonText}>Go to Overview</Text>
              </Pressable>
            ) : needsResubmission ? (
              <Pressable
                onPress={() => router.replace(routes.landlordVerification)}
                style={({ pressed }) => [acct.primaryButton, pressed && acct.primaryButtonPressed]}
                accessibilityRole="button"
              >
                <Text style={acct.primaryButtonText}>Update application</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => void verification.refresh()}
                disabled={verification.loading}
                style={({ pressed }) => [acct.primaryButton, pressed && acct.primaryButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel="Refresh verification status"
              >
                <Ionicons name="refresh-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                <Text style={acct.primaryButtonText}>Refresh status</Text>
              </Pressable>
            )}
            {!approved && !verification.error ? (
              <Pressable
                onPress={() => router.replace(routes.landlordDashboard)}
                style={({ pressed }) => [acct.secondaryButton, pressed && acct.secondaryButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel="View landlord overview"
              >
                <Ionicons name="home-outline" size={17} color={LANDLORD_THEME.primaryDark} />
                <Text style={acct.secondaryButtonText}>View Overview</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
