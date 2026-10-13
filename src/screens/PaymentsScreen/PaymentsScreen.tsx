import { Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { TransactionRow } from '@/components/renter/payments/TransactionRow/TransactionRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import {
  renterBillLines,
  renterCurrentBill,
  renterTransactions,
} from '@/data/mock';
import { routes } from '@/routes';
import { useSelectedPaymentMethod } from '@/services/paymentMethods';
import { isVerifiedRenter, useRentalRequestsState } from '@/services/rentalRequests';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { statusVariant } from '@/utils/status';
import { styles } from './PaymentsScreen.styles';

export default function PaymentsScreen() {
  const router = useRouter();
  const selectedMethod = useSelectedPaymentMethod();
  const { requests, ready } = useRentalRequestsState();
  const recent = renterTransactions.slice(0, 3);
  const verified = ready ? isVerifiedRenter(requests) : false;

  return (
    <RenterScreen
      active="payments"
      title="Payments"
      subtitle="Clear bills. Easy payments. Every receipt."
    >
      {!verified ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="card-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No payments yet</Text>
          <Text style={styles.emptyText}>
            You&apos;ll see your bills and payment options here once your rental
            request is accepted.
          </Text>
          <View style={styles.emptyAction}>
            <OutlineButton
              label="Browse rooms"
              icon="search-outline"
              onPress={() => router.push(routes.renterRecommended)}
            />
          </View>
        </View>
      ) : (
        <>
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
                Pay both bills together. A receipt will be saved after your
                payment is confirmed.
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
        </>
      )}
    </RenterScreen>
  );
}
