import {
  LANDLORD_NOTIFICATION_KINDS,
  LANDLORD_NOTIFICATION_META,
  useNotificationPrefs,
  setNotificationPref,
} from '@/services/landlordNotifications';
import { notificationStyles as notif } from '@/styles/landlord/notifications.styles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Per-category notification preferences. Toggles gate NEW in-app alerts only —
 * history already recorded stays visible. Device push notifications remain off
 * until a push service is configured, and lock-screen previews never include
 * tenant names or payment amounts.
 */
export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const prefs = useNotificationPrefs();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={notif.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                notif.headerBackBtn,
                pressed && notif.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={notif.headerTextCol}>
              <Text style={notif.headerTitle}>Notification alerts</Text>
              <Text style={notif.headerSubtitle}>
                Choose which updates appear in your Notifications Center.
              </Text>
            </View>
          </View>

          <View style={notif.prefIntroCard}>
            <Text style={notif.prefIntroText}>
              Alerts are delivered inside the app first. Turning a category off hides new
              alerts of that kind — earlier ones stay in your history.
            </Text>
          </View>

          {LANDLORD_NOTIFICATION_KINDS.map((kind) => {
            const meta = LANDLORD_NOTIFICATION_META[kind];
            return (
              <View key={kind} style={notif.prefRow}>
                <View style={notif.prefIconCircle}>
                  <Ionicons name={meta.icon} size={18} color={LANDLORD_THEME.primaryDark} />
                </View>
                <View style={notif.prefTextCol}>
                  <Text style={notif.prefTitle}>{meta.label}</Text>
                  <Text style={notif.prefDesc}>{meta.description}</Text>
                </View>
                <Switch
                  value={prefs[kind]}
                  onValueChange={(value) => void setNotificationPref(kind, value)}
                  trackColor={{ false: LANDLORD_THEME.border, true: LANDLORD_THEME.primaryLight }}
                  thumbColor={prefs[kind] ? LANDLORD_THEME.primary : '#FFFFFF'}
                  accessibilityLabel={`${meta.label} notifications`}
                />
              </View>
            );
          })}

          <View style={notif.prefFooterCard}>
            <View style={notif.prefFooterRow}>
              <Ionicons name="lock-closed-outline" size={15} color={LANDLORD_THEME.textMuted} />
              <Text style={notif.prefFooterText}>
                Device push notifications stay off until a push service is configured.
                Nothing sensitive — tenant names or payment amounts — is ever shown on a
                lock screen.
              </Text>
            </View>
            <View style={notif.prefFooterRow}>
              <Ionicons name="shield-checkmark-outline" size={15} color={LANDLORD_THEME.textMuted} />
              <Text style={notif.prefFooterText}>
                Overdue and due-soon rent always appear in Needs attention on the
                Notifications Center so you never miss a balance.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
