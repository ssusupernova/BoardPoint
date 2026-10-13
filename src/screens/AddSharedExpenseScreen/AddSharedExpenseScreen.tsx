import { AllocationBreakdown } from '@/components/landlord/billing/AllocationBreakdown';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { landlordExpenseDetails } from '@/routes';
import {
  ALLOCATION_METHOD_LABELS,
  ALLOCATION_METHODS,
  EXPENSE_CATEGORIES,
  computeAllocation,
  createSharedExpense,
  currentMonthPeriod,
  eligibleTenantsOf,
  expenseViewOf,
  updateSharedExpense,
  useLandlordData,
  useLandlordDataReady,
  type AllocationMethod,
  type ExpenseAllocationRow,
  type ExpenseCategory,
} from '@/services/landlordData';
import { useAuthSession } from '@/services/auth';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatShortDate, parseISODate, toISODate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
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
import { expenseStyles as exp } from '../../styles/landlord/expenses.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

function parseAmount(raw: string): number {
  return Number(raw.replace(/[₱,\s]/g, ''));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const METHOD_HINTS: Record<AllocationMethod, string> = {
  equal: 'Everyone pays the same share.',
  byRoom: 'Each room pays one share; roommates split that room’s share.',
  byOccupancy: 'Shares follow room capacity — bigger rooms pay more.',
  custom: 'Type each tenant’s exact amount; they must add up to the total.',
};

export default function AddSharedExpenseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ expenseId?: string; propertyId?: string }>();
  const expenseId = Array.isArray(params.expenseId) ? params.expenseId[0] : params.expenseId;
  const presetPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={exp.loadingBox}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={exp.loadingText}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (expenseId && !data.sharedExpenses.some((item) => item.id === expenseId)) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
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
                <Text style={styles.brandTitle}>Shared Expense</Text>
                <Text style={styles.brandSubtitle}>SPLIT UTILITY COSTS</Text>
              </View>
            </View>
            <Text style={exp.missing}>This shared expense no longer exists.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* Mounted only once the store is hydrated, so edit prefill reads real data. */
  return (
    <ExpenseForm
      expenseId={expenseId}
      presetPropertyId={presetPropertyId}
      landlordId={landlordId}
      topInset={insets.top}
    />
  );
}

type FormProps = {
  expenseId?: string;
  presetPropertyId?: string;
  landlordId?: string;
  topInset: number;
};

function ExpenseForm({ expenseId, presetPropertyId, landlordId, topInset }: FormProps) {
  const router = useRouter();
  const data = useLandlordData();

  const existing = expenseId ? expenseViewOf(data, expenseId) : null;
  const defaultPropertyId =
    presetPropertyId ?? existing?.propertyId ?? data.properties[0]?.id ?? '';

  const [propertyId, setPropertyId] = useState(defaultPropertyId);
  const [category, setCategory] = useState<ExpenseCategory>(existing?.category ?? 'Electricity');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [amountStr, setAmountStr] = useState(existing ? String(existing.amount) : '');
  const [periodStart, setPeriodStart] = useState(
    existing?.periodStart ?? currentMonthPeriod().start
  );
  const [periodEnd, setPeriodEnd] = useState(existing?.periodEnd ?? currentMonthPeriod().end);
  const [billDate, setBillDate] = useState(() => existing?.billDate ?? toISODate(new Date()));
  const [dueDate, setDueDate] = useState(
    () => existing?.dueDate ?? toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );
  const [attachName, setAttachName] = useState<string | null>(existing?.attachmentName ?? null);
  const [attachUri, setAttachUri] = useState<string | null>(existing?.attachmentUri ?? null);
  const [method, setMethodState] = useState<AllocationMethod>(
    existing?.allocationMethod ?? 'equal'
  );
  const [tenantIds, setTenantIds] = useState<string[]>(() =>
    existing
      ? existing.tenantIds
      : defaultPropertyId
        ? eligibleTenantsOf(data, defaultPropertyId).map((tenant) => tenant.id)
        : []
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(() =>
    existing && existing.allocationMethod === 'custom'
      ? Object.fromEntries(existing.allocations.map((a) => [a.tenantId, a.amount.toFixed(2)]))
      : {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const property = data.properties.find((item) => item.id === propertyId) ?? null;
  const eligible = useMemo(
    () => (propertyId ? eligibleTenantsOf(data, propertyId) : []),
    [data, propertyId]
  );
  const selected = useMemo(
    () => eligible.filter((tenant) => tenantIds.includes(tenant.id)),
    [eligible, tenantIds]
  );

  const amountValue = parseAmount(amountStr);
  const amountValid = amountStr.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;

  const selectedIds = selected.map((tenant) => tenant.id);

  /* ------------------------------ allocation ----------------------------- */

  const numericCustom = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of selectedIds) {
      const raw = customAmounts[id] ?? '';
      const parsed = raw.trim() === '' ? 0 : parseAmount(raw);
      out[id] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }
    return out;
  }, [customAmounts, selectedIds]);

  const allocation = useMemo(() => {
    if (selectedIds.length === 0 || !amountValid) return [];
    return computeAllocation(data, {
      propertyId,
      tenantIds: selectedIds,
      total: amountValue,
      method,
      customAmounts: numericCustom,
    });
  }, [data, propertyId, selectedIds, amountValue, amountValid, method, numericCustom]);

  const rows: ExpenseAllocationRow[] = useMemo(
    () =>
      allocation.map((item) => {
        const tenant = eligible.find((t) => t.id === item.tenantId);
        const room = property?.rooms.find((r) => r.id === tenant?.roomId);
        return {
          tenantId: item.tenantId,
          tenantName: tenant?.fullName ?? 'Tenant',
          roomLabel: room?.label ?? '',
          amount: item.amount,
        };
      }),
    [allocation, eligible, property]
  );

  const customSum = selectedIds.reduce((sum, id) => sum + (numericCustom[id] ?? 0), 0);
  const customMismatch =
    method === 'custom' && amountValid
      ? Math.abs(round2(customSum) - amountValue) > 0.009
        ? `Custom amounts add up to ${formatPeso(round2(customSum))} — adjust them to ${formatPeso(
            amountValue
          )}.`
        : null
      : null;

  /* ------------------------------- mutations ----------------------------- */

  const refillEvenShares = (ids: string[], total: number): Record<string, string> => {
    if (ids.length === 0 || !Number.isFinite(total) || total <= 0) return {};
    const even = computeAllocation(data, {
      propertyId,
      tenantIds: ids,
      total,
      method: 'equal',
    });
    return Object.fromEntries(even.map((a) => [a.tenantId, a.amount.toFixed(2)]));
  };

  const changeMethod = (next: AllocationMethod): void => {
    setMethodState(next);
    setFormError(null);
    if (next === 'custom') {
      setCustomAmounts(refillEvenShares(selectedIds, amountValue));
    }
  };

  const changeProperty = (nextId: string): void => {
    setPropertyId(nextId);
    setFormError(null);
    const ids = eligibleTenantsOf(data, nextId).map((tenant) => tenant.id);
    setTenantIds(ids);
    if (method === 'custom') setCustomAmounts(refillEvenShares(ids, amountValue));
  };

  const toggleTenant = (id: string): void => {
    setFormError(null);
    const next = tenantIds.includes(id)
      ? tenantIds.filter((item) => item !== id)
      : [...tenantIds, id];
    setTenantIds(next);
    if (method === 'custom' && !tenantIds.includes(id) && amountValid && next.length > 0) {
      setCustomAmounts((prev) => ({
        ...prev,
        [id]: (amountValue / next.length).toFixed(2),
      }));
    }
  };

  const pickAttachment = async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Allow photo access to attach a photo of the utility bill.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) return;
      setAttachUri(asset.uri);
      setAttachName(asset.fileName ?? asset.uri.split('/').pop() ?? 'Utility bill photo');
    } catch (error) {
      Alert.alert('Could not open photos', toErrorMessage(error));
    }
  };

  const validate = (): string | null => {
    if (!propertyId) return 'Choose a property.';
    if (selectedIds.length === 0) return 'Select at least one tenant with an occupied room.';
    if (!amountStr.trim()) return 'Enter the total amount of the bill.';
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return 'Amount must be greater than ₱0.';
    }
    const start = parseISODate(periodStart);
    const end = parseISODate(periodEnd);
    if (!start) return 'Enter a valid period start (YYYY-MM-DD).';
    if (!end) return 'Enter a valid period end (YYYY-MM-DD).';
    if (start.getTime() > end.getTime()) return 'The period start cannot be after the end.';
    if (!parseISODate(billDate)) return 'Enter a valid bill date (YYYY-MM-DD).';
    if (!parseISODate(dueDate)) return 'Enter a valid due date (YYYY-MM-DD).';
    if (customMismatch) return customMismatch;
    return null;
  };

  const submit = async (): Promise<void> => {
    if (sending) return;
    setSending(true);
    setFormError(null);
    try {
      const input = {
        propertyId,
        category,
        description: description.trim() || undefined,
        periodStart,
        periodEnd,
        amount: amountValue,
        billDate,
        dueDate,
        attachmentName: attachName ?? undefined,
        attachmentUri: attachUri ?? undefined,
        allocationMethod: method,
        tenantIds: selectedIds,
        customAmounts: numericCustom,
        landlordId,
      };
      const saved = existing
        ? await updateSharedExpense(existing.id, input)
        : await createSharedExpense(input);
      router.replace(landlordExpenseDetails(saved.id));
    } catch (error) {
      setFormError(toErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = (): void => {
    setFormError(null);
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    const breakdown = rows
      .map((row) => `${row.tenantName}: ${formatPeso(row.amount)}`)
      .join('\n');
    Alert.alert(
      existing ? 'Save changes?' : 'Record shared expense?',
      `${formatPeso(amountValue)} for ${category}${
        description.trim() ? ` — ${description.trim()}` : ''
      }\n${property?.name ?? ''}\nPeriod: ${formatDisplayDate(periodStart)} – ${formatDisplayDate(
        periodEnd
      )}\nDue: ${formatDisplayDate(dueDate)}\nSplit: ${ALLOCATION_METHOD_LABELS[method]}\n\n${breakdown}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: existing ? 'Save changes' : 'Record expense', onPress: () => void submit() },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: topInset + 16 }]}
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
                <Text style={styles.brandTitle}>
                  {existing ? 'Edit Shared Expense' : 'Add Shared Expense'}
                </Text>
                <Text style={styles.brandSubtitle}>SPLIT UTILITY COSTS</Text>
              </View>
            </View>

            {/* Property */}
            <Text style={exp.selectorLabel}>PROPERTY</Text>
            <View style={exp.chipsRow}>
              {data.properties.map((item) => (
                <FilterChip
                  key={item.id}
                  label={item.name}
                  active={propertyId === item.id}
                  onPress={() => changeProperty(item.id)}
                />
              ))}
            </View>

            {/* Category + description */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Expense details</Text>

              <Text style={[form.fieldLabel, { marginTop: 12 }]}>Category</Text>
              <View style={exp.chipsRow}>
                {EXPENSE_CATEGORIES.map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    active={category === option}
                    onPress={() => setCategory(option)}
                  />
                ))}
              </View>

              <View style={[form.formGroup, { marginTop: 14 }]}>
                <Text style={form.fieldLabel}>What is this for? (optional)</Text>
                <View style={form.field}>
                  <TextInput
                    style={form.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g. Meralco statement for common areas"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    accessibilityLabel="Expense description"
                  />
                </View>
              </View>

              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Total amount</Text>
                <View style={form.field}>
                  <Text style={exp.pesoPrefix}>₱</Text>
                  <TextInput
                    style={form.input}
                    value={amountStr}
                    onChangeText={setAmountStr}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    accessibilityLabel="Total amount"
                  />
                </View>
              </View>
            </View>

            {/* Dates */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Billing dates</Text>

              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Billing period</Text>
                <View style={exp.dateRow}>
                  <View style={exp.dateCol}>
                    <View style={form.field}>
                      <TextInput
                        style={form.input}
                        value={periodStart}
                        onChangeText={setPeriodStart}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        maxLength={10}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Period start"
                      />
                    </View>
                  </View>
                  <View style={exp.dateCol}>
                    <View style={form.field}>
                      <TextInput
                        style={form.input}
                        value={periodEnd}
                        onChangeText={setPeriodEnd}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        maxLength={10}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Period end"
                      />
                    </View>
                  </View>
                </View>
                <View style={exp.chipsRow}>
                  <FilterChip
                    label="This month"
                    active={false}
                    onPress={() => {
                      const month = currentMonthPeriod();
                      setPeriodStart(month.start);
                      setPeriodEnd(month.end);
                    }}
                  />
                </View>
              </View>

              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Bill date &amp; due date</Text>
                <View style={exp.dateRow}>
                  <View style={exp.dateCol}>
                    <View style={form.field}>
                      <TextInput
                        style={form.input}
                        value={billDate}
                        onChangeText={setBillDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        maxLength={10}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Bill date"
                      />
                    </View>
                  </View>
                  <View style={exp.dateCol}>
                    <View style={form.field}>
                      <TextInput
                        style={form.input}
                        value={dueDate}
                        onChangeText={setDueDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        maxLength={10}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel="Due date"
                      />
                    </View>
                  </View>
                </View>
                <View style={exp.chipsRow}>
                  <FilterChip
                    label={`Today · ${formatShortDate(toISODate(new Date()))}`}
                    active={false}
                    onPress={() => {
                      const today = toISODate(new Date());
                      setBillDate(today);
                      setDueDate(today);
                    }}
                  />
                  <FilterChip
                    label="Due in 7 days"
                    active={false}
                    onPress={() =>
                      setDueDate(toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)))
                    }
                  />
                </View>
              </View>

              {/* Attachment */}
              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Attach the utility bill (optional)</Text>
                <View style={exp.attachRow}>
                  {attachUri ? (
                    <View style={exp.attachThumb}>
                      <View style={exp.attachThumbIcon}>
                        <Ionicons name="image-outline" size={18} color={LANDLORD_THEME.primary} />
                      </View>
                      <Text style={exp.attachThumbName} numberOfLines={1}>
                        {attachName ?? 'Photo'}
                      </Text>
                      <Pressable
                        onPress={() => {
                          setAttachUri(null);
                          setAttachName(null);
                        }}
                        style={exp.attachRemove}
                        accessibilityRole="button"
                        accessibilityLabel="Remove attachment"
                      >
                        <Text style={exp.attachRemoveText}>Remove</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => void pickAttachment()}
                      style={({ pressed }) => [
                        exp.attachButton,
                        pressed && form.secondaryButtonPressed,
                      ]}
                      accessibilityRole="button"
                    >
                      <Ionicons name="camera-outline" size={16} color={LANDLORD_THEME.primaryDark} />
                      <Text style={exp.attachButtonText}>Attach bill photo</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Allocation */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>How to split it</Text>

              <Text style={[form.fieldLabel, { marginTop: 12 }]}>Allocation method</Text>
              <View style={exp.chipsRow}>
                {ALLOCATION_METHODS.map((option) => (
                  <FilterChip
                    key={option}
                    label={ALLOCATION_METHOD_LABELS[option]}
                    active={method === option}
                    onPress={() => changeMethod(option)}
                  />
                ))}
              </View>
              <Text style={form.sectionHint}>{METHOD_HINTS[method]}</Text>

              <Text style={[form.fieldLabel, { marginTop: 14 }]}>
                Tenants included ({selected.length}/{eligible.length})
              </Text>
              <View style={exp.chipsRow}>
                <Pressable
                  onPress={() => {
                    const ids = eligible.map((tenant) => tenant.id);
                    setTenantIds(ids);
                    if (method === 'custom') setCustomAmounts(refillEvenShares(ids, amountValue));
                  }}
                  style={exp.chip}
                  accessibilityRole="button"
                >
                  <Text style={exp.chipText}>Select all</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setTenantIds([]);
                    if (method === 'custom') setCustomAmounts({});
                  }}
                  style={exp.chip}
                  accessibilityRole="button"
                >
                  <Text style={exp.chipText}>Clear</Text>
                </Pressable>
                {method === 'custom' ? (
                  <Pressable
                    onPress={() => setCustomAmounts(refillEvenShares(selectedIds, amountValue))}
                    style={exp.chip}
                    accessibilityRole="button"
                  >
                    <Text style={exp.chipText}>Even split</Text>
                  </Pressable>
                ) : null}
              </View>

              {eligible.length === 0 ? (
                <Text style={form.sectionHint}>
                  No active tenants with an occupied room in this property yet.
                </Text>
              ) : (
                eligible.map((tenant) => {
                  const active = tenantIds.includes(tenant.id);
                  const room = property?.rooms.find((r) => r.id === tenant.roomId);
                  return (
                    <Pressable
                      key={tenant.id}
                      onPress={() => toggleTenant(tenant.id)}
                      style={[exp.tenantRow, active && exp.tenantRowActive]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                    >
                      <View style={[exp.tenantBox, active && exp.tenantBoxActive]}>
                        {active ? <Text style={exp.tenantBoxMark}>✓</Text> : null}
                      </View>
                      <View style={exp.tenantInfo}>
                        <Text style={exp.tenantName} numberOfLines={1}>
                          {tenant.fullName}
                        </Text>
                        <Text style={exp.tenantMeta} numberOfLines={1}>
                          {room?.label ?? 'No room'} · {formatPeso(tenant.monthlyRent)}/mo
                        </Text>
                      </View>
                      {method === 'custom' && active ? (
                        <TextInput
                          style={exp.customAmountInput}
                          value={customAmounts[tenant.id] ?? ''}
                          onChangeText={(text) =>
                            setCustomAmounts((prev) => ({ ...prev, [tenant.id]: text }))
                          }
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel={`Custom amount for ${tenant.fullName}`}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              )}

              <AllocationBreakdown
                rows={rows}
                total={amountValid ? amountValue : 0}
                hint={ALLOCATION_METHOD_LABELS[method]}
                mismatch={customMismatch}
              />
            </View>

            <FieldError error={formError} />

            {/* Submit */}
            <View style={exp.actionStack}>
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
                    <Text style={form.primaryButtonText}>
                      {existing ? 'Save changes' : 'Review & confirm'}
                    </Text>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                disabled={sending}
                style={({ pressed }) => [
                  form.secondaryButton,
                  pressed && form.secondaryButtonPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={form.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>

            <Text style={exp.disclaimer}>
              Shares are frozen when the expense is recorded. Editing later recomputes the
              split for future bills only — finalized statements are corrected separately.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
