import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import {
  addStatementCorrection,
  discardStatement,
  finalizeStatement,
  formatPeriodLabel,
  statementViewOf,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatRelativeTime } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
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

export default function StatementDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ statementId?: string }>();
  const statementId = Array.isArray(params.statementId)
    ? params.statementId[0]
    : params.statementId;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const view = statementId ? statementViewOf(data, statementId) : null;

  const [busy, setBusy] = useState(false);
  const [corrLabel, setCorrLabel] = useState('');
  const [corrAmount, setCorrAmount] = useState('');
  const [corrReason, setCorrReason] = useState('');
  const [corrError, setCorrError] = useState<string | null>(null);

  const run = async (action: () => Promise<unknown>): Promise<void> => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      Alert.alert('Something went wrong', toErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmFinalize = (): void => {
    if (!view) return;
    const newCharges = view.lines.filter((line) => !line.billId).length;
    Alert.alert(
      'Finalize statement?',
      `${
        newCharges > 0
          ? `Post ${newCharges} ${newCharges === 1 ? 'charge' : 'charges'} for ${view.tenantName} as rent bills totalling ${formatPeso(view.totalDue)}.`
          : `Lock the statement for ${view.tenantName} — its rent bill already exists, total ${formatPeso(view.totalDue)}.`
      }\n\nDue ${formatDisplayDate(view.dueDate)}\n\nFinalized amounts lock — later fixes are recorded as visible corrections.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize',
          onPress: () => void run(async () => { await finalizeStatement(view.id); }),
        },
      ]
    );
  };

  const confirmDiscard = (): void => {
    if (!view) return;
    Alert.alert(
      'Discard draft?',
      `Remove the estimated statement for ${view.tenantName}? Nothing has been billed yet, so no bills need cleaning up.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard draft',
          style: 'destructive',
          onPress: () => {
            void run(async () => {
              await discardStatement(view.id);
              router.back();
            });
          },
        },
      ]
    );
  };

  const handleCorrection = (): void => {
    if (!view || busy) return;
    setCorrError(null);
    const label = corrLabel.trim();
    const reason = corrReason.trim();
    const amount = parseAmount(corrAmount);
    if (!label) return setCorrError('Enter a short label for the correction.');
    if (!Number.isFinite(amount) || amount === 0) {
      return setCorrError('Enter an amount other than ₱0 (use a minus to credit the tenant).');
    }
    if (!reason) return setCorrError('Enter a reason for the correction.');

    Alert.alert(
      'Apply correction?',
      `${label}: ${formatPeso(amount)}\nReason: ${reason}\n\nThis is recorded on the finalized statement — the original calculation stays visible.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply correction',
          onPress: () => {
            void run(async () => {
              await addStatementCorrection(view.id, { label, amount, reason });
              setCorrLabel('');
              setCorrAmount('');
              setCorrReason('');
            });
          },
        },
      ]
    );
  };

  const shareStatement = async (): Promise<void> => {
    if (!view) return;
    try {
      const lines = view.lines.map((line) => `${line.label}: ${formatPeso(line.amount)}`);
      if (view.previousBalance > 0) {
        lines.push(`Previous unpaid balance: ${formatPeso(view.previousBalance)}`);
      }
      for (const correction of view.corrections) {
        lines.push(`Correction — ${correction.label}: ${formatPeso(correction.amount)}`);
      }
      await Share.share({
        title: 'BoardPoint tenant bill',
        message: [
          `BoardPoint statement — ${view.tenantName}`,
          `${view.propertyName} · ${view.roomLabel}`,
          formatPeriodLabel(view.periodStart, view.periodEnd),
          '',
          ...lines,
          '',
          `TOTAL DUE: ${formatPeso(view.totalDue)}`,
          `Due date: ${formatDisplayDate(view.dueDate)}`,
          `Payments applied: ${formatPeso(view.paymentsApplied)}`,
          `Remaining balance: ${formatPeso(view.remaining)}`,
          '',
          view.status === 'draft'
            ? 'Status: estimated (not finalized yet)'
            : 'Status: finalized',
        ].join('\n'),
      });
    } catch (error) {
      Alert.alert('Could not share', toErrorMessage(error));
    }
  };

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

  if (!view) {
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
                <Text style={styles.brandTitle}>Tenant Bill</Text>
                <Text style={styles.brandSubtitle}>ITEMISED STATEMENT</Text>
              </View>
            </View>
            <Text style={exp.missing}>This bill no longer exists.</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const finalized = view.status === 'finalized';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

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
              <Text style={styles.brandTitle}>Tenant Bill</Text>
              <Text style={styles.brandSubtitle}>ITEMISED STATEMENT</Text>
            </View>
          </View>

          {/* Head */}
          <View style={form.sectionCard}>
            <View style={exp.detailHeadTop}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={exp.detailTitle} numberOfLines={1}>
                  {view.tenantName}
                </Text>
                <Text style={exp.detailSub}>
                  {view.propertyName} · {view.roomLabel}
                </Text>
                <Text style={exp.detailSub}>
                  {formatPeriodLabel(view.periodStart, view.periodEnd)}
                </Text>
              </View>
              <View
                style={[
                  exp.statusPill,
                  finalized ? exp.pillFinalized : exp.pillDraft,
                ]}
              >
                <Text
                  style={[
                    exp.statusPillText,
                    finalized ? exp.pillFinalizedText : exp.pillDraftText,
                  ]}
                >
                  {finalized ? 'Finalized' : 'Estimated'}
                </Text>
              </View>
            </View>

            {finalized ? (
              <View style={exp.lockedBanner}>
                <Text style={exp.lockedBannerText}>
                  Finalized — these amounts are locked. Any change is recorded below as a
                  visible correction with your reason.
                </Text>
              </View>
            ) : (
              <View style={exp.estimateBanner}>
                <Text style={exp.estimateBannerText}>
                  Estimated draft — nothing is billed to the tenant yet. Finalize posts each
                  line as a rent bill; discard removes the draft.
                </Text>
              </View>
            )}
          </View>

          {/* Itemised charges */}
          <View style={form.sectionCard}>
            <Text style={form.sectionTitle}>Charges</Text>

            {view.lines.map((line) => (
              <View key={line.id} style={exp.lineRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={exp.lineLabel}>{line.label}</Text>
                  {line.kind !== 'rent' && line.expenseId ? (
                    <Text style={exp.lineNote}>Shared expense allocation</Text>
                  ) : null}
                </View>
                <Text style={exp.lineAmount}>{formatPeso(line.amount)}</Text>
              </View>
            ))}

            {view.previousBalance > 0 ? (
              <View style={exp.lineRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={exp.lineLabel}>Previous unpaid balance</Text>
                  <Text style={exp.lineNote}>Carried into this statement</Text>
                </View>
                <Text style={exp.lineAmount}>{formatPeso(view.previousBalance)}</Text>
              </View>
            ) : null}

            {view.correctionsTotal !== 0 ? (
              <View style={exp.lineRow}>
                <Text style={exp.lineLabel}>Corrections</Text>
                <Text
                  style={[
                    exp.lineAmount,
                    view.correctionsTotal < 0 && exp.lineAmountCredit,
                  ]}
                >
                  {formatPeso(view.correctionsTotal)}
                </Text>
              </View>
            ) : null}

            <View style={exp.totalRow}>
              <Text style={exp.totalRowLabel}>TOTAL DUE</Text>
              <Text style={exp.totalRowValue}>{formatPeso(view.totalDue)}</Text>
            </View>

            <View style={exp.metaRow}>
              <Text style={exp.metaLabel}>Due date</Text>
              <Text style={exp.metaValue}>{formatDisplayDate(view.dueDate)}</Text>
            </View>
            <View style={exp.metaRow}>
              <Text style={exp.metaLabel}>Payments or credits</Text>
              <Text
                style={[exp.metaValue, view.paymentsApplied > 0 && exp.metaValueGood]}
              >
                {formatPeso(view.paymentsApplied)}
              </Text>
            </View>
            <View style={exp.metaRow}>
              <Text style={exp.metaLabel}>Remaining balance</Text>
              <Text
                style={[
                  exp.metaValue,
                  view.remaining > 0 ? exp.metaValueAlert : exp.metaValueGood,
                ]}
              >
                {view.remaining > 0 ? formatPeso(view.remaining) : 'Settled'}
              </Text>
            </View>
          </View>

          {/* Corrections (finalized only) */}
          {finalized ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Corrections</Text>
              <Text style={form.sectionHint}>
                Adjust a finalized bill without rewriting history. Positive amounts charge
                more; minus amounts credit the tenant.
              </Text>

              {view.corrections.map((correction) => (
                <View key={correction.id} style={exp.correctionCard}>
                  <View style={exp.correctionTop}>
                    <Text style={exp.correctionLabel} numberOfLines={1}>
                      {correction.label}
                    </Text>
                    <Text
                      style={[
                        exp.correctionAmount,
                        correction.amount < 0 && exp.correctionAmountCredit,
                      ]}
                    >
                      {formatPeso(correction.amount)}
                    </Text>
                  </View>
                  <Text style={exp.correctionReason}>{correction.reason}</Text>
                  <Text style={exp.correctionAt}>{formatRelativeTime(correction.at)}</Text>
                </View>
              ))}

              <View style={[form.formGroup, { marginTop: 14 }]}>
                <Text style={form.fieldLabel}>Label</Text>
                <View style={form.field}>
                  <TextInput
                    style={form.input}
                    value={corrLabel}
                    onChangeText={setCorrLabel}
                    placeholder="e.g. Damaged light fixture"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    accessibilityLabel="Correction label"
                  />
                </View>
              </View>
              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Amount (use − to credit)</Text>
                <View style={form.field}>
                  <Text style={exp.pesoPrefix}>₱</Text>
                  <TextInput
                    style={form.input}
                    value={corrAmount}
                    onChangeText={setCorrAmount}
                    keyboardType="numbers-and-punctuation"
                    placeholder="0.00"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    accessibilityLabel="Correction amount"
                  />
                </View>
              </View>
              <View style={form.formGroup}>
                <Text style={form.fieldLabel}>Reason</Text>
                <View style={[form.field, form.fieldMultiline]}>
                  <TextInput
                    style={[form.input, form.inputMultiline]}
                    value={corrReason}
                    onChangeText={setCorrReason}
                    placeholder="Why is this bill being adjusted?"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    multiline
                    accessibilityLabel="Correction reason"
                  />
                </View>
              </View>

              <FieldError error={corrError} />

              <View style={{ marginTop: 12 }}>
                <Pressable
                  onPress={handleCorrection}
                  disabled={busy}
                  style={({ pressed }) => [
                    form.primaryButton,
                    pressed && form.primaryButtonPressed,
                    busy && form.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                  ) : (
                    <>
                      <Ionicons name="construct-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                      <Text style={form.primaryButtonText}>Add correction</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Actions */}
          <View style={exp.actionStack}>
            {finalized ? null : (
              <Pressable
                onPress={confirmFinalize}
                disabled={busy}
                style={({ pressed }) => [
                  form.primaryButton,
                  pressed && form.primaryButtonPressed,
                  busy && form.primaryButtonDisabled,
                ]}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                    <Text style={form.primaryButtonText}>Finalize statement</Text>
                  </>
                )}
              </Pressable>
            )}

            <Pressable
              onPress={() => void shareStatement()}
              style={({ pressed }) => [
                form.secondaryButton,
                pressed && form.secondaryButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={form.secondaryButtonText}>
                Share {finalized ? 'finalized' : 'estimated'} bill
              </Text>
            </Pressable>

            {finalized ? null : (
              <Pressable
                onPress={confirmDiscard}
                disabled={busy}
                style={({ pressed }) => [
                  exp.dangerAction,
                  pressed && form.dangerButtonPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={exp.dangerActionText}>Discard draft</Text>
              </Pressable>
            )}
          </View>

          <Text style={exp.disclaimer}>
            {finalized
              ? 'Finalized statements never change silently — every adjustment shows up as a dated correction with your reason.'
              : 'Drafts are estimates based on current rents and expense splits. Nothing is billed until you finalize.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
