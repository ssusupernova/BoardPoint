import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { PaymentStatusBadge } from '@/components/landlord/payment/PaymentStatusBadge';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { landlordPaymentDetails } from '@/routes';
import {
  PAYMENT_METHODS,
  recordPayment,
  toPaymentRecords,
  useLandlordData,
  useLandlordDataReady,
  type PaymentMethod,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatShortDate, parseISODate, toISODate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { paymentStyles as pay } from '../../styles/landlord/payments.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

function parseAmount(raw: string): number {
  return Number(raw.replace(/[₱,\s]/g, ''));
}

export default function RecordPaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ billId?: string }>();
  const paramBillId = typeof params.billId === 'string' ? params.billId : undefined;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const records = useMemo(() => toPaymentRecords(data), [data]);
  const openRecords = useMemo(
    () => records.filter((row) => row.remaining > 0),
    [records]
  );

  const [selectedBillId, setSelectedBillId] = useState<string | null>(paramBillId ?? null);
  const [query, setQuery] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(() => toISODate(new Date()));
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const picked = selectedBillId
    ? records.find((row) => row.billId === selectedBillId) ?? null
    : null;
  const pickedRemaining = picked?.remaining ?? 0;

  const visiblePicks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return openRecords;
    return openRecords.filter((row) =>
      [row.tenantName, row.propertyName, row.roomLabel, row.period].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [openRecords, query]);

  const amountValue = parseAmount(amountStr);
  const amountValid =
    amountStr.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;
  const balanceAfter = Math.max(
    0,
    Math.round((pickedRemaining - (amountValid ? amountValue : 0)) * 100) / 100
  );

  const validate = (): string | null => {
    if (!picked) return 'Choose a bill to record a payment against.';
    if (pickedRemaining <= 0) return 'This bill is fully paid — there is nothing outstanding.';
    if (!amountStr.trim()) return 'Enter the amount received.';
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return 'Amount must be greater than ₱0.';
    }
    if (amountValue > pickedRemaining + 0.009) {
      return `Amount exceeds the outstanding balance of ${formatPeso(pickedRemaining)}.`;
    }
    const paidDate = parseISODate(dateStr);
    if (!paidDate) return 'Enter a valid payment date (YYYY-MM-DD).';
    if (paidDate.getTime() > new Date().setHours(0, 0, 0, 0)) {
      return 'Payment date cannot be in the future.';
    }
    return null;
  };

  const submit = async () => {
    if (!picked || sending) return;
    setSending(true);
    setFormError(null);
    try {
      await recordPayment({
        billId: picked.billId,
        amount: amountValue,
        paidAt: dateStr,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.replace(landlordPaymentDetails(picked.billId));
    } catch (error) {
      setFormError(toErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = () => {
    setFormError(null);
    if (!picked) return;
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    Alert.alert(
      'Confirm payment',
      `Record ${formatPeso(amountValue)} from ${picked.tenantName} for ${picked.propertyName} · ${picked.roomLabel}?\n\nBilling period: ${picked.period}\nMethod: ${method}${
        reference.trim() ? `\nReference: ${reference.trim()}` : ''
      }\nDate: ${formatDisplayDate(dateStr)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Record payment', onPress: () => void submit() },
      ]
    );
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                <Text style={styles.brandTitle}>Record Payment</Text>
                <Text style={styles.brandSubtitle}>NEW PAYMENT ENTRY</Text>
              </View>
            </View>

            {!picked ? (
              /* ------------------------------------------------ Bill picker -- */
              <>
                <View style={pay.searchRow}>
                  <Ionicons name="search" size={16} color={LANDLORD_THEME.textMuted} />
                  <TextInput
                    style={pay.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search tenant, room, or period"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    autoCorrect={false}
                    returnKeyType="search"
                    accessibilityLabel="Search open bills"
                  />
                  {query.length > 0 ? (
                    <Pressable
                      onPress={() => setQuery('')}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                    >
                      <Ionicons name="close-circle" size={16} color={LANDLORD_THEME.textMuted} />
                    </Pressable>
                  ) : null}
                </View>

                <Text style={pay.countLine}>
                  {visiblePicks.length} open{' '}
                  {visiblePicks.length === 1 ? 'bill' : 'bills'} with an outstanding balance
                </Text>

                <View style={billStyles.listContainer}>
                  {visiblePicks.length === 0 ? (
                    <Text style={billStyles.emptyList}>
                      {query.trim()
                        ? `No open bills match “${query.trim()}”.`
                        : 'Every bill is settled — there is nothing left to record.'}
                    </Text>
                  ) : (
                    visiblePicks.map((row) => (
                      <Pressable
                        key={row.billId}
                        onPress={() => {
                          setSelectedBillId(row.billId);
                          setFormError(null);
                        }}
                        style={({ pressed }) => [
                          pay.recordCard,
                          pressed && pay.recordCardPressed,
                        ]}
                        accessibilityRole="button"
                      >
                        <View style={pay.recordTop}>
                          <View style={pay.rowLeft}>
                            <Text style={pay.recordName} numberOfLines={1}>
                              {row.tenantName}
                            </Text>
                            <Text style={pay.recordWhere} numberOfLines={1}>
                              {row.propertyName} · {row.roomLabel}
                            </Text>
                            <Text style={pay.recordPeriod} numberOfLines={1}>
                              {row.period} · Due {formatShortDate(row.dueDate)}
                            </Text>
                          </View>
                          <PaymentStatusBadge status={row.status} />
                        </View>

                        <View style={pay.moneyRow}>
                          <View style={pay.moneyCol}>
                            <Text style={pay.moneyLabel}>DUE</Text>
                            <Text style={pay.moneyValue}>{formatPeso(row.amountDue)}</Text>
                          </View>
                          <View style={pay.moneyCol}>
                            <Text style={pay.moneyLabel}>PAID</Text>
                            <Text style={[pay.moneyValue, pay.moneyValuePaid]}>
                              {formatPeso(row.amountPaid)}
                            </Text>
                          </View>
                          <View style={pay.moneyCol}>
                            <Text style={pay.moneyLabel}>BALANCE</Text>
                            <Text style={[pay.moneyValue, pay.moneyValueBalance]}>
                              {formatPeso(row.remaining)}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>

                <View style={pay.actionStack}>
                  <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                      form.secondaryButton,
                      pressed && form.secondaryButtonPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={form.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* Selected bill */}
                <View style={pay.sectionCard}>
                  <View style={pay.billHeadTop}>
                    <View style={pay.rowLeft}>
                      <Text style={pay.billTitle} numberOfLines={1}>
                        {picked.tenantName}
                      </Text>
                      <Text style={pay.billSub} numberOfLines={1}>
                        {picked.propertyName} · {picked.roomLabel}
                      </Text>
                      <Text style={pay.billMeta} numberOfLines={1}>
                        {picked.period} · Due {formatShortDate(picked.dueDate)}
                      </Text>
                    </View>
                    <PaymentStatusBadge status={picked.status} />
                  </View>

                  <View style={pay.moneyRow}>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>DUE</Text>
                      <Text style={pay.moneyValue}>{formatPeso(picked.amountDue)}</Text>
                    </View>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>PAID</Text>
                      <Text style={[pay.moneyValue, pay.moneyValuePaid]}>
                        {formatPeso(picked.amountPaid)}
                      </Text>
                    </View>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>BALANCE</Text>
                      <Text style={[pay.moneyValue, pay.moneyValueBalance]}>
                        {formatPeso(picked.remaining)}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => setSelectedBillId(null)}
                    style={pay.changeBill}
                    accessibilityRole="button"
                  >
                    <Text style={pay.sectionLink}>Change bill</Text>
                  </Pressable>
                </View>

                {/* Payment fields */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Payment details</Text>

                  <View style={pay.formStack}>
                    <View style={form.formGroup}>
                      <Text style={form.fieldLabel}>Amount received</Text>
                      <View style={form.field}>
                        <Text style={pay.pesoPrefix}>₱</Text>
                        <TextInput
                          style={form.input}
                          value={amountStr}
                          onChangeText={setAmountStr}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel="Amount received"
                        />
                      </View>
                      <View style={pay.quickRow}>
                        <Pressable
                          onPress={() => setAmountStr(pickedRemaining.toFixed(2))}
                          style={pay.quickChip}
                          accessibilityRole="button"
                        >
                          <Text style={pay.quickChipText}>
                            Fill balance {formatPeso(pickedRemaining)}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={form.formGroup}>
                      <Text style={form.fieldLabel}>Payment date</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={dateStr}
                          onChangeText={setDateStr}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          maxLength={10}
                          autoCapitalize="none"
                          autoCorrect={false}
                          accessibilityLabel="Payment date"
                        />
                      </View>
                      <View style={pay.quickRow}>
                        <Pressable
                          onPress={() => setDateStr(toISODate(new Date()))}
                          style={pay.quickChip}
                          accessibilityRole="button"
                        >
                          <Text style={pay.quickChipText}>
                            Today · {formatShortDate(toISODate(new Date()))}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={form.formGroup}>
                      <Text style={form.fieldLabel}>Payment method</Text>
                      <View style={pay.chipsRow}>
                        {PAYMENT_METHODS.map((option) => (
                          <FilterChip
                            key={option}
                            label={option}
                            active={method === option}
                            onPress={() => setMethod(option)}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={form.formGroup}>
                      <Text style={form.fieldLabel}>Reference no. (optional)</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={reference}
                          onChangeText={setReference}
                          placeholder="e.g. GCash 09171234567"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          autoCapitalize="characters"
                          accessibilityLabel="Reference number"
                        />
                      </View>
                    </View>

                    <View style={form.formGroup}>
                      <Text style={form.fieldLabel}>Notes (optional)</Text>
                      <View style={[form.field, form.fieldMultiline]}>
                        <TextInput
                          style={[form.input, form.inputMultiline]}
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="Anything worth remembering about this payment"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          multiline
                          accessibilityLabel="Notes"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Review */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Review</Text>
                  <View style={pay.reviewRow}>
                    <Text style={pay.reviewLabel}>Bill amount</Text>
                    <Text style={pay.reviewValue}>{formatPeso(picked.amountDue)}</Text>
                  </View>
                  <View style={pay.reviewRow}>
                    <Text style={pay.reviewLabel}>Paid so far</Text>
                    <Text style={pay.reviewValue}>{formatPeso(picked.amountPaid)}</Text>
                  </View>
                  <View style={pay.reviewRow}>
                    <Text style={pay.reviewLabel}>Amount receiving</Text>
                    <Text style={pay.reviewValueStrong}>
                      {formatPeso(amountValid ? amountValue : 0)}
                    </Text>
                  </View>
                  <View style={pay.reviewRow}>
                    <Text style={pay.reviewLabel}>Balance after</Text>
                    <Text
                      style={[
                        pay.reviewValue,
                        balanceAfter <= 0 && pay.moneyValuePaid,
                      ]}
                    >
                      {formatPeso(balanceAfter)}
                    </Text>
                  </View>
                  <FieldError error={formError} />
                </View>

                {/* Submit */}
                <View style={pay.actionStack}>
                  <Pressable
                    onPress={handleConfirm}
                    disabled={sending}
                    style={({ pressed }) => [
                      form.primaryButton,
                      pressed && form.primaryButtonPressed,
                      sending && form.primaryButtonDisabled,
                    ]}
                    accessibilityRole="button"
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color={LANDLORD_THEME.onPrimary}
                        />
                        <Text style={form.primaryButtonText}>Review &amp; confirm</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => router.back()}
                    disabled={sending}
                    style={({ pressed }) => [
                      form.secondaryButton,
                      pressed && form.secondaryButtonPressed,
                      sending && form.primaryButtonDisabled,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={form.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                </View>

                <Text style={pay.disclaimer}>
                  Payments are recorded in BoardPoint’s ledger only — no online payment is
                  processed.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
