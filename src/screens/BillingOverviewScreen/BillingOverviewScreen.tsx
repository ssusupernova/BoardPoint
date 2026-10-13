import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { landlordPaymentDetails, routes } from '@/routes';
import { billingPeriods, summarizeBilling, useLandlordData } from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { paymentStyles as pay } from '../../styles/landlord/payments.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

type CardTone = 'good' | 'danger';

function SummaryCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: CardTone;
}) {
  return (
    <View style={pay.summaryCard}>
      <Text style={pay.summaryLabel}>{label}</Text>
      <Text
        style={[
          pay.summaryValue,
          tone === 'good' && pay.summaryValueGood,
          tone === 'danger' && pay.summaryValueDanger,
        ]}
      >
        {value}
      </Text>
      <Text style={pay.summaryCaption}>{caption}</Text>
    </View>
  );
}

export default function BillingOverviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useLandlordData();

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);

  const periods = useMemo(() => billingPeriods(data), [data]);
  const overview = useMemo(
    () => summarizeBilling(data, { propertyId, period }),
    [data, propertyId, period]
  );

  const openCount = overview.billCount - overview.paidCount;

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
              <Text style={styles.brandTitle}>Rent & Payments</Text>
              <Text style={styles.brandSubtitle}>BILLING, PAYMENTS & RECEIPTS</Text>
            </View>
          </View>

          {/* Greeting summary */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>Billing overview</Text>
            <Text style={styles.greetingSubtitle}>
              {overview.billCount === 0
                ? 'No rental bills in this view yet. Change the filters, or add tenants to start billing.'
                : overview.outstanding > 0
                  ? `${formatPeso(overview.outstanding)} outstanding across ${openCount} open ${
                      openCount === 1 ? 'bill' : 'bills'
                    }${
                      overview.overdue > 0
                        ? `, ${formatPeso(overview.overdue)} past due`
                        : ''
                    }.`
                  : 'Every bill in this view is settled. Payments are recorded here manually.'}
            </Text>
            <View style={billStyles.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>
                  {overview.unpaidCount + overview.overdueCount} Unpaid
                </Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>{overview.paidCount} Paid</Text>
              </View>
            </View>
          </View>

          {/* Selectors */}
          <Text style={pay.selectorLabel}>PROPERTY</Text>
          <View style={pay.chipsRow}>
            <FilterChip label="All" active={propertyId === null} onPress={() => setPropertyId(null)} />
            {data.properties.map((property) => (
              <FilterChip
                key={property.id}
                label={property.name}
                active={propertyId === property.id}
                onPress={() => setPropertyId(property.id)}
              />
            ))}
          </View>

          <Text style={pay.selectorLabel}>BILLING PERIOD</Text>
          <View style={pay.chipsRow}>
            <FilterChip label="All" active={period === null} onPress={() => setPeriod(null)} />
            {periods.map((label) => (
              <FilterChip
                key={label}
                label={label}
                active={period === label}
                onPress={() => setPeriod(label)}
              />
            ))}
          </View>

          {/* Totals */}
          <View style={pay.summaryGrid}>
            <SummaryCard
              label="TOTAL RENT RECORDED"
              value={formatPeso(overview.totalBilled)}
              caption={`${overview.billCount} ${overview.billCount === 1 ? 'bill' : 'bills'} in view`}
            />
            <SummaryCard
              label="PAYMENTS RECEIVED"
              value={formatPeso(overview.totalReceived)}
              caption="Recorded by you"
              tone={overview.totalReceived > 0 ? 'good' : undefined}
            />
            <SummaryCard
              label="OUTSTANDING"
              value={formatPeso(overview.outstanding)}
              caption={`${openCount} open ${openCount === 1 ? 'bill' : 'bills'}`}
              tone={overview.outstanding > 0 ? undefined : 'good'}
            />
            <SummaryCard
              label="OVERDUE"
              value={formatPeso(overview.overdue)}
              caption={`${overview.overdueCount} past due`}
              tone={overview.overdue > 0 ? 'danger' : undefined}
            />
          </View>

          {/* Upcoming due dates */}
          <View style={pay.sectionCard}>
            <View style={pay.sectionHead}>
              <Text style={pay.sectionTitle}>Upcoming due dates</Text>
            </View>
            {overview.upcoming.length === 0 ? (
              <Text style={pay.sectionEmpty}>No upcoming due dates in this view.</Text>
            ) : (
              overview.upcoming.map((due) => (
                <Pressable
                  key={due.billId}
                  onPress={() => router.push(landlordPaymentDetails(due.billId))}
                  style={({ pressed }) => [pay.dueRow, pressed && pay.dueRowPressed]}
                  accessibilityRole="button"
                >
                  <View style={pay.rowLeft}>
                    <Text style={pay.dueName} numberOfLines={1}>
                      {due.tenantName}
                    </Text>
                    <Text style={pay.dueMeta} numberOfLines={1}>
                      {due.propertyName} · {due.roomLabel}
                    </Text>
                  </View>
                  <View style={pay.dueRight}>
                    <Text style={pay.dueAmount}>{formatPeso(due.remaining)}</Text>
                    <Text style={pay.dueDate}>Due {formatShortDate(due.dueDate)}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Recent payments */}
          <View style={pay.sectionCard}>
            <View style={pay.sectionHead}>
              <Text style={pay.sectionTitle}>Recent payments</Text>
              <Pressable
                onPress={() => router.push(routes.landlordPayments)}
                accessibilityRole="button"
              >
                <Text style={pay.sectionLink}>All records</Text>
              </Pressable>
            </View>
            {overview.recentPayments.length === 0 ? (
              <Text style={pay.sectionEmpty}>No payments recorded in this view yet.</Text>
            ) : (
              overview.recentPayments.map((payment) => (
                <Pressable
                  key={payment.id}
                  onPress={() => router.push(landlordPaymentDetails(payment.billId))}
                  style={({ pressed }) => [pay.recentRow, pressed && pay.dueRowPressed]}
                  accessibilityRole="button"
                >
                  <View style={pay.rowLeft}>
                    <Text style={pay.dueName} numberOfLines={1}>
                      {payment.tenantName}
                    </Text>
                    <Text style={pay.dueMeta} numberOfLines={1}>
                      {payment.propertyName} · {payment.roomLabel}
                    </Text>
                  </View>
                  <View style={pay.dueRight}>
                    <Text style={pay.recentAmount}>+{formatPeso(payment.amount)}</Text>
                    <Text style={pay.recentMeta}>
                      {formatShortDate(payment.paidAt)} · {payment.method}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Actions */}
          <View style={pay.actionStack}>
            <Pressable
              onPress={() => router.push(routes.landlordPaymentNew)}
              style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={form.primaryButtonText}>Record payment</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(routes.landlordPayments)}
              style={({ pressed }) => [form.secondaryButton, pressed && form.secondaryButtonPressed]}
              accessibilityRole="button"
            >
              <Ionicons name="list-outline" size={18} color={LANDLORD_THEME.primaryDark} />
              <Text style={form.secondaryButtonText}>Payment records</Text>
            </Pressable>
          </View>

          <Text style={pay.disclaimer}>
            BoardPoint records payments for your bookkeeping — it does not process online
            payments.
          </Text>
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
