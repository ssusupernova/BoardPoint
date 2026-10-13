import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { landlordStatement } from '@/routes';
import {
  currentMonthPeriod,
  expensePeriods,
  formatPeriodLabel,
  generateStatements,
  toStatementViews,
  useLandlordData,
  useLandlordDataReady,
  type StatementView,
} from '@/services/landlordData';
import { useAuthSession } from '@/services/auth';
import { formatPeso } from '@/utils/currency';
import { parseISODate, formatDisplayDate, toISODate } from '@/utils/date';
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
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { expenseStyles as exp } from '../../styles/landlord/expenses.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

function StatementPill({ status }: { status: StatementView['status'] }) {
  const finalized = status === 'finalized';
  return (
    <View style={[exp.statusPill, finalized ? exp.pillFinalized : exp.pillDraft]}>
      <Text style={[exp.statusPillText, finalized ? exp.pillFinalizedText : exp.pillDraftText]}>
        {finalized ? 'Finalized' : 'Estimated'}
      </Text>
    </View>
  );
}

export default function BillingStatementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const presetPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const [propertyId, setPropertyId] = useState(presetPropertyId ?? 'all');
  const [periodKey, setPeriodKey] = useState<string | null>(null);
  const [startEdit, setStartEdit] = useState<string | null>(null);
  const [endEdit, setEndEdit] = useState<string | null>(null);
  const [dueStr, setDueStr] = useState(() =>
    toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const scope = propertyId === 'all' ? null : propertyId;

  const periods = useMemo(() => {
    const list = expensePeriods(data, scope);
    const current = currentMonthPeriod();
    const key = `${current.start}::${current.end}`;
    if (!list.some((item) => `${item.start}::${item.end}` === key)) {
      list.unshift({
        start: current.start,
        end: current.end,
        label: formatPeriodLabel(current.start, current.end),
      });
    }
    return list;
  }, [data, scope]);

  const activePeriod = useMemo(() => {
    const match = periods.find((item) => `${item.start}::${item.end}` === periodKey);
    if (match) return match;
    const current = currentMonthPeriod();
    return (
      periods[0] ?? {
        start: current.start,
        end: current.end,
        label: formatPeriodLabel(current.start, current.end),
      }
    );
  }, [periods, periodKey]);

  /* Generator fields follow the picked period until the landlord edits them. */
  const startStr = startEdit ?? activePeriod.start;
  const endStr = endEdit ?? activePeriod.end;

  const choosePeriod = (key: string): void => {
    setPeriodKey(key);
    setStartEdit(null);
    setEndEdit(null);
    setFormError(null);
  };

  const views = useMemo(
    () =>
      toStatementViews(data, {
        propertyId: scope,
        periodStart: activePeriod.start,
        periodEnd: activePeriod.end,
      }),
    [data, scope, activePeriod]
  );
  const drafts = views.filter((item) => item.status === 'draft');
  const finalized = views.filter((item) => item.status === 'finalized');

  const handleGenerate = (): void => {
    setFormError(null);
    const start = parseISODate(startStr);
    const end = parseISODate(endStr);
    if (!start) return setFormError('Enter a valid period start (YYYY-MM-DD).');
    if (!end) return setFormError('Enter a valid period end (YYYY-MM-DD).');
    if (start.getTime() > end.getTime()) {
      return setFormError('The period start cannot be after the end.');
    }
    if (!parseISODate(dueStr)) return setFormError('Enter a valid due date (YYYY-MM-DD).');
    if (!scope) return setFormError('Choose a property to generate bills for.');

    Alert.alert(
      'Generate draft bills?',
      `${formatPeriodLabel(startStr, endStr)}\nDue: ${formatDisplayDate(dueStr)}\n\nDrafts are estimates — nothing is billed to tenants until you finalize each statement.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate drafts',
          onPress: () => {
            void (async () => {
              setSending(true);
              setFormError(null);
              try {
                const count = await generateStatements({
                  propertyId: scope,
                  periodStart: startStr,
                  periodEnd: endStr,
                  dueDate: dueStr,
                  landlordId,
                });
                if (count === 0) {
                  Alert.alert(
                    'Nothing to generate',
                    'Every eligible tenant already has a bill for this period.'
                  );
                } else {
                  Alert.alert(
                    'Draft bills generated',
                    `${count} ${count === 1 ? 'statement is' : 'statements are'} ready as estimates. Open each one to review, then finalize.`
                  );
                }
              } catch (error) {
                setFormError(toErrorMessage(error));
              } finally {
                setSending(false);
              }
            })();
          },
        },
      ]
    );
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

  const renderStatement = (item: StatementView) => (
    <Pressable
      key={item.id}
      onPress={() => router.push(landlordStatement(item.id))}
      style={({ pressed }) => [exp.statementCard, pressed && exp.statementCardPressed]}
      accessibilityRole="button"
    >
      <View style={exp.statementTop}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={exp.statementName} numberOfLines={1}>
            {item.tenantName}
          </Text>
          <Text style={exp.statementMeta} numberOfLines={1}>
            {item.propertyName} · {item.roomLabel}
          </Text>
          <Text style={exp.statementPeriod}>
            {formatPeriodLabel(item.periodStart, item.periodEnd)}
          </Text>
        </View>
        <StatementPill status={item.status} />
      </View>

      <View style={exp.statementTotals}>
        <View style={exp.statementTotalCol}>
          <Text style={exp.statementTotalLabel}>TOTAL DUE</Text>
          <Text style={[exp.statementTotalValue, exp.statementTotalValueDue]}>
            {formatPeso(item.totalDue)}
          </Text>
        </View>
        <View style={exp.statementTotalCol}>
          <Text style={exp.statementTotalLabel}>PAYMENTS APPLIED</Text>
          <Text style={exp.statementTotalValue}>{formatPeso(item.paymentsApplied)}</Text>
        </View>
        <View style={exp.statementTotalCol}>
          <Text style={exp.statementTotalLabel}>REMAINING</Text>
          <Text style={exp.statementTotalValue}>{formatPeso(item.remaining)}</Text>
        </View>
      </View>
    </Pressable>
  );

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
              <Text style={styles.brandTitle}>Tenant Bills</Text>
              <Text style={styles.brandSubtitle}>GENERATE, REVIEW &amp; FINALIZE</Text>
            </View>
          </View>

          {/* Property filter */}
          <Text style={exp.selectorLabel}>PROPERTY</Text>
          <View style={exp.chipsRow}>
            <FilterChip label="All" active={propertyId === 'all'} onPress={() => setPropertyId('all')} />
            {data.properties.map((property) => (
              <FilterChip
                key={property.id}
                label={property.name}
                active={propertyId === property.id}
                onPress={() => setPropertyId(property.id)}
              />
            ))}
          </View>

          {/* Period filter */}
          <Text style={exp.selectorLabel}>BILLING PERIOD</Text>
          <View style={exp.chipsRow}>
            {periods.map((period) => {
              const key = `${period.start}::${period.end}`;
              return (
                <FilterChip
                  key={key}
                  label={period.label}
                  active={activePeriod.start === period.start && activePeriod.end === period.end}
                  onPress={() => choosePeriod(key)}
                />
              );
            })}
          </View>

          {/* Generate card */}
          <View style={exp.genCard}>
            <Text style={exp.genTitle}>Generate tenant bills</Text>
            <Text style={exp.genHint}>
              Creates itemised draft statements — rent, shared utilities, and carried balances
              — for every eligible tenant. Drafts stay estimates until you finalize them.
            </Text>

            <View style={exp.genFields}>
              <View style={exp.dateRow}>
                <View style={exp.dateCol}>
                  <Text style={form.fieldLabel}>Period start</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={startStr}
                      onChangeText={setStartEdit}
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
                  <Text style={form.fieldLabel}>Period end</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={endStr}
                      onChangeText={setEndEdit}
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

              <View>
                <Text style={form.fieldLabel}>Due date</Text>
                <View style={form.field}>
                  <TextInput
                    style={form.input}
                    value={dueStr}
                    onChangeText={setDueStr}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    maxLength={10}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Due date"
                  />
                </View>
              </View>

              {formError ? (
                <Text style={[form.sectionHint, { color: LANDLORD_THEME.badgeUrgentText }]}>
                  {formError}
                </Text>
              ) : null}

              <Pressable
                onPress={handleGenerate}
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
                    <Ionicons name="documents-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                    <Text style={form.primaryButtonText}>Generate drafts</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Estimated drafts */}
          <View style={exp.sectionHead}>
            <Text style={exp.sectionTitle}>Estimated</Text>
            <Text style={exp.sectionCount}>{drafts.length}</Text>
          </View>
          {drafts.length === 0 ? (
            <Text style={exp.emptyBody}>No draft bills for this period yet.</Text>
          ) : (
            drafts.map(renderStatement)
          )}

          {/* Finalized */}
          <View style={exp.sectionHead}>
            <Text style={exp.sectionTitle}>Finalized</Text>
            <Text style={exp.sectionCount}>{finalized.length}</Text>
          </View>
          {finalized.length === 0 ? (
            <Text style={exp.emptyBody}>No finalized bills for this period yet.</Text>
          ) : (
            finalized.map(renderStatement)
          )}

          {views.length === 0 ? (
            <View style={exp.emptyCard}>
              <Ionicons name="document-text-outline" size={26} color={LANDLORD_THEME.primary} />
              <Text style={exp.emptyTitle}>No statements yet</Text>
              <Text style={exp.emptyBody}>
                Pick a property and period above, then generate drafts. You will review each
                itemised bill before anything is finalized.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
