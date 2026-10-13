import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import {
  landlordExpenseDetails,
  landlordExpenseForm,
  landlordStatementsFor,
} from '@/routes';
import {
  currentMonthPeriod,
  expensePeriods,
  formatPeriodLabel,
  summarizeExpenses,
  toExpenseViews,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { expenseStyles as exp } from '../../styles/landlord/expenses.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

type StatusTone = 'none' | 'draft' | 'finalized' | 'mixed';

const STATUS_STYLE: Record<StatusTone, object[]> = {
  none: [exp.statusNone],
  draft: [exp.statusDraft],
  finalized: [exp.statusFinalized],
  mixed: [exp.statusMixed],
};

const STATUS_TEXT: Record<StatusTone, object[]> = {
  none: [exp.statusNoneText],
  draft: [exp.statusDraftText],
  finalized: [exp.statusFinalizedText],
  mixed: [exp.statusMixedText],
};

export default function SharedExpensesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const presetPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;
  const data = useLandlordData();
  const ready = useLandlordDataReady();

  const [propertyId, setPropertyId] = useState<string>(presetPropertyId ?? 'all');
  const [periodKey, setPeriodKey] = useState<string | null>(null);

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

  const summary = useMemo(
    () =>
      summarizeExpenses(data, {
        propertyId: scope,
        periodStart: activePeriod.start,
        periodEnd: activePeriod.end,
      }),
    [data, scope, activePeriod]
  );

  const expenses = useMemo(
    () =>
      toExpenseViews(data, {
        propertyId: scope,
        periodStart: activePeriod.start,
        periodEnd: activePeriod.end,
      }),
    [data, scope, activePeriod]
  );

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
              <Text style={styles.brandTitle}>Shared Expenses</Text>
              <Text style={styles.brandSubtitle}>UTILITY COSTS & SPLITS</Text>
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
                  onPress={() => setPeriodKey(key)}
                />
              );
            })}
          </View>

          {/* Wide total card */}
          <View style={exp.totalCard}>
            <Text style={exp.totalCardLabel}>TOTAL THIS PERIOD</Text>
            <Text style={exp.totalCardValue}>{formatPeso(summary.total)}</Text>
            <Text style={exp.totalCardCaption}>
              {summary.expenseCount} {summary.expenseCount === 1 ? 'expense' : 'expenses'} ·{' '}
              {summary.tenantCount} {summary.tenantCount === 1 ? 'tenant' : 'tenants'} ·{' '}
              {summary.periodLabel}
            </Text>
          </View>

          {/* Category grid */}
          <View style={exp.summaryGrid}>
            <View style={exp.summaryCard}>
              <Text style={exp.summaryLabel}>ELECTRICITY</Text>
              <Text style={exp.summaryValue}>{formatPeso(summary.electricity)}</Text>
            </View>
            <View style={exp.summaryCard}>
              <Text style={exp.summaryLabel}>WATER</Text>
              <Text style={exp.summaryValue}>{formatPeso(summary.water)}</Text>
            </View>
            <View style={exp.summaryCard}>
              <Text style={exp.summaryLabel}>OTHER</Text>
              <Text style={exp.summaryValue}>{formatPeso(summary.other)}</Text>
            </View>
            <View style={exp.summaryCard}>
              <Text style={exp.summaryLabel}>TENANTS BILLED</Text>
              <Text style={exp.summaryValue}>{summary.tenantCount}</Text>
            </View>
          </View>

          {/* Billing status */}
          <View style={[exp.statusBanner, ...STATUS_STYLE[summary.statusTone]]}>
            <Text style={[exp.statusBannerText, ...STATUS_TEXT[summary.statusTone]]}>
              {summary.statusLabel}
            </Text>
          </View>

          {/* Actions */}
          <View style={exp.actionStack}>
            <Pressable
              onPress={() => router.push(landlordExpenseForm())}
              style={({ pressed }) => [
                form.primaryButton,
                pressed && form.primaryButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={18} color={LANDLORD_THEME.onPrimary} />
              <Text style={form.primaryButtonText}>Add shared expense</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push(landlordStatementsFor(propertyId === 'all' ? undefined : propertyId))
              }
              style={({ pressed }) => [
                form.secondaryButton,
                pressed && form.secondaryButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={form.secondaryButtonText}>Tenant bills</Text>
            </Pressable>
          </View>

          {/* Expense list */}
          <View style={exp.sectionHead}>
            <Text style={exp.sectionTitle}>Expenses</Text>
            <Text style={exp.sectionCount}>
              {expenses.length} {expenses.length === 1 ? 'record' : 'records'}
            </Text>
          </View>

          {expenses.length === 0 ? (
            <View style={exp.emptyCard}>
              <Ionicons name="receipt-outline" size={26} color={LANDLORD_THEME.primary} />
              <Text style={exp.emptyTitle}>No shared expenses here yet</Text>
              <Text style={exp.emptyBody}>
                Record water, electricity, internet, or repairs once — BoardPoint splits the
                cost across your tenants and turns it into itemised bills.
              </Text>
            </View>
          ) : (
            expenses.map((expense) => (
              <Pressable
                key={expense.id}
                onPress={() => router.push(landlordExpenseDetails(expense.id))}
                style={({ pressed }) => [exp.expenseCard, pressed && exp.expenseCardPressed]}
                accessibilityRole="button"
              >
                <View style={exp.expenseTop}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={exp.expenseTitle} numberOfLines={1}>
                      {expense.description || `${expense.category} bill`}
                    </Text>
                    <View style={exp.categoryPill}>
                      <Text style={exp.categoryPillText}>{expense.category}</Text>
                    </View>
                  </View>
                  <Text style={exp.expenseAmount}>{formatPeso(expense.amount)}</Text>
                </View>

                <Text style={exp.expenseMeta}>
                  {expense.propertyName} · {expense.periodLabel}
                  {'\n'}
                  Due {formatShortDate(expense.dueDate)} · {expense.tenantCount}{' '}
                  {expense.tenantCount === 1 ? 'tenant' : 'tenants'}
                </Text>

                <View style={exp.expenseFooter}>
                  <Text style={exp.expenseMethod}>Tap for the split breakdown</Text>
                  <Text style={exp.expenseLink}>Details</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
