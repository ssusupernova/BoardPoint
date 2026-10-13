import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VERIFICATION_DEMO_NOTICE } from '@/services/verificationDemo';
import { routes } from '@/routes';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { accountStyles as acct } from '@/styles/landlord/account.styles';

/**
 * Shown after the (demo) verification submission. The status pill says
 * "Pending Review — Demo" because nothing has actually been sent to a backend
 * or seen by an administrator yet.
 */
export default function VerificationPendingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { paddingTop: 48 }]}>
          {/* Icon */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: LANDLORD_THEME.badgePeachBg,
                borderWidth: 2,
                borderColor: LANDLORD_THEME.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="time-outline" size={40} color={LANDLORD_THEME.primary} />
            </View>
          </View>

          {/* Heading */}
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
            Application Pending Review
          </Text>

          {/* Status pill */}
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
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: LANDLORD_THEME.badgePeachText,
                }}
              >
                Pending Review — Demo
              </Text>
            </View>
          </View>

          {/* Message */}
          <View style={[acct.infoCard, { marginTop: 22 }]}>
            <Text style={acct.infoCardBody}>
              Your landlord verification application is showing as pending
              review.{' '}
              {VERIFICATION_DEMO_NOTICE} Actual verification will be connected
              once the BoardPoint backend is in place — at that point the admin
              team will review submissions and update your status from their
              panel.
            </Text>
          </View>

          <View style={acct.infoFooter}>
            <Ionicons name="information-circle-outline" size={15} color={LANDLORD_THEME.textMuted} />
            <Text style={acct.infoFooterText}>
              You can keep using BoardPoint in the meantime. Your verification
              status appears on your profile screen.
            </Text>
          </View>

          {/* Actions */}
          <View style={{ marginTop: 24, gap: 10 }}>
            <Pressable
              onPress={() => router.replace(routes.landlordProperties)}
              style={({ pressed }) => [
                acct.primaryButton,
                pressed && acct.primaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to My Properties"
            >
              <Ionicons name="business-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={acct.primaryButtonText}>Back to My Properties</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace(routes.landlordDashboard)}
              style={({ pressed }) => [
                acct.secondaryButton,
                pressed && acct.secondaryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to Overview"
            >
              <Ionicons name="home-outline" size={17} color={LANDLORD_THEME.primaryDark} />
              <Text style={acct.secondaryButtonText}>Back to Overview</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
