import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { PaymentHistoryRow } from '@/components/renter/PaymentHistoryRow/PaymentHistoryRow';
import { renterPaymentHistory, renterPaymentOverview } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { statusVariant } from '@/utils/status';
import { styles } from './BillsScreen.styles';

export default function BillsScreen() {
  const router = useRouter();
  const overview = renterPaymentOverview;

  return (
    <ScreenContainer>
      <PageHeader
        title="Bills & payment"
        subtitle={`Billing period · ${overview.period}`}
        onBack={() => router.back()}
      />

      <View style={styles.billCard}>
        <View style={styles.billHead}>
          <Text style={styles.billLabel}>Amount due</Text>
          <StatusBadge
            text={overview.status}
            variant={statusVariant(overview.status)}
            dot
          />
        </View>
        <Text style={styles.billAmount}>{formatPeso(overview.amountDue)}</Text>
        <Text style={styles.billMeta}>
          For {overview.period} · Due {formatDisplayDate(overview.dueDate)}
        </Text>
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.infoText} />
        <Text style={styles.noteText}>
          Online payment isn&apos;t connected yet. Once payments go live you&apos;ll be able to
          settle this bill here.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Payment history" />
        <View style={styles.list}>
          {renterPaymentHistory.map((record) => (
            <PaymentHistoryRow key={record.id} record={record} />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
