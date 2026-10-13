import { PaymentStatusBadge } from '@/components/landlord/payment/PaymentStatusBadge';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { landlordPaymentNewFor, routes } from '@/routes';
import {
  paymentsOfBill,
  reversePayment,
  toPaymentRecords,
  useLandlordData,
  useLandlordDataReady,
  type PaymentEntry,
  type PaymentRecordView,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatShortDate, toISODate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { paymentStyles as pay } from '../../styles/landlord/payments.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const hour12 = date.getHours() % 12 || 12;
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  const suffix = date.getHours() < 12 ? 'AM' : 'PM';
  return `${formatDisplayDate(toISODate(date))} · ${hour12}:${minute} ${suffix}`;
}

function buildReceipt(record: PaymentRecordView, entries: PaymentEntry[]): string {
  const divider = '-'.repeat(30);
  const lines = entries.map((entry) => {
    const method = entry.method ? ` · ${entry.method}` : '';
    const ref = entry.reference ? ` (Ref: ${entry.reference})` : '';
    return `${formatDisplayDate(entry.paidAt)} · ${formatPeso(entry.amount)}${method}${ref}`;
  });
  return [
    'BOARDPOINT PAYMENT RECEIPT',
    divider,
    `Tenant: ${record.tenantName}`,
    `Property: ${record.propertyName} · ${record.roomLabel}`,
    `Billing period: ${record.period}`,
    `Bill amount: ${formatPeso(record.amountDue)}`,
    `Due date: ${formatDisplayDate(record.dueDate)}`,
    '',
    'PAYMENTS RECORDED',
    ...lines,
    '',
    `Total paid: ${formatPeso(record.amountPaid)}`,
    `Remaining balance: ${formatPeso(record.remaining)}`,
    `Status: ${record.status}`,
    '',
    `Generated ${formatTimestamp(new Date().toISOString())}`,
    'BoardPoint records payments for bookkeeping only;',
    'no online payment is processed.',
  ].join('\n');
}

export default function PaymentDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ billId?: string }>();
  const billId = typeof params.billId === 'string' ? params.billId : undefined;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const record = useMemo(
    () =>
      billId
        ? toPaymentRecords(data).find((row) => row.billId === billId) ?? null
        : null,
    [data, billId]
  );
  const entries = useMemo(
    () => (billId ? paymentsOfBill(data, billId) : []),
    [data, billId]
  );

  const [reversingId, setReversingId] = useState<string | null>(null);

  const confirmReverse = (entry: PaymentEntry) => {
    Alert.alert(
      'Reverse payment?',
      `Remove the ${formatPeso(entry.amount)} entry recorded on ${formatDisplayDate(
        entry.paidAt
      )}?\n\nThe bill balance will reopen by this amount, and the reversal is written to the activity history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reverse entry',
          style: 'destructive',
          onPress: () => void doReverse(entry.id),
        },
      ]
    );
  };

  const doReverse = async (paymentId: string) => {
    setReversingId(paymentId);
    try {
      await reversePayment(paymentId);
    } catch (error) {
      Alert.alert('Could not reverse', toErrorMessage(error));
    } finally {
      setReversingId(null);
    }
  };

  const shareReceipt = async () => {
    if (!record || record.amountPaid <= 0) return;
    try {
      await Share.share({
        title: 'BoardPoint payment receipt',
        message: buildReceipt(record, entries),
      });
    } catch (error) {
      Alert.alert('Could not share', toErrorMessage(error));
    }
  };

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={pay.loadingBox}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={pay.loadingText}>Loading…</Text>
        </View>
      </View>
    );
  }

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
              onPress={() => router.back()}
              style={({ pressed }) => [
                billStyles.headerBackBtn,
                pressed && billStyles.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={billStyles.headerTextCol}>
              <Text style={styles.brandTitle}>Payment Details</Text>
              <Text style={styles.brandSubtitle}>BILL &amp; TRANSACTION HISTORY</Text>
            </View>
          </View>

          {!record ? (
            <>
              <Text style={pay.missing}>
                This bill no longer exists. It may have been removed with its property.
              </Text>
              <View style={pay.actionStack}>
                <Pressable
                  onPress={() => router.replace(routes.landlordBills)}
                  style={({ pressed }) => [
                    form.secondaryButton,
                    pressed && form.secondaryButtonPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={form.secondaryButtonText}>Back to billing</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Bill summary */}
              <View style={pay.sectionCard}>
                <View style={pay.billHeadTop}>
                  <View style={pay.rowLeft}>
                    <Text style={pay.billTitle} numberOfLines={1}>
                      {record.tenantName}
                    </Text>
                    <Text style={pay.billSub} numberOfLines={1}>
                      {record.propertyName} · {record.roomLabel}
                    </Text>
                    <Text style={pay.billMeta} numberOfLines={1}>
                      {record.period} · Due {formatShortDate(record.dueDate)}
                    </Text>
                  </View>
                  <PaymentStatusBadge status={record.status} />
                </View>

                <Text style={pay.billAmountBig}>{formatPeso(record.amountDue)}</Text>
                <Text style={pay.billKind}>
                  {record.kind === 'rent'
                    ? `Rent${record.note ? ` · ${record.note}` : ''}`
                    : record.note ?? 'Shared expense'}
                </Text>

                <View style={pay.totalsRow}>
                  <View style={pay.totalBox}>
                    <Text style={pay.totalLabel}>PAID</Text>
                    <Text style={[pay.totalValue, pay.totalValuePaid]}>
                      {formatPeso(record.amountPaid)}
                    </Text>
                  </View>
                  <View style={pay.totalBox}>
                    <Text style={pay.totalLabel}>BALANCE</Text>
                    <Text
                      style={[
                        pay.totalValue,
                        record.status === 'Overdue'
                          ? pay.totalValueDanger
                          : record.remaining > 0
                            ? undefined
                            : pay.totalValuePaid,
                      ]}
                    >
                      {formatPeso(record.remaining)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Entries */}
              <View style={pay.sectionCard}>
                <View style={pay.sectionHead}>
                  <Text style={pay.sectionTitle}>
                    Payment entries ({entries.length})
                  </Text>
                  {record.remaining > 0 ? (
                    <Pressable
                      onPress={() => router.push(landlordPaymentNewFor(record.billId))}
                      accessibilityRole="button"
                    >
                      <Text style={pay.sectionLink}>Record payment</Text>
                    </Pressable>
                  ) : null}
                </View>

                {entries.length === 0 ? (
                  <Text style={pay.sectionEmpty}>
                    No payments recorded on this bill yet.
                  </Text>
                ) : (
                  entries.map((entry) => (
                    <View key={entry.id} style={pay.entryCard}>
                      <View style={pay.entryTop}>
                        <Text style={pay.entryAmount}>{formatPeso(entry.amount)}</Text>
                        <View style={pay.methodPill}>
                          <Text style={pay.methodPillText}>{entry.method}</Text>
                        </View>
                      </View>
                      <Text style={pay.entryMeta}>
                        Paid {formatDisplayDate(entry.paidAt)}
                        {entry.reference ? ` · Ref ${entry.reference}` : ''}
                      </Text>
                      {entry.notes ? <Text style={pay.entryNote}>{entry.notes}</Text> : null}
                      <View style={pay.entryFooter}>
                        <Text style={pay.recordedAt}>
                          Recorded {formatTimestamp(entry.createdAt)}
                        </Text>
                        {reversingId === entry.id ? (
                          <ActivityIndicator
                            size="small"
                            color={LANDLORD_THEME.badgeUrgentText}
                          />
                        ) : (
                          <Pressable
                            onPress={() => confirmReverse(entry)}
                            style={pay.reverseBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Reverse this payment"
                          >
                            <Text style={pay.reverseBtnText}>Reverse</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Actions */}
              <View style={pay.actionStack}>
                {record.remaining > 0 ? (
                  <Pressable
                    onPress={() => router.push(landlordPaymentNewFor(record.billId))}
                    style={({ pressed }) => [
                      form.primaryButton,
                      pressed && form.primaryButtonPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={LANDLORD_THEME.onPrimary}
                    />
                    <Text style={form.primaryButtonText}>Record payment</Text>
                  </Pressable>
                ) : null}
                {record.amountPaid > 0 ? (
                  <Pressable
                    onPress={() => void shareReceipt()}
                    style={({ pressed }) => [
                      form.secondaryButton,
                      pressed && form.secondaryButtonPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="share-outline"
                      size={18}
                      color={LANDLORD_THEME.primaryDark}
                    />
                    <Text style={form.secondaryButtonText}>Share receipt</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={pay.disclaimer}>
                BoardPoint records payments for your bookkeeping — it does not process online
                payments.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
