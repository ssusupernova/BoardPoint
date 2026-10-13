import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { useAuthSession } from '@/services/auth';
import {
  type ExpenseCategory,
  type PaymentStatusFilter,
  EXPENSE_CATEGORIES,
  billingPeriods,
  formatPeriodLabel,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import {
  type ReportFilters,
  describeReportFilters,
  reportExpensesByCategory,
  reportOccupancy,
  reportOutstanding,
  reportPaymentsReceived,
  reportProperties,
  reportStatements,
  reportTenantHistory,
  reportTenantOptions,
} from '@/services/landlordReports';
import { formatPeso } from '@/utils/currency';
import { MONTH_ABBRS, formatDisplayDate, parseISODate, toISODate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reportStyles as rep } from '../../styles/landlord/reports.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

const STATUS_OPTIONS: PaymentStatusFilter[] = ['All', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue'];

type RangeKey = 'all' | 'month' | 'lastMonth' | 'd90';

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'month', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'd90', label: 'Last 90 days' },
];

function rangeDates(key: RangeKey): { start: string; end: string } | null {
  const now = new Date();
  if (key === 'month') {
    return {
      start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (key === 'lastMonth') {
    return {
      start: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  if (key === 'd90') {
    const start = new Date(now);
    start.setDate(start.getDate() - 90);
    return { start: toISODate(start), end: toISODate(now) };
  }
  return null;
}

function rangeLabel(key: RangeKey): string {
  const dates = rangeDates(key);
  if (!dates) return 'All time';
  const from = parseISODate(dates.start);
  const to = parseISODate(dates.end);
  if (!from || !to) return 'All time';
  if (key === 'month') return `Month of ${MONTH_ABBRS[from.getMonth()]} ${from.getFullYear()}`;
  if (key === 'lastMonth') return `${MONTH_ABBRS[from.getMonth()]} ${from.getFullYear()}`;
  return `${formatDisplayDate(dates.start)} – ${formatDisplayDate(dates.end)}`;
}

function pillTone(status: string): [object, object] {
  if (status === 'Paid' || status === 'finalized') return [rep.pillPaid, rep.pillPaidText];
  if (status === 'Overdue') return [rep.pillUrgent, rep.pillUrgentText];
  if (status === 'Partially Paid' || status === 'draft') return [rep.pillPending, rep.pillPendingText];
  return [rep.pillNeutral, rep.pillNeutralText];
}

function StatusPill({ label, status }: { label: string; status: string }) {
  const [pill, text] = pillTone(status);
  return (
    <View style={[rep.pill, pill]}>
      <Text style={text}>{label}</Text>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: 'primary' | 'urgent' | 'blue';
}) {
  return (
    <View style={rep.summaryCard}>
      <Text style={rep.summaryLabel}>{label}</Text>
      <Text
        style={[
          rep.summaryValue,
          tone === 'primary' && rep.summaryValuePrimary,
          tone === 'urgent' && rep.summaryValueUrgent,
          tone === 'blue' && rep.summaryValueBlue,
        ]}
      >
        {value}
      </Text>
      <Text style={rep.summaryCaption}>{caption}</Text>
    </View>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <View style={rep.empty}>
      <Text style={rep.emptyTitle}>{title}</Text>
      <Text style={rep.emptyBody}>{body}</Text>
    </View>
  );
}

function BarRow({
  label,
  valueText,
  share,
  primary,
  caption,
}: {
  label: string;
  valueText: string;
  share: number;
  primary?: boolean;
  caption?: string;
}) {
  const width = `${Math.min(100, Math.max(share > 0 ? 2 : 0, share * 100))}%` as const;
  return (
    <View style={rep.barRow}>
      <View style={rep.barHeader}>
        <Text style={rep.barLabel}>{label}</Text>
        <Text style={rep.barValue}>{valueText}</Text>
      </View>
      <View style={rep.barTrack}>
        <View style={[rep.barFill, primary && rep.barFillPrimary, { width }]} />
      </View>
      {caption ? <Text style={rep.barCaption}>{caption}</Text> : null}
    </View>
  );
}

/**
 * Landlord financial & occupancy reports. Every figure stays in its own
 * financial category — recorded payments, billed amounts, shared expenses,
 * and outstanding balances are shown separately and never combined into one
 * total. All figures come from the landlord's own authorized records.
 */
export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ready = useLandlordDataReady();
  const data = useLandlordData();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;

  const [propertyKey, setPropertyKey] = useState<string>('all');
  const [rangeKey, setRangeKey] = useState<RangeKey>('all');
  const [cycle, setCycle] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatusFilter>('All');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | 'All'>('All');
  const [historyTenantId, setHistoryTenantId] = useState<string | null>(null);

  const properties = useMemo(
    () => reportProperties(data, landlordId),
    [data, landlordId]
  );
  const propertyIds = useMemo(
    () => new Set(properties.map((property) => property.id)),
    [properties]
  );
  const cycles = useMemo(() => billingPeriods(data), [data]);

  const filters: ReportFilters = useMemo(() => {
    const dates = rangeDates(rangeKey);
    return {
      propertyId: propertyKey === 'all' ? null : propertyKey,
      rangeStart: dates?.start ?? null,
      rangeEnd: dates?.end ?? null,
      billingCycle: cycle,
      status,
      expenseCategory,
    };
  }, [propertyKey, rangeKey, cycle, status, expenseCategory]);

  const payments = useMemo(
    () => reportPaymentsReceived(data, filters, propertyIds),
    [data, filters, propertyIds]
  );
  const outstanding = useMemo(
    () => reportOutstanding(data, filters, propertyIds),
    [data, filters, propertyIds]
  );
  const expenses = useMemo(
    () => reportExpensesByCategory(data, filters, propertyIds),
    [data, filters, propertyIds]
  );
  const statements = useMemo(
    () => reportStatements(data, filters, propertyIds),
    [data, filters, propertyIds]
  );
  const occupancy = useMemo(
    () => reportOccupancy(data, propertyIds),
    [data, propertyIds]
  );
  const tenantOptions = useMemo(
    () => reportTenantOptions(data, propertyIds),
    [data, propertyIds]
  );
  const selectedTenant =
    tenantOptions.find((tenant) => tenant.id === historyTenantId) ?? tenantOptions[0] ?? null;
  const history = useMemo(
    () =>
      selectedTenant
        ? reportTenantHistory(data, filters, propertyIds, selectedTenant.id)
        : null,
    [data, filters, propertyIds, selectedTenant]
  );

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={rep.loadingBox}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={rep.loadingText}>Preparing reports…</Text>
        </View>
      </View>
    );
  }

  const selectedProperty =
    properties.find((property) => property.id === propertyKey) ?? null;
  const filterSummary = describeReportFilters(
    filters,
    selectedProperty?.name ?? null,
    rangeLabel(rangeKey),
    cycle
  );

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
          <View style={rep.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                rep.headerBackBtn,
                pressed && rep.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={rep.headerTextCol}>
              <Text style={styles.brandTitle}>Reports</Text>
              <Text style={styles.brandSubtitle}>FINANCIAL & OCCUPANCY SUMMARY</Text>
            </View>
          </View>

          {properties.length === 0 ? (
            <EmptyBlock
              title="No properties to report on"
              body="You don’t have any authorized properties yet. Add a property to start tracking payments and occupancy."
            />
          ) : (
            <>
              {/* Filters */}
              <View style={rep.filtersCard}>
                <Text style={[rep.selectorLabel, rep.selectorLabelFirst]}>PROPERTY</Text>
                <View style={rep.chipsRow}>
                  <FilterChip
                    label="All"
                    active={propertyKey === 'all'}
                    onPress={() => setPropertyKey('all')}
                  />
                  {properties.map((property) => (
                    <FilterChip
                      key={property.id}
                      label={property.name}
                      active={propertyKey === property.id}
                      onPress={() => setPropertyKey(property.id)}
                    />
                  ))}
                </View>

                <Text style={rep.selectorLabel}>DATE RANGE</Text>
                <View style={rep.chipsRow}>
                  {RANGE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.key}
                      label={option.label}
                      active={rangeKey === option.key}
                      onPress={() => setRangeKey(option.key)}
                    />
                  ))}
                </View>

                <Text style={rep.selectorLabel}>BILLING CYCLE (RENT BILLS)</Text>
                <View style={rep.chipsRow}>
                  <FilterChip
                    label="All"
                    active={cycle === null}
                    onPress={() => setCycle(null)}
                  />
                  {cycles.map((label) => (
                    <FilterChip
                      key={label}
                      label={label}
                      active={cycle === label}
                      onPress={() => setCycle(label)}
                    />
                  ))}
                </View>

                <Text style={rep.selectorLabel}>PAYMENT STATUS</Text>
                <View style={rep.chipsRow}>
                  {STATUS_OPTIONS.map((option) => (
                    <FilterChip
                      key={option}
                      label={option}
                      active={status === option}
                      onPress={() => setStatus(option)}
                    />
                  ))}
                </View>

                <Text style={rep.selectorLabel}>EXPENSE CATEGORY</Text>
                <View style={rep.chipsRow}>
                  <FilterChip
                    label="All"
                    active={expenseCategory === 'All'}
                    onPress={() => setExpenseCategory('All')}
                  />
                  {EXPENSE_CATEGORIES.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      active={expenseCategory === category}
                      onPress={() => setExpenseCategory(category)}
                    />
                  ))}
                </View>

                <Text style={rep.activeFilters}>Showing: {filterSummary}</Text>
                <Text style={rep.categoriesNote}>
                  Figures below are kept separate on purpose: recorded payments are
                  money received, billed amounts are charges raised, expenses are
                  your costs, and outstanding balances are what tenants still owe.
                </Text>
              </View>

              {/* 1. Rent payments received */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="cash-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Rent payments received</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Recorded payments against rent bills in this selection — money
                  actually received, not billed amounts.
                </Text>

                {payments.count === 0 ? (
                  <EmptyBlock
                    title="No payments recorded"
                    body="No rent payments were recorded for this selection. Try a different period or clear the status filter."
                  />
                ) : (
                  <>
                    <View style={rep.summaryGrid}>
                      <SummaryCard
                        label="TOTAL RECEIVED"
                        value={formatPeso(payments.total)}
                        caption={`${payments.count} recorded ${payments.count === 1 ? 'payment' : 'payments'}`}
                        tone="blue"
                      />
                      {payments.methodTotals.slice(0, 3).map((method) => (
                        <SummaryCard
                          key={method.method}
                          label={method.method.toUpperCase()}
                          value={formatPeso(method.total)}
                          caption={`${method.count} ${method.count === 1 ? 'payment' : 'payments'}`}
                        />
                      ))}
                    </View>

                    <View style={rep.list}>
                      {payments.rows.slice(0, 12).map((row) => (
                        <View key={row.paymentId} style={rep.row}>
                          <View style={rep.rowLeft}>
                            <Text style={rep.rowTitle}>{row.tenantName}</Text>
                            <Text style={rep.rowSub}>
                              {[row.roomLabel, row.propertyName].filter(Boolean).join(' · ')}
                            </Text>
                            <Text style={rep.rowSub}>
                              {formatDisplayDate(row.paidAt)} · {row.method}
                              {row.reference ? ` · ${row.reference}` : ''}
                            </Text>
                          </View>
                          <View style={rep.rowRight}>
                            <Text style={[rep.rowAmount, rep.rowAmountBlue]}>
                              {formatPeso(row.amount)}
                            </Text>
                            <Text style={rep.rowSub}>{row.billingCycle}</Text>
                          </View>
                        </View>
                      ))}
                      {payments.rows.length > 12 ? (
                        <Text style={rep.rowSub}>
                          Showing the 12 most recent of {payments.rows.length} payments.
                        </Text>
                      ) : null}
                    </View>
                  </>
                )}
              </View>

              {/* 2. Outstanding & overdue */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="alert-circle-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Outstanding & overdue balances</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Billed amounts that are not yet fully paid. Overdue is the
                  portion already past its due date.
                </Text>

                {outstanding.openCount === 0 ? (
                  <EmptyBlock
                    title="Nothing outstanding"
                    body="Every bill in this selection is settled, or no bills match the current filters."
                  />
                ) : (
                  <>
                    <View style={rep.summaryGrid}>
                      <SummaryCard
                        label="OUTSTANDING"
                        value={formatPeso(outstanding.outstandingTotal)}
                        caption={`${outstanding.openCount} open ${outstanding.openCount === 1 ? 'bill' : 'bills'}`}
                        tone="primary"
                      />
                      <SummaryCard
                        label="OVERDUE"
                        value={formatPeso(outstanding.overdueTotal)}
                        caption={`${outstanding.overdueCount} past due`}
                        tone="urgent"
                      />
                    </View>

                    <View style={rep.list}>
                      {outstanding.rows.slice(0, 12).map((row) => (
                        <View key={row.billId} style={rep.row}>
                          <View style={rep.rowLeft}>
                            <Text style={rep.rowTitle}>{row.tenantName}</Text>
                            <Text style={rep.rowSub}>
                              {[row.roomLabel, row.propertyName].filter(Boolean).join(' · ')}
                            </Text>
                            <Text style={rep.rowSub}>
                              Due {formatDisplayDate(row.dueDate)} · {row.billingCycle}
                              {row.kind === 'expense' && row.note ? ` · ${row.note}` : ''}
                            </Text>
                          </View>
                          <View style={rep.rowRight}>
                            <Text
                              style={[
                                rep.rowAmount,
                                row.status === 'Overdue' ? rep.rowAmountUrgent : undefined,
                              ]}
                            >
                              {formatPeso(row.remaining)}
                            </Text>
                            <StatusPill label={row.status} status={row.status} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>

              {/* 3. Shared expenses by category */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="receipt-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Shared expenses by category</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Utility and upkeep costs you recorded, grouped by category.
                  These are landlord costs — not tenant payments.
                </Text>

                {expenses.count === 0 ? (
                  <EmptyBlock
                    title="No expenses recorded"
                    body="No shared expenses match this selection. Add one from the Expenses screen, or widen the date range."
                  />
                ) : (
                  <>
                    <View style={rep.summaryGrid}>
                      <SummaryCard
                        label="TOTAL EXPENSES"
                        value={formatPeso(expenses.total)}
                        caption={`${expenses.count} recorded ${expenses.count === 1 ? 'expense' : 'expenses'}`}
                        tone="primary"
                      />
                    </View>

                    {expenses.rows.map((row) => (
                      <BarRow
                        key={row.category}
                        label={row.category}
                        valueText={formatPeso(row.total)}
                        share={row.share}
                        primary={row.category === expenseCategory}
                        caption={`${Math.round(row.share * 100)}% of expenses · ${row.count} ${row.count === 1 ? 'record' : 'records'}`}
                      />
                    ))}
                  </>
                )}
              </View>

              {/* 4. Tenant billing summaries */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="documents-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Tenant billing summaries</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Itemized statements per tenant: billed charges, payments applied,
                  and the remaining balance. Draft statements are estimates until finalized.
                </Text>

                {statements.length === 0 ? (
                  <EmptyBlock
                    title="No statements for this selection"
                    body="Billing statements appear here once they’re generated from the Billing screen."
                  />
                ) : (
                  <View style={rep.list}>
                    {statements.slice(0, 10).map((statement) => (
                      <View key={statement.id} style={rep.row}>
                        <View style={rep.rowLeft}>
                          <Text style={rep.rowTitle}>{statement.tenantName}</Text>
                          <Text style={rep.rowSub}>
                            {[statement.roomLabel, statement.propertyName].filter(Boolean).join(' · ')}
                          </Text>
                          <Text style={rep.rowSub}>
                            {formatPeriodLabel(statement.periodStart, statement.periodEnd)} · due{' '}
                            {formatDisplayDate(statement.dueDate)}
                          </Text>
                          <Text style={rep.rowSub}>
                            Billed {formatPeso(statement.totalDue)} · paid{' '}
                            {formatPeso(statement.paymentsApplied)} · remaining{' '}
                            {formatPeso(statement.remaining)}
                          </Text>
                        </View>
                        <View style={rep.rowRight}>
                          <StatusPill
                            label={statement.status === 'draft' ? 'Estimated' : 'Finalized'}
                            status={statement.status}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 5. Room occupancy */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="bed-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Room occupancy & availability</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Current room status for the properties in scope — live as of
                  today, independent of the date filters.
                </Text>

                {occupancy.totalRooms === 0 ? (
                  <EmptyBlock
                    title="No rooms yet"
                    body="Add rooms to a property to see occupancy here."
                  />
                ) : (
                  <>
                    <View style={rep.summaryGrid}>
                      <SummaryCard
                        label="OCCUPIED"
                        value={`${occupancy.occupied}`}
                        caption={`${Math.round(occupancy.occupancyRate * 100)}% of ${occupancy.totalRooms} rooms`}
                        tone="blue"
                      />
                      <SummaryCard
                        label="AVAILABLE"
                        value={`${occupancy.available}`}
                        caption="ready to rent"
                      />
                      <SummaryCard
                        label="RESERVED"
                        value={`${occupancy.reserved}`}
                        caption="held, not moved in"
                      />
                      <SummaryCard
                        label="MAINTENANCE"
                        value={`${occupancy.maintenance}`}
                        caption="unavailable"
                      />
                    </View>

                    {occupancy.rows.map((row) => (
                      <BarRow
                        key={row.propertyId}
                        label={row.propertyName}
                        valueText={`${row.occupied}/${row.totalRooms} occupied`}
                        share={row.occupancyRate}
                        caption={`${row.available} available · ${row.reserved} reserved · ${row.maintenance} maintenance`}
                      />
                    ))}
                  </>
                )}
              </View>

              {/* 6. Tenant payment history */}
              <View style={rep.section}>
                <View style={rep.sectionTitleRow}>
                  <Ionicons name="person-outline" size={17} color={LANDLORD_THEME.primary} />
                  <Text style={rep.sectionTitle}>Tenant payment history</Text>
                </View>
                <Text style={rep.sectionCaption}>
                  Every payment recorded for one tenant in this selection — rent
                  and expense shares, with method and reference.
                </Text>

                {tenantOptions.length === 0 ? (
                  <EmptyBlock
                    title="No tenants with billing records"
                    body="Tenants appear here once they have bills or recorded payments in your properties."
                  />
                ) : (
                  <>
                    <View style={rep.chipsRow}>
                      {tenantOptions.slice(0, 8).map((tenant) => (
                        <FilterChip
                          key={tenant.id}
                          label={tenant.fullName}
                          active={selectedTenant?.id === tenant.id}
                          onPress={() => setHistoryTenantId(tenant.id)}
                        />
                      ))}
                    </View>

                    {history && history.count > 0 ? (
                      <>
                        <View style={rep.summaryGrid}>
                          <SummaryCard
                            label="RECEIVED FROM TENANT"
                            value={formatPeso(history.total)}
                            caption={`${history.count} recorded ${history.count === 1 ? 'payment' : 'payments'}`}
                            tone="blue"
                          />
                        </View>
                        <View style={rep.list}>
                          {history.rows.slice(0, 10).map((row) => (
                            <View key={row.paymentId} style={rep.row}>
                              <View style={rep.rowLeft}>
                                <Text style={rep.rowTitle}>
                                  {row.kind === 'expense' ? row.note || 'Expense share' : 'Rent payment'}
                                </Text>
                                <Text style={rep.rowSub}>
                                  {formatDisplayDate(row.paidAt)} · {row.method}
                                  {row.reference ? ` · ${row.reference}` : ''}
                                </Text>
                                <Text style={rep.rowSub}>{row.billingCycle}</Text>
                              </View>
                              <View style={rep.rowRight}>
                                <Text style={[rep.rowAmount, rep.rowAmountBlue]}>
                                  {formatPeso(row.amount)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </>
                    ) : (
                      <EmptyBlock
                        title="No payments for this tenant"
                        body="No payments were recorded for this tenant under the current filters."
                      />
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
