import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { TransactionRow } from '@/components/renter/payments/TransactionRow/TransactionRow';
import { renterTransactions } from '@/data/mock';
import { routes } from '@/routes';
import { styles } from './HistoryScreen.styles';

/** Full payment history with a receipt link on every settled transaction. */
export default function HistoryScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <PageHeader
        title="Payment history"
        subtitle="Every settled payment on your account"
        onBack={() => router.back()}
      />

      <Text style={styles.summary}>
        {renterTransactions.length} payments · newest first
      </Text>

      <View style={styles.list}>
        {renterTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onPress={() => router.push(routes.renterReceipt(transaction.id))}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}
