/**
 * BoardPoint landlord report derivations.
 *
 * Pure selectors over the landlord database that back the Reports screen.
 * Every figure keeps its financial category — recorded payments, billed
 * amounts, expenses, and outstanding balances are never summed together.
 *
 * All queries are scoped to the properties the signed-in landlord is
 * authorized to view (`canViewProperty`), so a report can never surface
 * another landlord's records.
 */

import {
  type ExpenseCategory,
  type LandlordData,
  type LandlordProperty,
  type PaymentMethod,
  type PaymentStatus,
  type PaymentStatusFilter,
  type StatementView,
  EXPENSE_CATEGORIES,
  canViewProperty,
  paidAmountOfBill,
  paymentStatusOfBill,
  roomAvailability,
  toExpenseViews,
  toStatementViews,
} from '@/services/landlordData';

/* ------------------------------------------------------------------ filters */

export interface ReportFilters {
  /** Property id, or null for all authorized properties. */
  propertyId: string | null;
  /** Inclusive ISO date range bounds, or null for all time. */
  rangeStart: string | null;
  rangeEnd: string | null;
  /** Rent-bill cycle label (e.g. "15 Oct – 14 Nov"), or null for all. */
  billingCycle: string | null;
  status: PaymentStatusFilter;
  expenseCategory: ExpenseCategory | 'All';
}

/** Properties the signed-in landlord may include in reports. */
export function reportProperties(
  data: LandlordData,
  landlordId?: string
): LandlordProperty[] {
  return data.properties.filter((property) => canViewProperty(property, landlordId));
}

function inRange(iso: string, start: string | null, end: string | null): boolean {
  if (!start || !end) return true;
  return iso >= start && iso <= end;
}

function overlapsRange(
  periodStart: string,
  periodEnd: string,
  rangeStart: string | null,
  rangeEnd: string | null
): boolean {
  if (!rangeStart || !rangeEnd) return true;
  return periodStart <= rangeEnd && periodEnd >= rangeStart;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/* -------------------------------------------------------- 1. payments in */

export interface ReportPaymentRow {
  paymentId: string;
  billId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  roomLabel: string;
  amount: number;
  /** ISO date the payment was received. */
  paidAt: string;
  method: PaymentMethod;
  reference: string | null;
  billingCycle: string;
  kind: 'rent' | 'expense';
  /** Description on expense-share bills (e.g. "Electricity share"). */
  note?: string;
}

export interface MethodTotal {
  method: PaymentMethod;
  total: number;
  count: number;
}

export interface PaymentsReceivedReport {
  rows: ReportPaymentRow[];
  /** Sum of recorded payments in the selection. */
  total: number;
  count: number;
  methodTotals: MethodTotal[];
}

/**
 * Payments actually received (rent bills only) for the selection. Expense-share
 * bills are excluded here — they appear under the expenses section instead.
 */
export function reportPaymentsReceived(
  data: LandlordData,
  filters: ReportFilters,
  propertyIds: Set<string>
): PaymentsReceivedReport {
  const billById = new Map(data.bills.map((bill) => [bill.id, bill]));
  const tenantById = new Map(data.tenants.map((tenant) => [tenant.id, tenant]));
  const propertyById = new Map(data.properties.map((property) => [property.id, property]));

  const rows: ReportPaymentRow[] = [];
  for (const payment of data.payments) {
    if (!propertyIds.has(payment.propertyId)) continue;
    if (!inRange(payment.paidAt, filters.rangeStart, filters.rangeEnd)) continue;
    const bill = billById.get(payment.billId);
    if (!bill) continue;
    if ((bill.kind ?? 'rent') !== 'rent') continue;
    if (filters.billingCycle && bill.period !== filters.billingCycle) continue;
    if (filters.status !== 'All') {
      const status = paymentStatusOfBill(bill, paidAmountOfBill(data, bill.id));
      if (status !== filters.status) continue;
    }
    const property = propertyById.get(payment.propertyId);
    const room = property?.rooms.find((item) => item.id === payment.roomId);
    rows.push({
      paymentId: payment.id,
      billId: payment.billId,
      tenantId: payment.tenantId,
      tenantName: tenantById.get(payment.tenantId)?.fullName ?? 'Tenant',
      propertyName: property?.name ?? '',
      roomLabel: room?.label ?? '',
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method,
      reference: payment.reference ?? null,
      billingCycle: bill.period,
      kind: 'rent',
    });
  }
  rows.sort((a, b) => b.paidAt.localeCompare(a.paidAt) || a.tenantName.localeCompare(b.tenantName));

  const total = round2(rows.reduce((sum, row) => sum + row.amount, 0));
  const methodTotals: MethodTotal[] = [];
  for (const row of rows) {
    const entry = methodTotals.find((item) => item.method === row.method);
    if (entry) {
      entry.total = round2(entry.total + row.amount);
      entry.count += 1;
    } else {
      methodTotals.push({ method: row.method, total: row.amount, count: 1 });
    }
  }
  methodTotals.sort((a, b) => b.total - a.total);

  return { rows, total, count: rows.length, methodTotals };
}

/* --------------------------------------------------- 2. outstanding bills */

export interface ReportOpenBillRow {
  billId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  roomLabel: string;
  dueDate: string;
  billingCycle: string;
  kind: 'rent' | 'expense';
  note?: string;
  amountDue: number;
  amountPaid: number;
  /** Billed amount still unpaid. */
  remaining: number;
  status: PaymentStatus;
}

export interface OutstandingReport {
  rows: ReportOpenBillRow[];
  /** Sum of remaining billed amounts (not yet paid). */
  outstandingTotal: number;
  /** Portion of the outstanding total already past its due date. */
  overdueTotal: number;
  overdueCount: number;
  openCount: number;
}

/** Bills with a remaining balance, filtered by due date within the selection. */
export function reportOutstanding(
  data: LandlordData,
  filters: ReportFilters,
  propertyIds: Set<string>
): OutstandingReport {
  const tenantById = new Map(data.tenants.map((tenant) => [tenant.id, tenant]));
  const propertyById = new Map(data.properties.map((property) => [property.id, property]));

  const rows: ReportOpenBillRow[] = [];
  for (const bill of data.bills) {
    if (!propertyIds.has(bill.propertyId)) continue;
    if (!inRange(bill.dueDate, filters.rangeStart, filters.rangeEnd)) continue;
    if (filters.billingCycle && bill.period !== filters.billingCycle) continue;
    const amountPaid = paidAmountOfBill(data, bill.id);
    const remaining = Math.max(0, round2(bill.amount - amountPaid));
    if (remaining <= 0) continue;
    const status = paymentStatusOfBill(bill, amountPaid);
    if (filters.status !== 'All' && status !== filters.status) continue;
    const property = propertyById.get(bill.propertyId);
    const room = property?.rooms.find((item) => item.id === bill.roomId);
    rows.push({
      billId: bill.id,
      tenantId: bill.tenantId,
      tenantName: tenantById.get(bill.tenantId)?.fullName ?? 'Tenant',
      propertyName: property?.name ?? '',
      roomLabel: room?.label ?? '',
      dueDate: bill.dueDate,
      billingCycle: bill.period,
      kind: bill.kind ?? 'rent',
      note: bill.note,
      amountDue: bill.amount,
      amountPaid,
      remaining,
      status,
    });
  }
  rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.tenantName.localeCompare(b.tenantName));

  const outstandingTotal = round2(rows.reduce((sum, row) => sum + row.remaining, 0));
  const overdueRows = rows.filter((row) => row.status === 'Overdue');
  return {
    rows,
    outstandingTotal,
    overdueTotal: round2(overdueRows.reduce((sum, row) => sum + row.remaining, 0)),
    overdueCount: overdueRows.length,
    openCount: rows.length,
  };
}

/* ------------------------------------------------------ 3. expenses report */

export interface ReportCategoryRow {
  category: ExpenseCategory;
  total: number;
  count: number;
  /** 0..1 share of the category total in this selection. */
  share: number;
}

export interface ExpensesReport {
  rows: ReportCategoryRow[];
  /** Sum of recorded shared expenses (landlord costs, not tenant payments). */
  total: number;
  count: number;
}

/** Shared expenses by category; category filter narrows to one category. */
export function reportExpensesByCategory(
  data: LandlordData,
  filters: ReportFilters,
  propertyIds: Set<string>
): ExpensesReport {
  const views = toExpenseViews(
    data,
    filters.propertyId ? { propertyId: filters.propertyId } : {}
  );
  const matching = views.filter(
    (expense) =>
      propertyIds.has(expense.propertyId) &&
      overlapsRange(expense.periodStart, expense.periodEnd, filters.rangeStart, filters.rangeEnd) &&
      (filters.expenseCategory === 'All' || expense.category === filters.expenseCategory)
  );

  const total = round2(matching.reduce((sum, expense) => sum + expense.amount, 0));
  const rows: ReportCategoryRow[] = [];
  for (const category of EXPENSE_CATEGORIES) {
    const ofCategory = matching.filter((expense) => expense.category === category);
    if (ofCategory.length === 0) continue;
    const categoryTotal = round2(ofCategory.reduce((sum, expense) => sum + expense.amount, 0));
    rows.push({
      category,
      total: categoryTotal,
      count: ofCategory.length,
      share: total > 0 ? categoryTotal / total : 0,
    });
  }
  rows.sort((a, b) => b.total - a.total);

  return { rows, total, count: matching.length };
}

/* --------------------------------------------------- 4. billing summaries */

/** Itemized tenant statements for the selection (property + date range). */
export function reportStatements(
  data: LandlordData,
  filters: ReportFilters,
  propertyIds: Set<string>
): StatementView[] {
  return toStatementViews(
    data,
    filters.propertyId ? { propertyId: filters.propertyId } : {}
  ).filter(
    (statement) =>
      propertyIds.has(statement.propertyId) &&
      overlapsRange(
        statement.periodStart,
        statement.periodEnd,
        filters.rangeStart,
        filters.rangeEnd
      )
  );
}

/* ------------------------------------------------------- 5. occupancy report */

export interface ReportOccupancyRow {
  propertyId: string;
  propertyName: string;
  totalRooms: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  /** 0..1, occupied / total. */
  occupancyRate: number;
}

export interface OccupancyReport {
  rows: ReportOccupancyRow[];
  totalRooms: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  occupancyRate: number;
}

/** Current room availability per property — live state, not period-based. */
export function reportOccupancy(
  data: LandlordData,
  propertyIds: Set<string>
): OccupancyReport {
  const rows: ReportOccupancyRow[] = [];
  for (const property of data.properties) {
    if (!propertyIds.has(property.id)) continue;
    let occupied = 0;
    let available = 0;
    let reserved = 0;
    let maintenance = 0;
    for (const room of property.rooms) {
      const availability = roomAvailability(room);
      if (availability === 'Occupied') occupied += 1;
      else if (availability === 'Available') available += 1;
      else if (availability === 'Reserved') reserved += 1;
      else maintenance += 1;
    }
    const totalRooms = property.rooms.length;
    rows.push({
      propertyId: property.id,
      propertyName: property.name,
      totalRooms,
      occupied,
      available,
      reserved,
      maintenance,
      occupancyRate: totalRooms > 0 ? occupied / totalRooms : 0,
    });
  }
  rows.sort((a, b) => a.propertyName.localeCompare(b.propertyName));

  const totalRooms = rows.reduce((sum, row) => sum + row.totalRooms, 0);
  const occupied = rows.reduce((sum, row) => sum + row.occupied, 0);
  const available = rows.reduce((sum, row) => sum + row.available, 0);
  const reserved = rows.reduce((sum, row) => sum + row.reserved, 0);
  const maintenance = rows.reduce((sum, row) => sum + row.maintenance, 0);
  return {
    rows,
    totalRooms,
    occupied,
    available,
    reserved,
    maintenance,
    occupancyRate: totalRooms > 0 ? occupied / totalRooms : 0,
  };
}

/* ------------------------------------------------ 6. tenant payment history */

export interface ReportTenantOption {
  id: string;
  fullName: string;
  propertyName: string;
  roomLabel: string;
}

/** Tenants with at least one bill or payment in the authorized scope. */
export function reportTenantOptions(
  data: LandlordData,
  propertyIds: Set<string>
): ReportTenantOption[] {
  const billTenantIds = new Set(
    data.bills.filter((bill) => propertyIds.has(bill.propertyId)).map((bill) => bill.tenantId)
  );
  const paymentTenantIds = new Set(
    data.payments.filter((payment) => propertyIds.has(payment.propertyId)).map((payment) => payment.tenantId)
  );
  return data.tenants
    .filter((tenant) => propertyIds.has(tenant.propertyId))
    .filter((tenant) => billTenantIds.has(tenant.id) || paymentTenantIds.has(tenant.id))
    .map((tenant) => {
      const property = data.properties.find((item) => item.id === tenant.propertyId);
      const room = property?.rooms.find((item) => item.id === tenant.roomId);
      return {
        id: tenant.id,
        fullName: tenant.fullName,
        propertyName: property?.name ?? '',
        roomLabel: room?.label ?? '',
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export interface TenantHistoryReport {
  rows: ReportPaymentRow[];
  /** Sum of all recorded payments from this tenant in the selection. */
  total: number;
  count: number;
}

/** Every payment (rent or expense share) recorded for one tenant. */
export function reportTenantHistory(
  data: LandlordData,
  filters: ReportFilters,
  propertyIds: Set<string>,
  tenantId: string
): TenantHistoryReport {
  const billById = new Map(data.bills.map((bill) => [bill.id, bill]));
  const propertyById = new Map(data.properties.map((property) => [property.id, property]));
  const tenant = data.tenants.find((item) => item.id === tenantId);

  const rows: ReportPaymentRow[] = [];
  for (const payment of data.payments) {
    if (payment.tenantId !== tenantId) continue;
    if (!propertyIds.has(payment.propertyId)) continue;
    if (!inRange(payment.paidAt, filters.rangeStart, filters.rangeEnd)) continue;
    const bill = billById.get(payment.billId);
    if (!bill) continue;
    if (filters.billingCycle && bill.period !== filters.billingCycle) continue;
    if (filters.status !== 'All') {
      const status = paymentStatusOfBill(bill, paidAmountOfBill(data, bill.id));
      if (status !== filters.status) continue;
    }
    const property = propertyById.get(payment.propertyId);
    const room = property?.rooms.find((item) => item.id === payment.roomId);
    rows.push({
      paymentId: payment.id,
      billId: payment.billId,
      tenantId: payment.tenantId,
      tenantName: tenant?.fullName ?? 'Tenant',
      propertyName: property?.name ?? '',
      roomLabel: room?.label ?? '',
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method,
      reference: payment.reference ?? null,
      billingCycle: bill.period,
      kind: bill.kind ?? 'rent',
      note: bill.note,
    });
  }
  rows.sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  return {
    rows,
    total: round2(rows.reduce((sum, row) => sum + row.amount, 0)),
    count: rows.length,
  };
}

/* ------------------------------------------------------------ filter label */

/** Human summary of the active filters, e.g. for the report header. */
export function describeReportFilters(
  filters: ReportFilters,
  propertyName: string | null,
  rangeLabel: string,
  cycleLabel: string | null
): string {
  const parts = [
    propertyName ?? 'All properties',
    rangeLabel,
    cycleLabel ?? 'All billing cycles',
  ];
  if (filters.status !== 'All') parts.push(filters.status);
  if (filters.expenseCategory !== 'All') parts.push(filters.expenseCategory);
  return parts.join(' · ');
}
