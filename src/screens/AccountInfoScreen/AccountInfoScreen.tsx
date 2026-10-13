import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { accountStyles as acct } from '@/styles/landlord/account.styles';

type InfoBlock = { title: string; body: string };

type InfoSection = {
  title: string;
  subtitle: string;
  blocks: InfoBlock[];
  footer: string;
};

const INFO_SECTIONS: Record<string, InfoSection> = {
  privacy: {
    title: 'Privacy information',
    subtitle: 'How BoardPoint handles your data.',
    blocks: [
      {
        title: 'What is stored',
        body: 'Your account details (name, email, and phone if you add one), your listings, rooms, and tenancy records are stored on this device. A profile photo you choose is kept with your account on this device only.',
      },
      {
        title: 'Location pins',
        body: 'Property pins you drop are part of your listing and shown to renters searching your area. Your device location is only used when you ask to drop a pin — it is never shared, and BoardPoint never shows where you are on a map.',
      },
      {
        title: 'What renters see',
        body: 'Renters see your listings and the contact details you publish there. They never see other landlords’ data, tenant addresses, or any renter’s precise location.',
      },
      {
        title: 'Verification',
        body: 'Identity verification is reviewed by the BoardPoint admin team. Your verification status is set only by administrators — it cannot be changed from your account screens.',
      },
      {
        title: 'Notifications',
        body: 'In-app alerts you receive are listed in your Notifications Center. Lock-screen previews never include tenant names or payment amounts.',
      },
    ],
    footer:
      'Questions about your data? Contact support@boardpoint.app from the email on your account.',
  },
  terms: {
    title: 'Terms and conditions',
    subtitle: 'The agreement that applies to your BoardPoint account.',
    blocks: [
      {
        title: 'Your account',
        body: 'You are responsible for keeping your password private and for activity under your account. Contact support promptly if you believe your account was accessed without permission.',
      },
      {
        title: 'Accurate listings',
        body: 'Property details, room availability, and rent amounts must be accurate and kept up to date. BoardPoint may request changes to, or hide, listings that are misleading, duplicated, or reported.',
      },
      {
        title: 'Fair use',
        body: 'BoardPoint must not be used to discriminate against applicants, misrepresent properties, or pressure renters into payments outside the records this app keeps.',
      },
      {
        title: 'Verification',
        body: 'Verification is an administrative review of submitted documents, not an endorsement of a property. A verified badge confirms documents were reviewed by the BoardPoint team.',
      },
      {
        title: 'Moderation',
        body: 'Administrators may request corrections, hide listings, or suspend accounts that break these terms. Moderation decisions are recorded in the app.',
      },
      {
        title: 'Local storage',
        body: 'This build keeps data on your device. Removing the app can remove your local records — keep your own copies of anything critical.',
      },
    ],
    footer: 'Last updated for the BoardPoint demo build. Continued use means you accept these terms.',
  },
  help: {
    title: 'Help and support',
    subtitle: 'Get help with your landlord account.',
    blocks: [
      {
        title: 'Contact us',
        body: 'Email support@boardpoint.app with the email address on your account and a short description of the issue. Support replies within one business day.',
      },
      {
        title: 'Signing in',
        body: 'Email-based password recovery isn’t connected in this build. If you can’t sign in, use Change Password when signed in, or contact support from the email on your account.',
      },
      {
        title: 'Verification questions',
        body: 'Verification is handled by the admin team. Your current status is shown on your profile screen; updates appear once a decision is made.',
      },
      {
        title: 'Listing problems',
        body: 'If a listing looks wrong, open it from My Properties, correct it, and use Save Changes. Hidden listings show the reason on the property details screen.',
      },
    ],
    footer: 'Support hours: Monday to Friday, 9:00–18:00 (Philippine time).',
  },
};

/**
 * Static information pages for the landlord account area: Privacy, Terms, and
 * Help. Content is rendered from a map so the settings menu can link to any
 * section with one route.
 */
export default function AccountInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const sectionKey = typeof params.section === 'string' ? params.section : '';
  const section = INFO_SECTIONS[sectionKey];

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
          <View style={acct.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                acct.headerBackBtn,
                pressed && acct.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={acct.headerTextCol}>
              <Text style={acct.headerTitle}>{section?.title ?? 'Information'}</Text>
              <Text style={acct.headerSubtitle}>
                {section?.subtitle ?? 'This page isn’t available.'}
              </Text>
            </View>
          </View>

          {section ? (
            <View style={{ marginTop: 18 }}>
              {section.blocks.map((block) => (
                <View key={block.title} style={acct.infoCard}>
                  <Text style={acct.infoCardTitle}>{block.title}</Text>
                  <Text style={acct.infoCardBody}>{block.body}</Text>
                </View>
              ))}
              <View style={acct.infoFooter}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={LANDLORD_THEME.textMuted}
                />
                <Text style={acct.infoFooterText}>{section.footer}</Text>
              </View>
            </View>
          ) : (
            <View style={[acct.infoCard, { marginTop: 18 }]}>
              <Text style={acct.infoCardBody}>
                We couldn’t find that page. Go back and pick an option from your
                account settings.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
