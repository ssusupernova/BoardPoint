import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { RenterScreen } from '@/components/renter/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { PaymentHistoryRow } from '@/components/renter/PaymentHistoryRow/PaymentHistoryRow';
import { PaymentOverviewCard } from '@/components/renter/dashboard/PaymentOverviewCard/PaymentOverviewCard';
import { renterPaymentHistory, renterPaymentOverview } from '@/data/mock';
import { routes } from '@/routes';
import { colors } from '@/theme';
import { styles } from './PaymentsScreen.styles';

const METHODS = [
  { icon: 'phone-portrait-outline', label: 'GCash', detail: 'Preferred e-wallet' },
  { icon: 'business-outline', label: 'Bank transfer', detail: 'Landlord bank account' },
  { icon: 'cash-outline', label: 'Cash', detail: 'Pay in person to your landlord' },
] as const;

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <RenterScreen active="payments">
      <PageHeader title="Payments" subtitle="History and payment methods" />

      <View style={styles.section}>
        <SectionHeader title="Outstanding" />
        <PaymentOverviewCard
          overview={renterPaymentOverview}
          onViewBills={() => router.push(routes.renterBills)}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Payment methods" />
        <View style={styles.list}>
          {METHODS.map((method) => (
            <View key={method.label} style={styles.method}>
              <View style={styles.methodIcon}>
                <Ionicons name={method.icon} size={19} color={colors.primary} />
              </View>
              <View style={styles.methodCopy}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDetail}>{method.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="History" />
        <View style={styles.list}>
          {renterPaymentHistory.map((record) => (
            <PaymentHistoryRow key={record.id} record={record} />
          ))}
        </View>
      </View>
    </RenterScreen>
  );
}
