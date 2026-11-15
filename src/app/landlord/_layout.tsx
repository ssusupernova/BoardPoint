import { Stack } from 'expo-router';
import { colors } from '@/theme';
import { useAuthSession } from '@/services/auth';
import { useLandlordVerification } from '@/services/landlordVerification';
import { retryLandlordWorkspace, useLandlordDataError } from '@/services/landlordData';
import { ErrorBanner } from '@/components/auth/ErrorBanner/ErrorBanner';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

/**
 * Nested stack for the landlord area. Every route under `src/app/landlord`
 * lives here so the root layout's landlord guard protects the whole subtree.
 */
export default function LandlordLayout() {
  const { session } = useAuthSession();
  const verification = useLandlordVerification(session?.user.id);
  const approved = verification.status === 'approved';
  const dataError = useLandlordDataError(approved);

  if (verification.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={LANDLORD_THEME.primary} />
        <Text style={{ marginTop: 12, color: LANDLORD_THEME.textSecondary }}>
          Checking landlord verification…
        </Text>
      </View>
    );
  }

  if (verification.error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
        <Text style={{ color: LANDLORD_THEME.textPrimary, textAlign: 'center' }}>
          {verification.error}
        </Text>
        <Pressable onPress={() => void verification.refresh()} style={{ padding: 14 }}>
          <Text style={{ color: LANDLORD_THEME.primaryDark, fontWeight: '700' }}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!approved ? (
        <View
          accessibilityRole="alert"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: LANDLORD_THEME.badgePeachBg,
            borderBottomWidth: 1,
            borderBottomColor: LANDLORD_THEME.border,
          }}
        >
          <Text style={{ color: LANDLORD_THEME.badgePeachText, fontSize: 12, fontWeight: '700' }}>
            View-only mode · property and account changes unlock after admin approval.
          </Text>
        </View>
      ) : null}
      {dataError ? (
        <View>
          <ErrorBanner message={`Landlord data sync failed: ${dataError}`} />
          <Pressable
            accessibilityRole="button"
            onPress={() => void retryLandlordWorkspace(approved)}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ color: LANDLORD_THEME.primaryDark, fontWeight: '700' }}>
              Retry data sync
            </Text>
          </Pressable>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={approved}>
          <Stack.Screen name="expense-new" />
          <Stack.Screen name="payment-new" />
          <Stack.Screen name="room-new" />
          <Stack.Screen name="tenant-new" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="notification-settings" />
          <Stack.Screen name="statement" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
