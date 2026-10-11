import { Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { TransactionRow } from '@/components/renter/payments/TransactionRow/TransactionRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import {
  renterBillLines,
  renterCurrentBill,
  renterTransactions,
} from '@/data/mock';
import { routes } from '@/routes';
import { useSelectedPaymentMethod } from '@/services/paymentMethods';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { statusVariant } from '@/utils/status';
import { styles } from './PaymentsScreen.styles';

export default function PaymentsScreen() {
  const router = useRouter();
  const selectedMethod = useSelectedPaymentMethod();
  const recent = renterTransactions.slice(0, 3);

  return (
    <RenterScreen
      active="payments"
      title="Payments"
      subtitle="Clear bills. Easy payments. Every receipt."
    >
      <View style={styles.billCard}>
        <View style={styles.billHead}>
          <Text style={styles.billPeriod}>{renterCurrentBill.periodLabel}</Text>
          <StatusBadge
            text={renterCurrentBill.status}
            variant={statusVariant(renterCurrentBill.status)}
            dot
          />
        </View>
        <Text style={styles.billTotal}>{formatPeso(renterCurrentBill.total)}</Text>
        <Text style={styles.billNote}>{renterCurrentBill.note}</Text>
        <View style={styles.dueRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.dueText}>{renterCurrentBill.nextDueLabel}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Bill breakdown"
          actionLabel="Invoice"
          onAction={() => router.push(routes.renterBills)}
        />
        <View style={styles.panel}>
          {renterBillLines.map((line) => (
            <View key={line.id} style={styles.billRow}>
              <View style={styles.billCopy}>
                <Text style={styles.billLabel}>{line.label}</Text>
                <Text style={styles.billMeta}>{line.meta}</Text>
              </View>
              <Text style={styles.billAmount}>{formatPeso(line.amount)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalAmount}>{formatPeso(renterCurrentBill.total)}</Text>
          </View>

          <Text style={styles.footnote}>No late fees or additional charges.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Payment method"
          actionLabel="Change"
          onAction={() => router.push(routes.renterPaymentMethods)}
        />
        <View style={styles.panel}>
          <View style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Ionicons
                name={selectedMethod.icon as ComponentProps<typeof Ionicons>['name']}
                size={19}
                color={colors.primary}
              />
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodProvider}>{selectedMethod.provider}</Text>
              <Text style={styles.methodAccount}>{selectedMethod.accountLabel}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          </View>

          <View style={styles.payAction}>
            <PrimaryButton
              label={`Pay ${formatPeso(renterCurrentBill.total)} with ${selectedMethod.provider}`}
              icon="card"
              onPress={() => router.push(routes.renterBills)}
              accessibilityLabel={`Review and pay ${formatPeso(renterCurrentBill.total)}`}
            />
          </View>

          <Text style={styles.methodNote}>
            Pay both bills together. A receipt will be saved after your payment is confirmed.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Transaction history"
          actionLabel="View all"
          onAction={() => router.push(routes.renterHistory)}
        />
        <View style={styles.historyList}>
          {recent.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onPress={() => router.push(routes.renterReceipt(transaction.id))}
            />
          ))}
        </View>
        <Text style={styles.historyFootnote}>
          Showing your {recent.length} most recent payments
        </Text>
      </View>
    </RenterScreen>
  );
}
