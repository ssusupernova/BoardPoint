import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { DetailRow } from '@/components/renter/settings/DetailRow/DetailRow';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { renterTransactions } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './ReceiptScreen.styles';

export default function ReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = renterTransactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <ScreenContainer>
        <PageHeader title="Receipt" onBack={() => router.back()} />
        <Text style={styles.missing}>We couldn&apos;t find that receipt.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Receipt" onBack={() => router.back()} />

      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={26} color={colors.onPrimary} />
        </View>
        <View style={styles.badgeWrap}>
          <StatusBadge text={transaction.status} variant="success" dot />
        </View>
        <Text style={styles.amount}>{formatPeso(transaction.amount)}</Text>
        <Text style={styles.period}>{transaction.period}</Text>
        <Text style={styles.breakdown}>{transaction.breakdown}</Text>
      </View>

      <View style={styles.panel}>
        <DetailRow label="Method" value={transaction.method} />
        <DetailRow label="Paid on" value={transaction.timestampLabel} />
        <DetailRow label="Reference" value={transaction.reference} />
      </View>

      <Text style={styles.note}>
        This receipt is saved to your account. Keep it for your records.
      </Text>
    </ScreenContainer>
  );
}
