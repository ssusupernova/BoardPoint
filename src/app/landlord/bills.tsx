import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  markBillPaid,
  toBillViews,
  useLandlordData,
  useLandlordSummary,
  type BillView,
} from '@/services/landlordData';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { routes } from '@/routes';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import { styles, billStyles, LANDLORD_THEME } from './style';

type BillFilter = 'All' | 'Unpaid' | 'Paid';

export default function LandlordBillsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { billId } = useLocalSearchParams<{ billId?: string }>();
  const data = useLandlordData();
  const summary = useLandlordSummary();

  const [filter, setFilter] = useState<BillFilter>('All');
  const bills = useMemo(() => toBillViews(data), [data]);

  const filteredBills = bills.filter((b) => {
    if (filter === 'All') return true;
    if (filter === 'Unpaid') return b.status !== 'Paid';
    return b.status === 'Paid';
  });

  const handleMarkPaid = (bill: BillView) => {
    Alert.alert(
      'Confirm Payment',
      `Record ${formatPeso(bill.amount)} payment from ${bill.tenantName} (${bill.propertyName} · ${bill.roomLabel})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record as Paid',
          onPress: () => {
            void markBillPaid(bill.id).then(() => {
              Alert.alert(
                'Success',
                `Rental bill for ${bill.tenantName} marked as Paid.`
              );
            });
          },
        },
      ]
    );
  };

  const handleSendReminder = (bill: BillView) => {
    Alert.alert(
      'Send Due Date Reminder',
      `Send rent due alert to ${bill.tenantName}?\nAmount: ${formatPeso(bill.amount)}\nDue Date: ${formatShortDate(bill.dueDate)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS',
          onPress: () => {
            Alert.alert('Sent', `Due date reminder SMS sent to ${bill.tenantName}.`);
          },
        },
      ]
    );
  };

  const unpaidCount = summary.unpaidCount;
  const paidCount = summary.paidCount;

  const statusLabel = (bill: BillView) => {
    if (bill.status === 'Paid') return `Paid ${formatShortDate(bill.paidAt ?? bill.dueDate)}`;
    if (bill.status === 'Overdue') return `Overdue (${formatShortDate(bill.dueDate)})`;
    if (bill.status === 'Due') return `Due Today (${formatShortDate(bill.dueDate)})`;
    return `Due ${formatShortDate(bill.dueDate)}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={billStyles.headerRow}>
            <Pressable
              onPress={() => router.push(routes.landlordDashboard)}
              style={({ pressed }) => [
                billStyles.headerBackBtn,
                pressed && billStyles.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to dashboard"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={billStyles.headerTextCol}>
              <Text style={styles.brandTitle}>Rental Bills & Due Dates</Text>
              <Text style={styles.brandSubtitle}>TENANT BILLING & SCHEDULE</Text>
            </View>
          </View>

          {/* Overview Summary Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>Rental Bills</Text>
            <Text style={styles.greetingSubtitle}>
              {summary.hasBillingRecords
                ? unpaidCount > 0
                  ? `${unpaidCount} unpaid ${unpaidCount === 1 ? 'bill' : 'bills'} totaling ${formatPeso(summary.outstandingAmount)}${summary.nextDueDate ? `, next due ${formatShortDate(summary.nextDueDate)}` : ''}.`
                  : 'All tenant rental bills for this period have been paid up to date.'
                : 'No rental bills recorded yet. Bills appear here once rooms and tenants are added.'}
            </Text>
            <View style={billStyles.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>{unpaidCount} Unpaid</Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>{paidCount} Paid</Text>
              </View>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={billStyles.filtersRow}>
            {(['All', 'Unpaid', 'Paid'] as BillFilter[]).map((f) => {
              const isSelected = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    billStyles.filterChip,
                    !isSelected && billStyles.filterChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      billStyles.filterChipText,
                      !isSelected && billStyles.filterChipTextInactive,
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Bills List */}
          <View style={billStyles.listContainer}>
            {filteredBills.length === 0 ? (
              <Text style={billStyles.emptyList}>
                No bills in this view yet.
              </Text>
            ) : null}

            {filteredBills.map((bill) => {
              const isUnpaid = bill.status !== 'Paid';
              const isOverdue = bill.status === 'Overdue';
              return (
                <View
                  key={bill.id}
                  style={[
                    styles.cardItem,
                    bill.id === billId && styles.cardItemHighlighted,
                  ]}
                >
                  <View style={billStyles.billHeaderRow}>
                    <View>
                      <Text style={styles.itemTitle}>
                        {bill.propertyName} · {bill.roomLabel}
                      </Text>
                      <Text style={billStyles.tenantName}>{bill.tenantName}</Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          billStyles.billAmount,
                          !isUnpaid && billStyles.billAmountPaid,
                        ]}
                      >
                        {formatPeso(bill.amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={billStyles.metaRow}>
                    <Text
                      style={[
                        billStyles.dueDateText,
                        isOverdue && billStyles.dueDateUrgent,
                      ]}
                    >
                      {statusLabel(bill)}
                    </Text>
                    <Text style={billStyles.periodText}>
                      Period: {bill.period}
                    </Text>
                  </View>

                  {isUnpaid && (
                    <View style={billStyles.billFooter}>
                      <View
                        style={
                          isOverdue ? styles.itemBadgeUrgent : styles.itemBadgePeach
                        }
                      >
                        <Text
                          style={
                            isOverdue
                              ? styles.itemBadgeUrgentText
                              : styles.itemBadgePeachText
                          }
                        >
                          {isOverdue ? 'Overdue' : 'Rent Due'}
                        </Text>
                      </View>
                      <View style={billStyles.actionRow}>
                        <Pressable
                          onPress={() => handleSendReminder(bill)}
                          style={({ pressed }) => [
                            billStyles.actionBtn,
                            pressed && billStyles.actionBtnPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Send reminder"
                        >
                          <Text style={billStyles.actionBtnText}>Remind</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleMarkPaid(bill)}
                          style={({ pressed }) => [
                            billStyles.actionBtn,
                            billStyles.actionBtnBlue,
                            pressed && billStyles.actionBtnPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Mark paid"
                        >
                          <Text style={[billStyles.actionBtnText, billStyles.actionBtnTextBlue]}>
                            Paid
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="overview" />
    </View>
  );
}
