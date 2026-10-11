/**
 * BoardPoint landlord data store.
 *
 * Single source of truth for the landlord's properties, rooms, tenants, rent
 * bills, activity feed and notifications. Records are persisted on-device
 * (SecureStore / localStorage) through a tiny observable store and every
 * count, list and money total rendered by the landlord screens is derived
 * from these records — nothing is hardcoded in the UI.
 *
 * `SEED` is the starter dataset that replaces the arrays previously copied
 * into each screen. Clear it (or point hydration at a backend) and every
 * landlord screen falls back to its empty state.
 *
 * When a real backend lands:
 * 1. Create a client (e.g. `lib/supabase.ts`).
 * 2. Replace `hydrateLandlordData` with a fetch and each mutation with a
 *    write; the exported hooks keep their signatures.
 */

import { useMemo, useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { storageGet, storageSet } from '@/services/storage';
import { toISODate, parseISODate, formatShortDate, formatDisplayDate } from '@/utils/date';
import { formatPeso } from '@/utils/currency';

const STORAGE_KEY = 'landlord.data';

/** ISO date N days before today — keeps seed payment records in the past. */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

/** ISO date N days from now — keeps seed due dates in the future. */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** "15 Oct – 14 Nov" billing period label for a due date. */
function periodFor(dueDate: string): string {
  const due = parseISODate(dueDate) ?? new Date();
  const end = new Date(due);
  end.setDate(end.getDate() + 30);
  return `${formatShortDate(dueDate)} – ${formatShortDate(toISODate(end))}`;
}

/** ISO datetime N days ago at a fixed clock time. */
function daysAgoAt(days: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export type BillStatus = 'Paid' | 'Due' | 'Overdue' | 'Upcoming';
export type ActivityKind = 'payment' | 'inquiry' | 'tenant' | 'availability';
export type LeaseStatus = 'Renewal' | 'Active';

export interface LandlordRoom {
  id: string;
  label: string;
  /** Monthly rent in PHP. */
  rent: number;
  status: 'Occupied' | 'Available';
  tenantId?: string;
}

export interface LandlordProperty {
  id: string;
  name: string;
  address: string;
  imageUri?: string;
  rooms: LandlordRoom[];
}

export interface LandlordTenant {
  id: string;
  fullName: string;
  propertyId: string;
  roomId: string;
  monthlyRent: number;
  leaseStart?: string;
  leaseEnd?: string;
  status: 'Active';
}

export interface RentBill {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  amount: number;
  /** ISO date (yyyy-mm-dd) the rent is due. */
  dueDate: string;
  period: string;
  /** ISO date the payment was recorded; undefined while unpaid. */
  paidAt?: string;
}

export interface ActivityRecord {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  /** ISO datetime. */
  at: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  detail: string;
  at: string;
  read: boolean;
}

export interface LandlordData {
  properties: LandlordProperty[];
  tenants: LandlordTenant[];
  bills: RentBill[];
  activities: ActivityRecord[];
  notifications: NotificationRecord[];
}

function seedData(): LandlordData {
  // Due dates are anchored to today so the starter data always reads as a
  // live rental book: rent due soon, a couple of renewals on the horizon.
  const dueThisCycle = daysFromNow(4);
  const dueNextCycle = daysFromNow(7);
  const dueLateCycle = daysFromNow(9);
  const periodThisCycle = periodFor(dueThisCycle);
  const periodNextCycle = periodFor(dueNextCycle);
  const periodLateCycle = periodFor(dueLateCycle);
  const renewalDue = daysFromNow(20);

  return {
    properties: [
      {
        id: 'prop-1',
        name: 'Casa Dela Cruz',
        address: 'Sta. Cruz, Dapitan City',
        rooms: [
          { id: 'p1-r1', label: 'Room 1', rent: 2500, status: 'Occupied', tenantId: 'ten-1' },
          { id: 'p1-r2', label: 'Room 2', rent: 2500, status: 'Occupied', tenantId: 'ten-2' },
          { id: 'p1-r3', label: 'Room 3', rent: 2500, status: 'Occupied', tenantId: 'ten-3' },
          { id: 'p1-r4', label: 'Room 4', rent: 2500, status: 'Available' },
        ],
      },
      {
        id: 'prop-2',
        name: 'City Garden Rooms',
        address: 'Sta. Cruz, Dapitan City',
        rooms: [
          { id: 'p2-r1', label: 'Room 1', rent: 3200, status: 'Occupied', tenantId: 'ten-4' },
          { id: 'p2-r2', label: 'Room 2', rent: 3200, status: 'Occupied', tenantId: 'ten-5' },
          { id: 'p2-r3', label: 'Room 3', rent: 3200, status: 'Occupied', tenantId: 'ten-6' },
          { id: 'p2-r4', label: 'Room 4', rent: 3200, status: 'Occupied', tenantId: 'ten-7' },
          { id: 'p2-r5', label: 'Room 5', rent: 3200, status: 'Available' },
        ],
      },
      {
        id: 'prop-3',
        name: 'North Haven Boarding House',
        address: 'Tambak, Dapitan City',
        rooms: [
          { id: 'p3-r1', label: 'Room 1', rent: 2800, status: 'Occupied', tenantId: 'ten-8' },
          { id: 'p3-r2', label: 'Room 2', rent: 2800, status: 'Occupied', tenantId: 'ten-9' },
          { id: 'p3-r3', label: 'Room 3', rent: 2800, status: 'Occupied', tenantId: 'ten-10' },
          { id: 'p3-r4', label: 'Room 4', rent: 2800, status: 'Occupied', tenantId: 'ten-11' },
          { id: 'p3-r5', label: 'Room 5', rent: 2800, status: 'Occupied', tenantId: 'ten-12' },
          { id: 'p3-r6', label: 'Room 6', rent: 2800, status: 'Available' },
        ],
      },
    ],
    tenants: [
      { id: 'ten-1', fullName: 'Juan Dela Cruz', propertyId: 'prop-1', roomId: 'p1-r1', monthlyRent: 2500, leaseStart: daysFromNow(-345), leaseEnd: renewalDue, status: 'Active' },
      { id: 'ten-2', fullName: 'Carlo Mendoza', propertyId: 'prop-1', roomId: 'p1-r2', monthlyRent: 2500, leaseStart: daysFromNow(-269), leaseEnd: daysFromNow(96), status: 'Active' },
      { id: 'ten-3', fullName: 'Elena Soriano', propertyId: 'prop-1', roomId: 'p1-r3', monthlyRent: 2500, status: 'Active' },
      { id: 'ten-4', fullName: 'Ana Valenzuela', propertyId: 'prop-2', roomId: 'p2-r1', monthlyRent: 3200, leaseStart: daysFromNow(-183), leaseEnd: daysFromNow(182), status: 'Active' },
      { id: 'ten-5', fullName: 'Marco Diaz', propertyId: 'prop-2', roomId: 'p2-r2', monthlyRent: 3200, status: 'Active' },
      { id: 'ten-6', fullName: 'Sarah Lim', propertyId: 'prop-2', roomId: 'p2-r3', monthlyRent: 3200, status: 'Active' },
      { id: 'ten-7', fullName: 'Patricia Tan', propertyId: 'prop-2', roomId: 'p2-r4', monthlyRent: 3200, status: 'Active' },
      { id: 'ten-8', fullName: 'Alex Reyes', propertyId: 'prop-3', roomId: 'p3-r1', monthlyRent: 2800, leaseStart: daysFromNow(-225), leaseEnd: daysFromNow(140), status: 'Active' },
      { id: 'ten-9', fullName: 'Bea Gomez', propertyId: 'prop-3', roomId: 'p3-r2', monthlyRent: 2800, status: 'Active' },
      { id: 'ten-10', fullName: 'Christian Cruz', propertyId: 'prop-3', roomId: 'p3-r3', monthlyRent: 2800, status: 'Active' },
      { id: 'ten-11', fullName: 'Danielle Ramos', propertyId: 'prop-3', roomId: 'p3-r4', monthlyRent: 2800, status: 'Active' },
      { id: 'ten-12', fullName: 'Francis Santos', propertyId: 'prop-3', roomId: 'p3-r5', monthlyRent: 2800, status: 'Active' },
    ],
    bills: [
      { id: 'bill-1', tenantId: 'ten-3', propertyId: 'prop-1', roomId: 'p1-r3', amount: 2500, dueDate: dueThisCycle, period: periodThisCycle },
      { id: 'bill-2', tenantId: 'ten-7', propertyId: 'prop-2', roomId: 'p2-r4', amount: 3200, dueDate: dueThisCycle, period: periodThisCycle },
      { id: 'bill-3', tenantId: 'ten-12', propertyId: 'prop-3', roomId: 'p3-r5', amount: 2800, dueDate: dueThisCycle, period: periodThisCycle },
      { id: 'bill-4', tenantId: 'ten-1', propertyId: 'prop-1', roomId: 'p1-r1', amount: 2500, dueDate: dueThisCycle, period: periodThisCycle, paidAt: daysAgo(3) },
      { id: 'bill-5', tenantId: 'ten-2', propertyId: 'prop-1', roomId: 'p1-r2', amount: 2500, dueDate: dueThisCycle, period: periodThisCycle, paidAt: daysAgo(1) },
      { id: 'bill-6', tenantId: 'ten-4', propertyId: 'prop-2', roomId: 'p2-r1', amount: 3200, dueDate: dueNextCycle, period: periodNextCycle, paidAt: daysAgo(5) },
      { id: 'bill-7', tenantId: 'ten-5', propertyId: 'prop-2', roomId: 'p2-r2', amount: 3200, dueDate: dueNextCycle, period: periodNextCycle, paidAt: daysAgo(2) },
      { id: 'bill-8', tenantId: 'ten-8', propertyId: 'prop-3', roomId: 'p3-r1', amount: 2800, dueDate: dueLateCycle, period: periodLateCycle, paidAt: daysAgo(4) },
    ],
    activities: [
      { id: 'act-1', kind: 'inquiry', title: 'New inquiry', detail: 'Casa Dela Cruz · Room 4 — a renter asked about availability', at: daysAgoAt(1, 9, 5) },
      { id: 'act-2', kind: 'payment', title: 'Payment recorded', detail: '₱2,500 from Carlo Mendoza · Casa Dela Cruz · Room 2', at: daysAgoAt(1, 16, 40) },
      { id: 'act-3', kind: 'availability', title: 'Room became available', detail: 'City Garden Rooms · Room 5 is open for rent', at: daysAgoAt(2, 10, 20) },
      { id: 'act-4', kind: 'payment', title: 'Payment recorded', detail: '₱3,200 from Marco Diaz · City Garden Rooms · Room 2', at: daysAgoAt(2, 14, 15) },
      { id: 'act-5', kind: 'payment', title: 'Payment recorded', detail: '₱2,500 from Juan Dela Cruz · Casa Dela Cruz · Room 1', at: daysAgoAt(3, 11, 30) },
      { id: 'act-6', kind: 'tenant', title: 'Tenant added', detail: 'Francis Santos moved into North Haven Boarding House · Room 5', at: daysAgoAt(4, 8, 45) },
    ],
    notifications: [
      { id: 'noti-1', title: `Rent due ${formatShortDate(dueThisCycle)}`, detail: `3 tenants have rent due on ${formatDisplayDate(dueThisCycle)}.`, at: daysAgoAt(1, 8, 0), read: false },
      { id: 'noti-2', title: 'New inquiry for Room 4', detail: 'Casa Dela Cruz — a renter asked about availability.', at: daysAgoAt(1, 9, 5), read: false },
      { id: 'noti-3', title: `Lease renewal due ${formatDisplayDate(renewalDue)}`, detail: 'Juan Dela Cruz · Casa Dela Cruz · Room 1.', at: daysAgoAt(2, 18, 30), read: false },
      { id: 'noti-4', title: 'Payment received', detail: '₱2,500 from Carlo Mendoza was recorded.', at: daysAgoAt(1, 16, 41), read: true },
    ],
  };
}

function cloneSeed(): LandlordData {
  return JSON.parse(JSON.stringify(seedData())) as LandlordData;
}

let state: LandlordData = cloneSeed();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(next: LandlordData): void {
  state = next;
  emit();
}

function subscribeLandlord(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): LandlordData {
  return state;
}

function persist(): Promise<void> {
  return storageSet(STORAGE_KEY, JSON.stringify(state));
}

async function hydrateLandlordData(): Promise<void> {
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as LandlordData;
    if (parsed && Array.isArray(parsed.properties) && Array.isArray(parsed.bills)) {
      setState(parsed);
    }
  } catch {
    // Ignore a malformed cache and keep the seed records.
  }
}

void hydrateLandlordData();

export function useLandlordData(): LandlordData {
  return useSyncExternalStore(subscribeLandlord, getSnapshot, getSnapshot);
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export async function markBillPaid(billId: string): Promise<void> {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill || bill.paidAt) return;

  const tenant = state.tenants.find((item) => item.id === bill.tenantId);
  const property = state.properties.find((item) => item.id === bill.propertyId);
  const room = property?.rooms.find((item) => item.id === bill.roomId);

  const activity: ActivityRecord = {
    id: Crypto.randomUUID(),
    kind: 'payment',
    title: 'Payment recorded',
    detail: [
      formatPeso(bill.amount),
      `from ${tenant?.fullName ?? 'Tenant'}`,
      property?.name,
      room?.label,
    ]
      .filter(Boolean)
      .join(' · '),
    at: new Date().toISOString(),
  };

  setState({
    ...state,
    bills: state.bills.map((item) =>
      item.id === billId ? { ...item, paidAt: toISODate(new Date()) } : item
    ),
    activities: [activity, ...state.activities],
  });
  await persist();
}

export async function markAllNotificationsRead(): Promise<void> {
  if (state.notifications.every((item) => item.read)) return;
  setState({
    ...state,
    notifications: state.notifications.map((item) => ({ ...item, read: true })),
  });
  await persist();
}

/* -------------------------------------------------------------------------- */
/* Derived views                                                              */
/* -------------------------------------------------------------------------- */

export interface PropertyView extends LandlordProperty {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  /** Earliest unpaid bill due date (ISO) for this property, if any. */
  nextDueDate: string | null;
  minRent: number;
  maxRent: number;
}

export interface BillView extends RentBill {
  status: BillStatus;
  tenantName: string;
  propertyName: string;
  roomLabel: string;
}

export interface TenantView extends LandlordTenant {
  propertyName: string;
  roomLabel: string;
  leaseStatus: LeaseStatus;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Status of a bill against a reference day: Paid / Due / Overdue / Upcoming. */
export function billStatus(bill: RentBill, today: Date = new Date()): BillStatus {
  if (bill.paidAt) return 'Paid';
  const due = parseISODate(bill.dueDate);
  if (!due) return 'Upcoming';
  const reference = startOfDay(today).getTime();
  if (due.getTime() < reference) return 'Overdue';
  if (due.getTime() === reference) return 'Due';
  return 'Upcoming';
}

/** Leases ending within 60 days are flagged for renewal. */
export function leaseStatus(tenant: LandlordTenant, today: Date = new Date()): LeaseStatus {
  const end = parseISODate(tenant.leaseEnd ?? null);
  if (!end) return 'Active';
  const daysLeft = Math.round((end.getTime() - startOfDay(today).getTime()) / 86_400_000);
  return daysLeft <= 60 ? 'Renewal' : 'Active';
}

export function toPropertyViews(data: LandlordData): PropertyView[] {
  return data.properties.map((property) => {
    const occupiedRooms = property.rooms.filter((room) => room.status === 'Occupied').length;
    const nextDue =
      data.bills
        .filter((bill) => bill.propertyId === property.id && !bill.paidAt)
        .map((bill) => bill.dueDate)
        .sort()[0] ?? null;
    const rents = property.rooms.map((room) => room.rent);
    return {
      ...property,
      totalRooms: property.rooms.length,
      occupiedRooms,
      availableRooms: property.rooms.length - occupiedRooms,
      nextDueDate: nextDue,
      minRent: rents.length ? Math.min(...rents) : 0,
      maxRent: rents.length ? Math.max(...rents) : 0,
    };
  });
}

export function toBillViews(data: LandlordData): BillView[] {
  const today = new Date();
  return data.bills
    .map((bill) => {
      const tenant = data.tenants.find((item) => item.id === bill.tenantId);
      const property = data.properties.find((item) => item.id === bill.propertyId);
      const room = property?.rooms.find((item) => item.id === bill.roomId);
      return {
        ...bill,
        status: billStatus(bill, today),
        tenantName: tenant?.fullName ?? 'Tenant',
        propertyName: property?.name ?? '',
        roomLabel: room?.label ?? '',
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function toTenantViews(data: LandlordData): TenantView[] {
  const today = new Date();
  return data.tenants.map((tenant) => {
    const property = data.properties.find((item) => item.id === tenant.propertyId);
    const room = property?.rooms.find((item) => item.id === tenant.roomId);
    return {
      ...tenant,
      propertyName: property?.name ?? '',
      roomLabel: room?.label ?? '',
      leaseStatus: leaseStatus(tenant, today),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

export interface LandlordSummary {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  activeTenants: number;
  /** Monthly rent across every occupied room (potential collections). */
  monthlyRentRoll: number;
  /** Sum of every unpaid bill. */
  outstandingAmount: number;
  /** Sum of unpaid bills whose due date has passed. */
  overdueAmount: number;
  overdueCount: number;
  unpaidCount: number;
  paidCount: number;
  /** Earliest unpaid due date (ISO); null when nothing is unpaid. */
  nextDueDate: string | null;
  /** Unpaid bills sorted soonest-first. */
  unpaidBills: BillView[];
  /** Unpaid bills that are past due, soonest-first. */
  overdueBills: BillView[];
  /** Unpaid bills due today or later, soonest-first. */
  upcomingBills: BillView[];
  unreadNotifications: number;
  hasBillingRecords: boolean;
}

export function summarize(data: LandlordData): LandlordSummary {
  const properties = toPropertyViews(data);
  const bills = toBillViews(data);
  const today = new Date();

  const unpaidBills = bills.filter((bill) => !bill.paidAt);
  const overdueBills = unpaidBills.filter((bill) => billStatus(bill, today) === 'Overdue');
  const upcomingBills = unpaidBills.filter(
    (bill) => billStatus(bill, today) !== 'Overdue'
  );

  const totalRooms = properties.reduce((sum, property) => sum + property.totalRooms, 0);
  const occupiedRooms = properties.reduce((sum, property) => sum + property.occupiedRooms, 0);

  return {
    totalProperties: properties.length,
    totalRooms,
    occupiedRooms,
    availableRooms: totalRooms - occupiedRooms,
    activeTenants: data.tenants.filter((tenant) => tenant.status === 'Active').length,
    monthlyRentRoll: data.properties.reduce(
      (sum, property) =>
        sum +
        property.rooms
          .filter((room) => room.status === 'Occupied')
          .reduce((roomSum, room) => roomSum + room.rent, 0),
      0
    ),
    outstandingAmount: unpaidBills.reduce((sum, bill) => sum + bill.amount, 0),
    overdueAmount: overdueBills.reduce((sum, bill) => sum + bill.amount, 0),
    overdueCount: overdueBills.length,
    unpaidCount: unpaidBills.length,
    paidCount: bills.length - unpaidBills.length,
    nextDueDate: unpaidBills[0]?.dueDate ?? null,
    unpaidBills,
    overdueBills,
    upcomingBills,
    unreadNotifications: data.notifications.filter((item) => !item.read).length,
    hasBillingRecords: bills.length > 0,
  };
}

export function useLandlordSummary(): LandlordSummary {
  const data = useLandlordData();
  return useMemo(() => summarize(data), [data]);
}
