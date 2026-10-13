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

import { renterMockRooms } from '@/data/renter';
import { pushNotification } from '@/services/notifications';
import {
  inferNotificationKind,
  isNotificationKindEnabled,
  type LandlordNotificationKind,
  type LandlordNotificationLink,
} from '@/services/landlordNotifications';
import { mirrorRentalRequest } from '@/services/rentalRequests';
import { storageGet, storageSet } from '@/services/storage';
import { DEFAULT_MAP_POINT } from '@/services/geocode';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatShortDate, parseISODate, toISODate, MONTH_ABBRS } from '@/utils/date';
import * as Crypto from 'expo-crypto';
import { useMemo, useSyncExternalStore } from 'react';

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
export type ActivityKind = 'payment' | 'inquiry' | 'tenant' | 'availability' | 'request';
export type LeaseStatus = 'Renewal' | 'Active';

/** Lifecycle of a renter's request for a room. */
export type RentalRequestStatus = 'Pending' | 'Approved' | 'Declined';

/**
 * Lifecycle of a renter's registration with a landlord/property. A
 * registration starts `Pending` when the rental request is submitted and only
 * becomes `Confirmed` when the landlord approves the request — the confirmed
 * record is what backs the renter's "Verified Renter" badge.
 */
export type RegistrationStatus = 'Pending' | 'Confirmed' | 'Declined';


/**
 * Tenant lifecycle.
 *
 * - Inquiry / Requested: prospective renters — never counted as occupants.
 * - Reserved: a room is held for the renter; not yet moved in.
 * - Active: moved in and occupying a room.
 * - Declined / Former: terminal records kept so history is never lost.
 */
export type TenantStatus =
  | 'Inquiry'
  | 'Requested'
  | 'Reserved'
  | 'Active'
  | 'Declined'
  | 'Former';

export const TENANT_STATUSES: readonly TenantStatus[] = [
  'Inquiry',
  'Requested',
  'Reserved',
  'Active',
  'Declined',
  'Former',
];

/** Directory filter groups — keeps the six statuses readable as five chips. */
export const TENANT_STATUS_FILTERS = [
  'All',
  'Inquiry',
  'Requested',
  'Reserved',
  'Active',
  'Former',
  'Declined',
] as const;

export type TenantStatusFilter = (typeof TENANT_STATUS_FILTERS)[number];

/** Lifecycle of a rental listing. Archived listings never delete financial history. */
export type ListingStatus = 'Draft' | 'Published' | 'Inactive' | 'Archived';

export const LISTING_STATUSES: readonly ListingStatus[] = [
  'Draft',
  'Published',
  'Inactive',
  'Archived',
];

/** Amenities a landlord can toggle on a listing. */
export const PROPERTY_AMENITIES = [
  'Wi-Fi',
  'Parking',
  'Laundry Area',
  'Kitchen',
  'Security',
  'Common Areas',
] as const;

/** Kinds of rooms a landlord can list. */
export type RoomType = 'Private Room' | 'Shared Room' | 'Bed Space';

export const ROOM_TYPES: readonly RoomType[] = [
  'Private Room',
  'Shared Room',
  'Bed Space',
];

/** Full availability lifecycle for a room. */
export type RoomAvailability = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export const ROOM_AVAILABILITIES: readonly RoomAvailability[] = [
  'Available',
  'Occupied',
  'Reserved',
  'Maintenance',
];

/** Furnishings a landlord can toggle on a room. */
export const ROOM_FURNISHINGS = [
  'Bed',
  'Mattress',
  'Closet',
  'Desk',
  'Chair',
  'Fan',
  'Aircon',
  'Cabinet',
  'Curtains',
  'Mirror',
] as const;

export interface LandlordRoom {
  id: string;
  label: string;
  /** Monthly rent in PHP. */
  rent: number;
  status: 'Occupied' | 'Available';
  availability: RoomAvailability;
  roomType: RoomType;
  /** Maximum tenants this room may hold. */
  maxCapacity: number;
  description: string;
  furnishings: string[];
  photos: string[];
  /** Primary tenant link (legacy); full occupant list derives from tenants. */
  tenantId?: string;
}

export interface LandlordProperty {
  id: string;
  /**
   * Authoring landlord. Records without it (starter data) are visible to any
   * signed-in landlord; once set, only that landlord may view or modify it.
   */
  landlordId?: string;
  name: string;
  description: string;
  address: string;
  region: string;
  city: string;
  barangay: string;
  latitude: number;
  longitude: number;
  /** True once the landlord pinned the property on the map. */
  mapLocationSet: boolean;
  photos: string[];
  amenities: string[];
  houseRules: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  listingStatus: ListingStatus;
  /** Cover photo, kept in sync with photos[0] for older dashboard cards. */
  imageUri?: string;
  rooms: LandlordRoom[];
}

export interface LandlordTenant {
  id: string;
  fullName: string;
  /** Contact details are only surfaced to the landlord who owns the property. */
  email?: string;
  phone?: string;
  photoUri?: string;
  propertyId: string;
  roomId?: string;
  monthlyRent: number;
  leaseStart?: string;
  leaseEnd?: string;
  status: TenantStatus;
  moveInAt?: string;
  /** Date move-out / termination was recorded (ISO). */
  moveOutAt?: string;
  /** Security deposit held in PHP. */
  deposit?: number;
  notes?: string;
  /** Message thread between landlord and tenant (newest last). */
  messages?: TenantMessage[];
}

/** A message on a tenancy thread. */
export interface TenantMessage {
  id: string;
  from: 'landlord' | 'tenant';
  body: string;
  /** ISO datetime. */
  at: string;
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
  /** ISO date the bill was settled (cleared); undefined while a balance remains. */
  paidAt?: string;
  kind?: 'rent' | 'expense';
  /** Description for shared-expense bills (e.g. "Electricity share"). */
  note?: string;
}

/**
 * How the payment was handed over. BoardPoint only *records* payments — it
 * never moves money, so no gateway is involved.
 */
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'E-wallet';

export const PAYMENT_METHODS: readonly PaymentMethod[] = ['Cash', 'Bank Transfer', 'E-wallet'];

/** One payment received against a bill. Entries are append-only history. */
export interface PaymentEntry {
  id: string;
  billId: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  amount: number;
  /** ISO date (yyyy-mm-dd) the payment was actually received. */
  paidAt: string;
  method: PaymentMethod;
  /** Deposit / e-wallet / cheque reference number, when applicable. */
  reference?: string;
  /** Free-form notes (who received it, cheque number, etc.). */
  notes?: string;
  /** ISO datetime the entry was recorded — the audit timestamp. */
  createdAt: string;
}

/**
 * Derived from the bill balance and due date — never edited manually:
 * Paid (settled) > Overdue (past due with a balance) > Partially Paid >
 * Unpaid.
 */
export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';

/* ------------------------------------------------- shared expenses & billing */

/** Utility / upkeep costs split across a property's tenants. */
export type ExpenseCategory =
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Cleaning'
  | 'Maintenance'
  | 'Other';

export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'Electricity',
  'Water',
  'Internet',
  'Cleaning',
  'Maintenance',
  'Other',
];

/**
 * How a shared expense is divided:
 * - `equal` — every eligible tenant pays the same (default).
 * - `byRoom` — each room pays an equal share; rooms with several included
 *   tenants split that room's share.
 * - `byOccupancy` — shares are weighted by each room's capacity.
 * - `custom` — the landlord types the amount for each tenant (must total the
 *   expense exactly).
 */
export type AllocationMethod = 'equal' | 'byRoom' | 'byOccupancy' | 'custom';

export const ALLOCATION_METHODS: readonly AllocationMethod[] = [
  'equal',
  'byRoom',
  'byOccupancy',
  'custom',
];

export const ALLOCATION_METHOD_LABELS: Record<AllocationMethod, string> = {
  equal: 'Equal split',
  byRoom: 'By room',
  byOccupancy: 'By occupancy',
  custom: 'Custom amounts',
};

/** One tenant's share of a shared expense, in PHP. Shares always sum to the total. */
export interface ExpenseAllocation {
  tenantId: string;
  amount: number;
}

/** A confirmed shared expense for one property and billing period. */
export interface SharedExpense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  description?: string;
  /** Billing period start (yyyy-mm-dd). */
  periodStart: string;
  /** Billing period end (yyyy-mm-dd). */
  periodEnd: string;
  /** Total cost of the expense, in PHP. */
  amount: number;
  /** Date the utility bill was issued (yyyy-mm-dd). */
  billDate: string;
  /** Date allocated shares are due from tenants (yyyy-mm-dd). */
  dueDate: string;
  /** Attached photo of the utility bill, when the landlord took one. */
  attachmentName?: string;
  attachmentUri?: string;
  allocationMethod: AllocationMethod;
  /** Eligible tenants at the time the expense was saved. */
  tenantIds: string[];
  /** Frozen per-tenant shares (recomputed when the expense is edited). */
  allocations: ExpenseAllocation[];
  /** ISO datetime the expense was recorded. */
  createdAt: string;
}

export type StatementStatus = 'draft' | 'finalized';

/** One itemised line on a tenant statement. `billId` links it to a RentBill once billed. */
export interface StatementLine {
  id: string;
  kind: 'rent' | ExpenseCategory;
  label: string;
  amount: number;
  /** Source shared expense for allocated lines. */
  expenseId?: string;
  /** RentBill backing this line (set when billed or linked at generation). */
  billId?: string;
}

/** A controlled correction applied to a FINALIZED statement (never silent). */
export interface StatementCorrection {
  id: string;
  label: string;
  /** Signed PHP amount; negative values credit the tenant. */
  amount: number;
  reason: string;
  /** ISO datetime the correction was recorded. */
  at: string;
}

/**
 * An itemised bill for one tenant over one billing period. Drafts are
 * estimates; finalizing freezes the calculation and posts the charges as
 * RentBills. Later input changes never touch a finalized statement — they go
 * through `StatementCorrection` records instead.
 */
export interface TenantStatement {
  id: string;
  propertyId: string;
  tenantId: string;
  roomId: string;
  /** Billing period start (yyyy-mm-dd). */
  periodStart: string;
  /** Billing period end (yyyy-mm-dd). */
  periodEnd: string;
  /** Date the statement's charges are due (yyyy-mm-dd). */
  dueDate: string;
  status: StatementStatus;
  lines: StatementLine[];
  /** Unpaid balance carried into this statement (snapshot at generation). */
  previousBalance: number;
  /** Bills that made up the carried balance (for payments-applied tracking). */
  previousBalanceBillIds: string[];
  corrections: StatementCorrection[];
  /** ISO datetime the draft was generated. */
  createdAt: string;
  /** ISO datetime the statement was finalized — locked from silent changes. */
  finalizedAt?: string;
}

export interface ActivityRecord {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  /** ISO datetime. */
  at: string;
  tenantId?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  detail: string;
  at: string;
  read: boolean;
  /** Category for grouping, icons, and the preferences screen. */
  kind?: LandlordNotificationKind;
  /** Deep link to the related property, tenant, bill, or statement. */
  link?: LandlordNotificationLink;
}

/**
 * A renter's application for a specific room. The room is resolved to the
 * owning property through the marketplace listing — never trusted from client
 * input alone — and the monthly rent is snapshotted from the landlord room so
 * the landlord reviews the authoritative amount.
 */
export interface RentalRequest {
  id: string;
  renterId: string;
  renterName: string;
  /** Marketplace listing id (`RenterRoom.id`). */
  roomRefId: string;
  propertyId: string;
  roomId: string;
  monthlyRent: number;
  status: RentalRequestStatus;
  /** ISO datetime the request was submitted. */
  createdAt: string;
  /** ISO datetime the landlord decided; undefined while pending. */
  decidedAt?: string;
}

/**
 * A renter's registration relationship with a property's landlord. Scoped by
 * `propertyId` (and `landlordId` for forward compatibility) so verification
 * with one landlord never leaks into another landlord's context.
 */
export interface Registration {
  id: string;
  renterId: string;
  renterName: string;
  landlordId: string;
  propertyId: string;
  roomId: string;
  status: RegistrationStatus;
  /** ISO datetime the request was submitted. */
  createdAt: string;
  /** ISO datetime the landlord confirmed; undefined unless confirmed. */
  confirmedAt?: string;
}

export interface LandlordData {
  properties: LandlordProperty[];
  tenants: LandlordTenant[];
  bills: RentBill[];
  payments: PaymentEntry[];
  activities: ActivityRecord[];
  notifications: NotificationRecord[];
  requests: RentalRequest[];
  registrations: Registration[];
  sharedExpenses: SharedExpense[];
  statements: TenantStatement[];
}

type SeedRoom = Partial<LandlordRoom> & { id: string };
type SeedProperty = Partial<Omit<LandlordProperty, 'rooms'>> & {
  id: string;
  rooms: SeedRoom[];
};
type SeedData = Omit<LandlordData, 'properties'> & { properties: SeedProperty[] };

function seedData(): SeedData {
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
        description:
          'A quiet four-room boarding house a short walk from the city plaza. Rooms are spacious, well ventilated, and come with individual outlets and study desks.',
        address: 'Sta. Cruz, Dapitan City',
        region: 'Region IX (Zamboanga Peninsula)',
        city: 'Dapitan City',
        barangay: 'Sta. Cruz',
        latitude: 9.3078,
        longitude: 123.3069,
        mapLocationSet: true,
        photos: [],
        amenities: ['Wi-Fi', 'Kitchen', 'Common Areas'],
        houseRules:
          'Quiet hours from 10:00 PM to 6:00 AM. No smoking inside the rooms. Guests must be registered at the front desk. Water and electricity are shared and billed monthly.',
        contactName: 'Ricardo Dela Cruz',
        contactPhone: '+63 917 555 0142',
        contactEmail: 'casa.delacruz@boardpoint.ph',
        listingStatus: 'Published',
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
        description:
          'Modern rooms with shared garden and lanai. Ideal for students and young professionals who want a central location with secure parking.',
        address: 'Tambak, Dapitan City',
        region: 'Region IX (Zamboanga Peninsula)',
        city: 'Dapitan City',
        barangay: 'Tambak',
        latitude: 9.3295,
        longitude: 123.2871,
        mapLocationSet: true,
        photos: [],
        amenities: ['Parking', 'Laundry Area', 'Common Areas'],
        houseRules:
          'Rent is due on or before the 5th of each month. Report leaks and electrical issues immediately. Do not modify room fixtures without approval.',
        contactName: 'North Haven Management',
        contactPhone: '+63 995 441 2098',
        contactEmail: 'northhaven@boardpoint.ph',
        listingStatus: 'Published',
        rooms: [
          { id: 'p3-r1', label: 'Room 1', rent: 2800, status: 'Occupied', tenantId: 'ten-8' },
          { id: 'p3-r2', label: 'Room 2', rent: 2800, status: 'Occupied', tenantId: 'ten-9' },
          { id: 'p3-r3', label: 'Room 3', rent: 2800, status: 'Occupied', tenantId: 'ten-10' },
          { id: 'p3-r4', label: 'Room 4', rent: 2800, status: 'Occupied', tenantId: 'ten-11' },
          { id: 'p3-r5', label: 'Room 5', rent: 2800, status: 'Occupied', tenantId: 'ten-12' },
          { id: 'p3-r6', label: 'Room 6', rent: 2800, status: 'Available' },
        ],
      },
      {
        id: 'prop-4',
        name: 'Sunrise Village House',
        address: 'Poblacion, Dapitan City',
        rooms: [
          { id: 'p4-r1', label: 'Family Room', rent: 4800, status: 'Available' },
          { id: 'p4-r2', label: 'Twin Room', rent: 4200, status: 'Available' },
        ],
      },
      {
        id: 'prop-5',
        name: 'Palm Condo Residences',
        address: 'San Roque, Dapitan City',
        rooms: [
          { id: 'p5-r1', label: 'Studio', rent: 5500, status: 'Available' },
          { id: 'p5-r2', label: 'One-Bedroom', rent: 6000, status: 'Available' },
        ],
      },
      {
        id: 'prop-6',
        name: 'Dahlia Apartments',
        address: 'Providencia, Dapitan City',
        rooms: [
          { id: 'p6-r1', label: 'Studio', rent: 4500, status: 'Available' },
          { id: 'p6-r2', label: 'Loft', rent: 5200, status: 'Available' },
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
    payments: [
      { id: 'pay-seed-1', billId: 'bill-4', tenantId: 'ten-1', propertyId: 'prop-1', roomId: 'p1-r1', amount: 2500, paidAt: daysAgo(3), method: 'Cash', createdAt: daysAgoAt(3, 11, 30) },
      { id: 'pay-seed-2', billId: 'bill-5', tenantId: 'ten-2', propertyId: 'prop-1', roomId: 'p1-r2', amount: 2500, paidAt: daysAgo(1), method: 'E-wallet', reference: 'GCash 9174562810', createdAt: daysAgoAt(1, 16, 40) },
      { id: 'pay-seed-3', billId: 'bill-6', tenantId: 'ten-4', propertyId: 'prop-2', roomId: 'p2-r1', amount: 3200, paidAt: daysAgo(5), method: 'Bank Transfer', reference: 'BPI Ref 2P0B6D20-1842', createdAt: daysAgoAt(5, 10, 5) },
      { id: 'pay-seed-4', billId: 'bill-7', tenantId: 'ten-5', propertyId: 'prop-2', roomId: 'p2-r2', amount: 3200, paidAt: daysAgo(2), method: 'Cash', createdAt: daysAgoAt(2, 14, 15) },
      { id: 'pay-seed-5', billId: 'bill-8', tenantId: 'ten-8', propertyId: 'prop-3', roomId: 'p3-r1', amount: 2800, paidAt: daysAgo(4), method: 'E-wallet', reference: 'GCash 9051120044', createdAt: daysAgoAt(4, 15, 30) },
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
      { id: 'noti-1', kind: 'rent', link: { kind: 'bills' }, title: `Rent due ${formatShortDate(dueThisCycle)}`, detail: `3 tenants have rent due on ${formatDisplayDate(dueThisCycle)}.`, at: daysAgoAt(1, 8, 0), read: false },
      { id: 'noti-2', kind: 'inquiry', link: { kind: 'property', propertyId: 'prop-1' }, title: 'New inquiry for Room 4', detail: 'Casa Dela Cruz — a renter asked about availability.', at: daysAgoAt(1, 9, 5), read: false },
      { id: 'noti-3', kind: 'request', link: { kind: 'tenant', tenantId: 'ten-1' }, title: `Lease renewal due ${formatDisplayDate(renewalDue)}`, detail: 'Juan Dela Cruz · Casa Dela Cruz · Room 1.', at: daysAgoAt(2, 18, 30), read: false },
      { id: 'noti-4', kind: 'payment', link: { kind: 'payments' }, title: 'Payment received', detail: '₱2,500 from Carlo Mendoza was recorded.', at: daysAgoAt(1, 16, 41), read: true },
    ],
    requests: [],
    registrations: [],
    sharedExpenses: [
      {
        id: 'exp-seed-1',
        propertyId: 'prop-2',
        category: 'Electricity',
        description: 'Meralco statement for the common areas and corridor lights.',
        periodStart: toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        periodEnd: toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
        amount: 3000,
        billDate: daysAgo(6),
        dueDate: daysFromNow(5),
        allocationMethod: 'equal',
        tenantIds: ['ten-4', 'ten-5', 'ten-6', 'ten-7'],
        allocations: [
          { tenantId: 'ten-4', amount: 750 },
          { tenantId: 'ten-5', amount: 750 },
          { tenantId: 'ten-6', amount: 750 },
          { tenantId: 'ten-7', amount: 750 },
        ],
        createdAt: daysAgoAt(6, 9, 15),
      },
      {
        id: 'exp-seed-2',
        propertyId: 'prop-2',
        category: 'Water',
        description: 'Shared water bill for October.',
        periodStart: toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        periodEnd: toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
        amount: 1200,
        billDate: daysAgo(6),
        dueDate: daysFromNow(5),
        allocationMethod: 'equal',
        tenantIds: ['ten-4', 'ten-5', 'ten-6', 'ten-7'],
        allocations: [
          { tenantId: 'ten-4', amount: 300 },
          { tenantId: 'ten-5', amount: 300 },
          { tenantId: 'ten-6', amount: 300 },
          { tenantId: 'ten-7', amount: 300 },
        ],
        createdAt: daysAgoAt(6, 9, 20),
      },
      {
        id: 'exp-seed-3',
        propertyId: 'prop-1',
        category: 'Internet',
        description: 'Fiber plan split across the three occupied rooms.',
        periodStart: toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        periodEnd: toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
        amount: 800,
        billDate: daysAgo(4),
        dueDate: daysFromNow(5),
        allocationMethod: 'equal',
        tenantIds: ['ten-1', 'ten-2', 'ten-3'],
        allocations: [
          { tenantId: 'ten-1', amount: 266.7 },
          { tenantId: 'ten-2', amount: 266.7 },
          { tenantId: 'ten-3', amount: 266.6 },
        ],
        createdAt: daysAgoAt(4, 10, 5),
      },
    ],
    statements: [],
  };
}

function cloneSeed(): LandlordData {
  return normalizeData(JSON.parse(JSON.stringify(seedData())));
}

/** Fill in fields missing on rooms from older caches or the starter seed. */
function normalizeRoom(raw: Partial<LandlordRoom> & { id: string }): LandlordRoom {
  const availability: RoomAvailability =
    raw.availability ??
    (raw.status === 'Occupied' || raw.tenantId ? 'Occupied' : 'Available');
  return {
    id: raw.id,
    label: raw.label ?? 'Room',
    rent: raw.rent ?? 0,
    status: availability === 'Occupied' ? 'Occupied' : 'Available',
    availability,
    roomType: raw.roomType ?? 'Private Room',
    maxCapacity: raw.maxCapacity ?? 1,
    description: raw.description ?? '',
    furnishings: Array.isArray(raw.furnishings) ? raw.furnishings : [],
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    tenantId: raw.tenantId,
  };
}

/** Fill in fields missing from caches written before the property rework. */
function normalizeProperty(
  raw: Partial<Omit<LandlordProperty, 'rooms'>> & { id: string; rooms?: SeedRoom[] }
): LandlordProperty {
  const photos = Array.isArray(raw.photos)
    ? raw.photos.filter((uri): uri is string => typeof uri === 'string')
    : raw.imageUri
      ? [raw.imageUri]
      : [];
  return {
    id: raw.id,
    landlordId: raw.landlordId,
    name: raw.name ?? '',
    description: raw.description ?? '',
    address: raw.address ?? '',
    region: raw.region ?? '',
    city: raw.city ?? '',
    barangay: raw.barangay ?? '',
    latitude: typeof raw.latitude === 'number' ? raw.latitude : DEFAULT_MAP_POINT.latitude,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : DEFAULT_MAP_POINT.longitude,
    mapLocationSet: raw.mapLocationSet ?? false,
    photos,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    houseRules: raw.houseRules ?? '',
    contactName: raw.contactName ?? '',
    contactPhone: raw.contactPhone ?? '',
    contactEmail: raw.contactEmail ?? '',
    listingStatus: raw.listingStatus ?? 'Published',
    imageUri: photos[0] ?? raw.imageUri,
    rooms: Array.isArray(raw.rooms)
      ? raw.rooms
        .filter((room): room is LandlordRoom & { id: string } => Boolean(room?.id))
        .map(normalizeRoom)
      : [],
  };
}

/** Fill in fields missing on tenants from older caches or the starter seed. */
function normalizeTenant(raw: Partial<LandlordTenant> & { id: string }): LandlordTenant {
  const status: TenantStatus = raw.status ?? 'Active';
  return {
    id: raw.id,
    fullName: raw.fullName ?? 'Tenant',
    email: raw.email,
    phone: raw.phone,
    photoUri: raw.photoUri,
    propertyId: raw.propertyId ?? '',
    roomId: raw.roomId,
    monthlyRent: raw.monthlyRent ?? 0,
    leaseStart: raw.leaseStart,
    leaseEnd: raw.leaseEnd,
    moveInAt: raw.moveInAt,
    moveOutAt: raw.moveOutAt,
    deposit: raw.deposit,
    notes: raw.notes,
    status,
    messages: Array.isArray(raw.messages) ? raw.messages : [],
  };
}

function normalizeData(
  parsed: Partial<Omit<LandlordData, 'properties'>> & { properties?: SeedProperty[] }
): LandlordData {
  return {
    properties: Array.isArray(parsed.properties)
      ? parsed.properties
        .filter((property): property is SeedProperty & { id: string } => Boolean(property?.id))
        .map(normalizeProperty)
      : [],
    tenants: Array.isArray(parsed.tenants)
      ? parsed.tenants
        .filter((tenant): tenant is LandlordTenant & { id: string } => Boolean(tenant?.id))
        .map(normalizeTenant)
      : [],
    bills: Array.isArray(parsed.bills) ? parsed.bills : [],
    payments: Array.isArray(parsed.payments) ? parsed.payments : [],
    activities: Array.isArray(parsed.activities) ? parsed.activities : [],
    notifications: Array.isArray(parsed.notifications)
      ? (parsed.notifications as NotificationRecord[]).map((item) =>
        item && typeof item.title === 'string'
          ? { ...item, kind: item.kind ?? inferNotificationKind(item.title, item.detail ?? '') }
          : item
      )
      : [],
    requests: Array.isArray(parsed.requests) ? parsed.requests : [],
    registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
    sharedExpenses: Array.isArray(parsed.sharedExpenses) ? parsed.sharedExpenses : [],
    statements: Array.isArray(parsed.statements) ? parsed.statements : [],
  };
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

let dataReady = false;

function getReadySnapshot(): boolean {
  return dataReady;
}

async function hydrateLandlordData(): Promise<void> {
  const raw = await storageGet(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<LandlordData>;
      if (parsed && Array.isArray(parsed.properties) && Array.isArray(parsed.bills)) {
        setState(normalizeData(parsed));
      }
    } catch {
      // Ignore a malformed cache and keep the seed records.
    }
  }
  dataReady = true;
  emit();
}

void hydrateLandlordData();

export function useLandlordData(): LandlordData {
  return useSyncExternalStore(subscribeLandlord, getSnapshot, getSnapshot);
}

/** Loading gate for screens that must wait for the on-device cache. */
export function useLandlordDataReady(): boolean {
  return useSyncExternalStore(subscribeLandlord, getReadySnapshot, getReadySnapshot);
}

/** Active tenants currently assigned to a room. */
export function activeOccupantsOf(data: LandlordData, roomId: string): LandlordTenant[] {
  return data.tenants.filter(
    (tenant) => tenant.roomId === roomId && tenant.status === 'Active'
  );
}

/** Canonical availability, falling back to the legacy two-state flag. */
export function roomAvailability(room: LandlordRoom): RoomAvailability {
  return room.availability ?? (room.status === 'Occupied' ? 'Occupied' : 'Available');
}


/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/** Thrown when a payment cannot be recorded or reversed as requested. */
export class PaymentRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentRecordError';
  }
}

/** Bills with an in-flight record/reverse call — blocks double submits. */
const busyBills = new Set<string>();

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface RecordPaymentInput {
  billId: string;
  /** Amount actually received (PHP). May be less than the bill — partial. */
  amount: number;
  /** ISO date (yyyy-mm-dd) the payment was actually received. */
  paidAt: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

/**
 * Record a payment received against a bill. Appends to the bill's payment
 * history, keeps `paidAt` in sync with the derived balance, and writes an
 * activity entry. Validates the amount against the outstanding balance and
 * rejects duplicate concurrent submissions for the same bill.
 */
export async function recordPayment(input: RecordPaymentInput): Promise<PaymentEntry> {
  const bill = state.bills.find((item) => item.id === input.billId);
  if (!bill) throw new PaymentRecordError('That bill no longer exists.');
  if (busyBills.has(bill.id)) {
    throw new PaymentRecordError('A payment for this bill is already being recorded.');
  }

  const amount = roundMoney(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaymentRecordError('Enter an amount greater than ₱0.');
  }

  const paidToDate = paidAmountOfBill(state, bill.id);
  const remaining = outstandingOfBill(bill, paidToDate);
  if (amount > remaining + 0.009) {
    throw new PaymentRecordError(
      `Amount exceeds the outstanding balance of ${formatPeso(remaining)}.`
    );
  }

  const paidDate = parseISODate(input.paidAt);
  if (!paidDate) throw new PaymentRecordError('Enter a valid payment date (YYYY-MM-DD).');
  if (startOfDay(paidDate).getTime() > startOfDay(new Date()).getTime()) {
    throw new PaymentRecordError('Payment date cannot be in the future.');
  }

  busyBills.add(bill.id);
  try {
    const reference = input.reference?.trim();
    const notes = input.notes?.trim();
    const entry: PaymentEntry = {
      id: Crypto.randomUUID(),
      billId: bill.id,
      tenantId: bill.tenantId,
      propertyId: bill.propertyId,
      roomId: bill.roomId,
      amount,
      paidAt: input.paidAt,
      method: input.method,
      reference: reference || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const tenant = state.tenants.find((item) => item.id === bill.tenantId);
    const property = state.properties.find((item) => item.id === bill.propertyId);
    const room = property?.rooms.find((item) => item.id === bill.roomId);
    const totalPaid = roundMoney(paidToDate + amount);
    const settled = totalPaid >= roundMoney(bill.amount) - 0.009;

    setState({
      ...state,
      payments: [entry, ...state.payments],
      bills: state.bills.map((item) =>
        item.id === bill.id ? { ...item, paidAt: settled ? input.paidAt : undefined } : item
      ),
      activities: [
        {
          id: Crypto.randomUUID(),
          kind: 'payment',
          title: 'Payment recorded',
          detail: [
            formatPeso(amount),
            `from ${tenant?.fullName ?? 'Tenant'}`,
            property?.name,
            room?.label,
            input.method,
          ]
            .filter(Boolean)
            .join(' · '),
          at: entry.createdAt,
          tenantId: bill.tenantId,
        },
        ...state.activities,
      ],
      notifications: notifyLandlord(
        {
          kind: 'payment',
          title: `Payment received · ${formatPeso(amount)}`,
          detail: [tenant?.fullName ?? 'Tenant', property?.name, room?.label, input.method]
            .filter(Boolean)
            .join(' · '),
          link: { kind: 'bill', billId: bill.id },
        },
        state.notifications,
        entry.createdAt
      ),
    });
    await persist();
    return entry;
  } finally {
    busyBills.delete(bill.id);
  }
}

/**
 * Reverse (void) a recorded payment entry. The bill balance re-opens and the
 * reversal is written to the activity history — callers must confirm with the
 * landlord first.
 */
export async function reversePayment(paymentId: string): Promise<void> {
  const entry = state.payments.find((item) => item.id === paymentId);
  if (!entry) throw new PaymentRecordError('That payment entry no longer exists.');
  if (busyBills.has(entry.billId)) {
    throw new PaymentRecordError('This bill is busy updating. Try again in a moment.');
  }

  const bill = state.bills.find((item) => item.id === entry.billId);
  const remainingPaid = roundMoney(paidAmountOfBill(state, entry.billId) - entry.amount);
  const tenant = state.tenants.find((item) => item.id === entry.tenantId);
  const property = state.properties.find((item) => item.id === entry.propertyId);
  const room = property?.rooms.find((item) => item.id === entry.roomId);

  busyBills.add(entry.billId);
  try {
    setState({
      ...state,
      payments: state.payments.filter((item) => item.id !== paymentId),
      bills: state.bills.map((item) =>
        item.id === entry.billId
          ? {
              ...item,
              paidAt:
                bill && remainingPaid >= roundMoney(bill.amount) - 0.009
                  ? item.paidAt
                  : undefined,
            }
          : item
      ),
      activities: [
        {
          id: Crypto.randomUUID(),
          kind: 'payment',
          title: 'Payment reversed',
          detail: [
            formatPeso(entry.amount),
            `for ${tenant?.fullName ?? 'Tenant'}`,
            property?.name,
            room?.label,
          ]
            .filter(Boolean)
            .join(' · '),
          at: new Date().toISOString(),
          tenantId: entry.tenantId,
        },
        ...state.activities,
      ],
      notifications: notifyLandlord(
        {
          kind: 'payment',
          title: `Payment reversed · ${formatPeso(entry.amount)}`,
          detail: [tenant?.fullName ?? 'Tenant', property?.name, room?.label]
            .filter(Boolean)
            .join(' · '),
          link: { kind: 'bill', billId: entry.billId },
        },
        state.notifications
      ),
    });
    await persist();
  } finally {
    busyBills.delete(entry.billId);
  }
}

/** Legacy shortcut: record the full outstanding balance as a cash payment. */
export async function markBillPaid(billId: string): Promise<void> {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) return;
  const remaining = outstandingOfBill(bill, paidAmountOfBill(state, billId));
  if (remaining <= 0) return;
  await recordPayment({
    billId,
    amount: remaining,
    paidAt: toISODate(new Date()),
    method: 'Cash',
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  if (state.notifications.every((item) => item.read)) return;
  setState({
    ...state,
    notifications: state.notifications.map((item) => ({ ...item, read: true })),
  });
  await persist();
}

/** Mark a single alert as read from the Notifications Center. */
export async function markNotificationRead(id: string): Promise<void> {
  const target = state.notifications.find((item) => item.id === id);
  if (!target || target.read) return;
  setState({
    ...state,
    notifications: state.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    ),
  });
  await persist();
}

export interface LandlordNoticeInput {
  kind: LandlordNotificationKind;
  title: string;
  detail: string;
  link?: LandlordNotificationLink;
}

/**
 * Prepend an alert to a notifications list inside a `setState` call. Gated by
 * the landlord's per-category preferences and de-duplicated (same kind, title
 * and detail already present) so repeated events never spam the Center.
 * Notifications are in-app only — nothing is pushed to a lock screen.
 */
export function notifyLandlord(
  input: LandlordNoticeInput,
  notifications: NotificationRecord[],
  at: string = new Date().toISOString()
): NotificationRecord[] {
  if (!isNotificationKindEnabled(input.kind)) return notifications;
  const duplicate = notifications.some(
    (item) => item.kind === input.kind && item.title === input.title && item.detail === input.detail
  );
  if (duplicate) return notifications;
  return [
    {
      id: Crypto.randomUUID(),
      kind: input.kind,
      link: input.link,
      title: input.title,
      detail: input.detail,
      at,
      read: false,
    },
    ...notifications,
  ];
}

/* -------------------------------------------------------------------------- */
/* Property mutations                                                         */
/* -------------------------------------------------------------------------- */

/** Thrown when a landlord attempts to touch a listing they do not own. */
export class PropertyNotAuthorizedError extends Error {
  constructor() {
    super('This property belongs to another landlord.');
    this.name = 'PropertyNotAuthorizedError';
  }
}

/** Editable property fields shared by the add/edit form and details screen. */
export interface PropertyFormInput {
  name: string;
  description: string;
  address: string;
  region: string;
  city: string;
  barangay: string;
  latitude: number;
  longitude: number;
  mapLocationSet: boolean;
  photos: string[];
  amenities: string[];
  houseRules: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export type PublishField = keyof PropertyFormInput;

/**
 * Essential fields that must be complete before a listing can be published.
 * Returns a map of field → validation message (empty when ready to publish).
 */
export function publishValidationErrors(property: {
  name: string;
  description: string;
  address: string;
  region: string;
  city: string;
  barangay: string;
  mapLocationSet: boolean;
  photos: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}): Partial<Record<PublishField, string>> {
  const errors: Partial<Record<PublishField, string>> = {};
  if (!property.name.trim()) errors.name = 'Property name is required.';
  if (property.description.trim().length < 10)
    errors.description = 'Add a short description (at least 10 characters).';
  if (!property.address.trim()) errors.address = 'Full address is required.';
  if (!property.region.trim()) errors.region = 'Region is required.';
  if (!property.city.trim()) errors.city = 'City or municipality is required.';
  if (!property.barangay.trim()) errors.barangay = 'Barangay is required.';
  if (!property.mapLocationSet)
    errors.mapLocationSet = 'Pin the property location on the map.';
  if (property.photos.length === 0)
    errors.photos = 'Add at least one property photo.';
  if (!property.contactName.trim()) errors.contactName = 'Contact name is required.';
  if (!property.contactPhone.trim()) errors.contactPhone = 'Contact number is required.';
  const email = property.contactEmail.trim();
  if (!email) errors.contactEmail = 'Contact email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.contactEmail = 'Enter a valid email address.';
  return errors;
}

/** True when every essential field for publishing is complete. */
export function isPublishReady(property: Parameters<typeof publishValidationErrors>[0]): boolean {
  return Object.keys(publishValidationErrors(property)).length === 0;
}

/**
 * A property is visible to a landlord when it has no owner (starter data) or
 * when the owning landlord matches the signed-in account.
 */
export function canViewProperty(
  property: Pick<LandlordProperty, 'landlordId'>,
  landlordId?: string
): boolean {
  if (!property.landlordId) return true;
  if (!landlordId) return true;
  return property.landlordId === landlordId;
}

function assertAuthorized(property: LandlordProperty, landlordId?: string): void {
  if (!canViewProperty(property, landlordId)) {
    throw new PropertyNotAuthorizedError();
  }
}

function withCover(photos: string[]): { photos: string[]; imageUri?: string } {
  return { photos, imageUri: photos[0] };
}

/** Create a property owned by the given landlord, optionally with starter rooms. */
export async function createProperty(
  input: PropertyFormInput,
  landlordId?: string,
  listingStatus: ListingStatus = 'Draft',
  initialRooms: RoomFormInput[] = []
): Promise<string> {
  const rooms: LandlordRoom[] = initialRooms.map((room) =>
    normalizeRoom({
      id: Crypto.randomUUID(),
      label: room.label.trim(),
      rent: room.rent,
      status: room.status ?? (room.availability === 'Occupied' ? 'Occupied' : 'Available'),
      availability: room.availability,
      roomType: room.roomType,
      maxCapacity: room.maxCapacity,
      description: room.description,
      furnishings: room.furnishings,
      photos: room.photos,
    })
  );
  const property: LandlordProperty = {
    id: Crypto.randomUUID(),
    landlordId,
    ...input,
    ...withCover(input.photos),
    listingStatus,
    rooms,
  };
  setState({ ...state, properties: [property, ...state.properties] });
  await persist();
  return property.id;
}

/** Patch an existing property; rooms and financial history are never touched. */
export async function updateProperty(
  propertyId: string,
  patch: Partial<PropertyFormInput>,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return;
  assertAuthorized(property, landlordId);

  const photos = patch.photos ?? property.photos;
  setState({
    ...state,
    properties: state.properties.map((item) =>
      item.id === propertyId
        ? { ...item, ...patch, ...withCover(photos) }
        : item
    ),
  });
  await persist();
}

/**
 * Change a listing's status. Archiving and deactivating only flip the status —
 * rooms, tenants and every bill stay attached so financial history survives.
 */
export async function setListingStatus(
  propertyId: string,
  status: ListingStatus,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.listingStatus === status) return;
  assertAuthorized(property, landlordId);
  setState({
    ...state,
    properties: state.properties.map((item) =>
      item.id === propertyId ? { ...item, listingStatus: status } : item
    ),
    notifications: notifyLandlord(
      {
        kind: 'listing',
        title: `Listing ${status.toLowerCase()}`,
        detail: property.name,
        link: { kind: 'property', propertyId },
      },
      state.notifications
    ),
  });
  await persist();
}

export async function addPropertyPhoto(
  propertyId: string,
  uri: string,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property || property.photos.includes(uri)) return;
  assertAuthorized(property, landlordId);
  await updateProperty(propertyId, { photos: [...property.photos, uri] }, landlordId);
}

export async function removePropertyPhoto(
  propertyId: string,
  uri: string,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return;
  assertAuthorized(property, landlordId);
  await updateProperty(
    propertyId,
    { photos: property.photos.filter((item) => item !== uri) },
    landlordId
  );
}

/* -------------------------------------------------------------------------- */
/* Room mutations                                                             */
/* -------------------------------------------------------------------------- */

/** Editable room fields used by the room management forms. */
export interface RoomFormInput {
  label: string;
  /** Monthly rent in PHP. */
  rent: number;
  /** Legacy two-state occupancy; mapped to availability when set. */
  status?: 'Occupied' | 'Available';
  availability?: RoomAvailability;
  roomType?: RoomType;
  maxCapacity?: number;
  description?: string;
  furnishings?: string[];
  photos?: string[];
}

/** Thrown when removing a room that still has tenant or billing records. */
export class RoomInUseError extends Error {
  constructor() {
    super(
      'This room still has tenant or billing records and cannot be removed. Financial history must be preserved.'
    );
    this.name = 'RoomInUseError';
  }
}

/** Thrown when a capacity value would orphan active occupants. */
export class RoomCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomCapacityError';
  }
}

/** Thrown when a room cannot legally be marked Available. */
export class RoomAvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomAvailabilityError';
  }
}

function resolveAvailability(
  input: { availability?: RoomAvailability; status?: 'Occupied' | 'Available' },
  fallback: RoomAvailability
): RoomAvailability {
  if (input.availability) return input.availability;
  if (input.status) return input.status === 'Occupied' ? 'Occupied' : 'Available';
  return fallback;
}

/** Add a room to a property; defaults to Available unless occupancy is set. */
export async function addRoom(
  propertyId: string,
  input: RoomFormInput,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return;
  assertAuthorized(property, landlordId);

  const availability = resolveAvailability(input, 'Available');
  const maxCapacity = Math.max(1, input.maxCapacity ?? 1);
  const room: LandlordRoom = {
    id: Crypto.randomUUID(),
    label: input.label.trim(),
    rent: input.rent,
    status: availability === 'Occupied' ? 'Occupied' : 'Available',
    availability,
    roomType: input.roomType ?? 'Private Room',
    maxCapacity,
    description: input.description ?? '',
    furnishings: input.furnishings ?? [],
    photos: input.photos ?? [],
  };
  setState({
    ...state,
    properties: state.properties.map((item) =>
      item.id === propertyId ? { ...item, rooms: [...item.rooms, room] } : item
    ),
  });
  await persist();
}

/**
 * Update a room's details and availability.
 *
 * Guards:
 * - Capacity can never drop below the number of active occupants.
 * - A room at full occupied capacity cannot be marked Available.
 */
export async function updateRoom(
  propertyId: string,
  roomId: string,
  patch: Partial<RoomFormInput>,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return;
  assertAuthorized(property, landlordId);

  const room = property.rooms.find((item) => item.id === roomId);
  if (!room) return;

  const occupants = state.tenants.filter(
    (tenant) => tenant.roomId === roomId && tenant.status === 'Active'
  ).length;
  const maxCapacity = patch.maxCapacity ?? room.maxCapacity ?? 1;

  if (patch.maxCapacity !== undefined) {
    if (patch.maxCapacity < 1) {
      throw new RoomCapacityError('Maximum capacity must be at least 1.');
    }
    if (patch.maxCapacity < occupants) {
      throw new RoomCapacityError(
        `Maximum capacity cannot be lower than the ${occupants} active occupant(s) in this room.`
      );
    }
  }

  const availability = resolveAvailability(patch, roomAvailability(room));
  if (availability === 'Available' && occupants > 0 && occupants >= maxCapacity) {
    throw new RoomAvailabilityError(
      'This room is fully occupied by active tenants. Resolve the tenancy before marking it Available.'
    );
  }
  const availabilityChanged = availability !== roomAvailability(room);

  setState({
    ...state,
    properties: state.properties.map((item) =>
      item.id === propertyId
        ? {
          ...item,
          rooms: item.rooms.map((existing) => {
            if (existing.id !== roomId) return existing;
            return {
              ...existing,
              label: patch.label?.trim() ?? existing.label,
              rent: patch.rent ?? existing.rent,
              availability,
              status: availability === 'Occupied' ? 'Occupied' : 'Available',
              roomType: patch.roomType ?? existing.roomType,
              maxCapacity,
              description: patch.description ?? existing.description,
              furnishings: patch.furnishings ?? existing.furnishings,
              photos: patch.photos ?? existing.photos,
            };
          }),
        }
        : item
    ),
    notifications: availabilityChanged
      ? notifyLandlord(
        {
          kind: 'availability',
          title: `Room availability · ${room.label}`,
          detail: [property.name, availability].join(' · '),
          link: { kind: 'room', roomId },
        },
        state.notifications
      )
      : state.notifications,
  });
  await persist();
}

/**
 * Remove a room that has no tenant attached and no bills pointing at it.
 * Rooms with financial history are protected so records are never orphaned.
 */
export async function removeRoom(
  propertyId: string,
  roomId: string,
  landlordId?: string
): Promise<void> {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) return;
  assertAuthorized(property, landlordId);

  const room = property.rooms.find((item) => item.id === roomId);
  if (!room) return;

  const hasTenantRecords =
    Boolean(room.tenantId) ||
    state.tenants.some((tenant) => tenant.roomId === roomId) ||
    state.bills.some((bill) => bill.roomId === roomId);
  if (hasTenantRecords) throw new RoomInUseError();

  setState({
    ...state,
    properties: state.properties.map((item) =>
      item.id === propertyId
        ? { ...item, rooms: item.rooms.filter((roomItem) => roomItem.id !== roomId) }
        : item
    ),
  });
  await persist();
}

/* -------------------------------------------------------------------------- */
/* Tenant / tenancy mutations                                                 */
/* -------------------------------------------------------------------------- */

/** Thrown when a tenancy record cannot be found. */
export class TenancyNotFoundError extends Error {
  constructor() {
    super('That tenancy record could not be found.');
    this.name = 'TenancyNotFoundError';
  }
}

/** Thrown when an action does not fit the tenant's current lifecycle state. */
export class TenancyStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenancyStateError';
  }
}

/** Thrown when a room has no capacity left for another occupant. */
export class RoomCapacityExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoomCapacityExceededError';
  }
}

/** Occupants + room holds that already claim capacity on a room. */
function claimedSlotsOf(data: LandlordData, roomId: string): number {
  return data.tenants.filter(
    (tenant) =>
      tenant.roomId === roomId &&
      (tenant.status === 'Active' || tenant.status === 'Reserved')
  ).length;
}

/**
 * Recompute a room's availability from its occupants and holds.
 * Active tenants win (Occupied), then reservations (Reserved), else Available.
 */
function withSyncedRoom(
  data: LandlordData,
  propertyId: string,
  roomId: string
): LandlordProperty[] {
  const active = data.tenants.filter(
    (tenant) => tenant.roomId === roomId && tenant.status === 'Active'
  );
  const reserved = data.tenants.filter(
    (tenant) => tenant.roomId === roomId && tenant.status === 'Reserved'
  );
  const availability: RoomAvailability =
    active.length > 0 ? 'Occupied' : reserved.length > 0 ? 'Reserved' : 'Available';
  const primaryTenantId = active[0]?.id ?? reserved[0]?.id;
  return data.properties.map((property) =>
    property.id === propertyId
      ? {
        ...property,
        rooms: property.rooms.map((room) =>
          room.id === roomId
            ? {
              ...room,
              availability,
              status: availability === 'Occupied' ? 'Occupied' : 'Available',
              tenantId: primaryTenantId,
            }
            : room
        ),
      }
      : property
  );
}

function tenantActivity(
  tenant: LandlordTenant,
  title: string,
  detail: string,
  kind: ActivityKind = 'tenant'
): ActivityRecord {
  return {
    id: Crypto.randomUUID(),
    kind,
    title,
    detail,
    at: new Date().toISOString(),
    tenantId: tenant.id,
  };
}

/** Find a tenant and assert the acting landlord may manage its property. */
function authorizedTenantOrThrow(tenantId: string, landlordId?: string): {
  tenant: LandlordTenant;
  property: LandlordProperty;
} {
  const tenant = state.tenants.find((item) => item.id === tenantId);
  if (!tenant) throw new TenancyNotFoundError();
  const property = state.properties.find((item) => item.id === tenant.propertyId);
  if (!property) throw new TenancyNotFoundError();
  assertAuthorized(property, landlordId);
  return { tenant, property };
}

export interface InquiryInput {
  fullName: string;
  email?: string;
  phone?: string;
  propertyId: string;
  /** Optional room the renter asked about; never occupies it. */
  roomId?: string;
  monthlyRent?: number;
  notes?: string;
}

/**
 * Log a prospective renter's inquiry. An inquiry is NOT a tenancy — it never
 * changes room availability and never creates bills.
 */
export async function createInquiry(
  input: InquiryInput,
  landlordId?: string
): Promise<string> {
  const property = state.properties.find((item) => item.id === input.propertyId);
  if (!property) throw new TenancyNotFoundError();
  assertAuthorized(property, landlordId);

  const room = input.roomId
    ? property.rooms.find((item) => item.id === input.roomId)
    : undefined;
  if (input.roomId && !room) throw new TenancyNotFoundError();

  const tenant: LandlordTenant = normalizeTenant({
    id: Crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    propertyId: property.id,
    roomId: room?.id,
    monthlyRent: input.monthlyRent ?? room?.rent ?? 0,
    notes: input.notes?.trim() || undefined,
    status: 'Inquiry',
  });

  setState({
    ...state,
    tenants: [tenant, ...state.tenants],
    activities: [
      tenantActivity(
        tenant,
        'New inquiry',
        [property.name, room?.label, tenant.fullName].filter(Boolean).join(' · '),
        'inquiry'
      ),
      ...state.activities,
    ],
    notifications: notifyLandlord(
      {
        kind: 'inquiry',
        title: `New inquiry from ${tenant.fullName}`,
        detail: [property.name, room?.label].filter(Boolean).join(' · '),
        link: { kind: 'tenant', tenantId: tenant.id },
      },
      state.notifications
    ),
  });
  await persist();
  return tenant.id;
}

export interface ApproveTenancyInput {
  roomId: string;
  monthlyRent?: number;
  /** Expected lease start (ISO). */
  leaseStart?: string;
  /** Expected lease end (ISO); omit for open-ended tenancies. */
  leaseEnd?: string;
  deposit?: number;
}

/**
 * Approve an inquiry or tenancy request by reserving a room.
 * The renter becomes a Reserved occupant — still not an active tenancy.
 */
export async function approveTenancy(
  tenantId: string,
  input: ApproveTenancyInput,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (tenant.status !== 'Inquiry' && tenant.status !== 'Requested') {
    throw new TenancyStateError(
      'Only inquiries and tenancy requests can be approved.'
    );
  }
  const room = property.rooms.find((item) => item.id === input.roomId);
  if (!room) throw new TenancyNotFoundError();

  const claimed = claimedSlotsOf(state, room.id);
  if (claimed >= (room.maxCapacity ?? 1)) {
    throw new RoomCapacityExceededError(
      `${room.label} is already full. Assign an available room instead.`
    );
  }

  const updated: LandlordTenant = {
    ...tenant,
    roomId: room.id,
    monthlyRent: input.monthlyRent ?? room.rent,
    leaseStart: input.leaseStart ?? tenant.leaseStart,
    leaseEnd: input.leaseEnd ?? tenant.leaseEnd,
    deposit: input.deposit ?? tenant.deposit,
    status: 'Reserved',
  };

  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    properties: withSyncedRoom(state, property.id, room.id),
    activities: [
      tenantActivity(
        updated,
        'Room reserved',
        [property.name, room.label, updated.fullName].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
    notifications: notifyLandlord(
      {
        kind: 'availability',
        title: `Room reserved · ${room.label}`,
        detail: [updated.fullName, property.name].filter(Boolean).join(' · '),
        link: { kind: 'room', roomId: room.id },
      },
      state.notifications
    ),
  });
  await persist();
}

/** Decline an inquiry or request; releases any held room and keeps the record. */
export async function declineTenancy(
  tenantId: string,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (
    tenant.status !== 'Inquiry' &&
    tenant.status !== 'Requested' &&
    tenant.status !== 'Reserved'
  ) {
    throw new TenancyStateError(
      'Only prospective renters and reservations can be declined.'
    );
  }

  const updated: LandlordTenant = { ...tenant, status: 'Declined' };
  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    properties: tenant.roomId
      ? withSyncedRoom(state, property.id, tenant.roomId)
      : state.properties,
    activities: [
      tenantActivity(
        updated,
        'Request declined',
        [updated.fullName, property.name].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

/** Release a reserved room back to inquiries/requests without deleting history. */
export async function cancelReservation(
  tenantId: string,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (tenant.status !== 'Reserved') {
    throw new TenancyStateError('Only reserved rooms can be released.');
  }

  const updated: LandlordTenant = { ...tenant, roomId: undefined, status: 'Requested' };
  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    properties: withSyncedRoom(state, property.id, tenant.roomId!),
    activities: [
      tenantActivity(
        updated,
        'Reservation released',
        [updated.fullName, property.name].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

export interface MoveInInput {
  /** ISO date move-in is recorded for; defaults to today. */
  moveInAt?: string;
  leaseStart?: string;
  leaseEnd?: string;
  monthlyRent?: number;
  deposit?: number;
}

/**
 * Record move-in for a Reserved occupant — the moment they become an Active
 * tenant. Occupies the room and generates the first rent bill.
 */
export async function moveInTenant(
  tenantId: string,
  input: MoveInInput = {},
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (tenant.status !== 'Reserved' || !tenant.roomId) {
    throw new TenancyStateError(
      'Only a reserved occupant with an assigned room can move in.'
    );
  }
  const room = property.rooms.find((item) => item.id === tenant.roomId);
  if (!room) throw new TenancyNotFoundError();

  const activeElsewhere = state.tenants.filter(
    (item) =>
      item.roomId === room.id &&
      item.id !== tenant.id &&
      item.status === 'Active'
  ).length;
  if (activeElsewhere >= (room.maxCapacity ?? 1)) {
    throw new RoomCapacityExceededError(
      `${room.label} is already full. Review the other occupants first.`
    );
  }

  const moveInAt = input.moveInAt ?? toISODate(new Date());
  const monthlyRent = input.monthlyRent ?? tenant.monthlyRent ?? room.rent;
  const updated: LandlordTenant = {
    ...tenant,
    monthlyRent,
    moveInAt,
    leaseStart: input.leaseStart ?? tenant.leaseStart ?? moveInAt,
    leaseEnd: input.leaseEnd ?? tenant.leaseEnd,
    deposit: input.deposit ?? tenant.deposit,
    status: 'Active',
  };

  const firstBill: RentBill = {
    id: Crypto.randomUUID(),
    tenantId: updated.id,
    propertyId: property.id,
    roomId: room.id,
    amount: monthlyRent,
    dueDate: moveInAt,
    period: periodFor(moveInAt),
  };

  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    properties: withSyncedRoom(state, property.id, room.id),
    bills: [firstBill, ...state.bills],
    activities: [
      tenantActivity(
        updated,
        'Move-in recorded',
        [updated.fullName, property.name, room.label].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

export interface TenancyUpdateInput {
  fullName?: string;
  email?: string;
  phone?: string;
  monthlyRent?: number;
  leaseStart?: string;
  leaseEnd?: string;
  deposit?: number;
  notes?: string;
}

/** Update tenancy information or contact details on a record. */
export async function updateTenancy(
  tenantId: string,
  patch: TenancyUpdateInput,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);

  const updated: LandlordTenant = {
    ...tenant,
    fullName: patch.fullName?.trim() || tenant.fullName,
    email: patch.email !== undefined ? patch.email.trim() || undefined : tenant.email,
    phone: patch.phone !== undefined ? patch.phone.trim() || undefined : tenant.phone,
    monthlyRent: patch.monthlyRent ?? tenant.monthlyRent,
    leaseStart: patch.leaseStart ?? tenant.leaseStart,
    leaseEnd: patch.leaseEnd ?? tenant.leaseEnd,
    deposit: patch.deposit ?? tenant.deposit,
    notes: patch.notes !== undefined ? patch.notes.trim() : tenant.notes,
  };

  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    activities: [
      tenantActivity(
        updated,
        'Tenancy updated',
        [updated.fullName, property.name].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

export interface MoveOutInput {
  /** ISO date; defaults to today. */
  moveOutAt?: string;
  reason?: string;
}

/**
 * Record move-out or termination. The tenant becomes Former and every payment
 * and billing record is preserved for history.
 */
export async function recordMoveOut(
  tenantId: string,
  input: MoveOutInput = {},
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (tenant.status !== 'Active' || !tenant.roomId) {
    throw new TenancyStateError('Only an active tenant can be moved out.');
  }

  const moveOutAt = input.moveOutAt ?? toISODate(new Date());
  const roomLabel = property.rooms.find((item) => item.id === tenant.roomId)?.label;
  const updated: LandlordTenant = {
    ...tenant,
    moveOutAt,
    notes: input.reason?.trim()
      ? [tenant.notes, `Move-out: ${input.reason.trim()}`].filter(Boolean).join('\n')
      : tenant.notes,
    status: 'Former',
  };

  setState({
    ...state,
    tenants: state.tenants.map((item) => (item.id === tenantId ? updated : item)),
    properties: withSyncedRoom(state, property.id, tenant.roomId),
    activities: [
      tenantActivity(
        updated,
        'Tenancy ended',
        [updated.fullName, property.name, roomLabel].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

/** Append a landlord message to a tenancy record. */
export async function sendTenantMessage(
  tenantId: string,
  body: string,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  const trimmed = body.trim();
  if (!trimmed) return;

  const message: TenantMessage = {
    id: Crypto.randomUUID(),
    from: 'landlord',
    body: trimmed,
    at: new Date().toISOString(),
  };
  setState({
    ...state,
    tenants: state.tenants.map((item) =>
      item.id === tenantId
        ? { ...item, messages: [...(item.messages ?? []), message] }
        : item
    ),
    activities: [
      tenantActivity(
        tenant,
        'Message sent',
        [tenant.fullName, property.name].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

/** Bill a reserved/active tenant their monthly rent (unpaid until recorded). */
export async function addRentBill(
  tenantId: string,
  dueDate: string,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (tenant.status !== 'Active' || !tenant.roomId) {
    throw new TenancyStateError('Rent bills can only be added for active tenants.');
  }
  const bill: RentBill = {
    id: Crypto.randomUUID(),
    tenantId: tenant.id,
    propertyId: property.id,
    roomId: tenant.roomId,
    amount: tenant.monthlyRent,
    dueDate,
    period: periodFor(dueDate),
  };
  setState({
    ...state,
    bills: [bill, ...state.bills],
    activities: [
      tenantActivity(tenant, 'Rent bill added', `${formatPeso(bill.amount)} · ${bill.period}`),
      ...state.activities,
    ],
  });
  await persist();
}

export interface SharedExpenseInput {
  amount: number;
  dueDate: string;
  /** What the shared cost covers, e.g. "Electricity share". */
  note: string;
}

/** Itemise a shared expense (utilities, repairs) on a tenant's bill history. */
export async function addSharedExpenseBill(
  tenantId: string,
  input: SharedExpenseInput,
  landlordId?: string
): Promise<void> {
  const { tenant, property } = authorizedTenantOrThrow(tenantId, landlordId);
  if (!tenant.roomId) {
    throw new TenancyStateError('Shared expenses need an assigned room.');
  }
  const bill: RentBill = {
    id: Crypto.randomUUID(),
    tenantId: tenant.id,
    propertyId: property.id,
    roomId: tenant.roomId,
    amount: input.amount,
    dueDate: input.dueDate,
    period: periodFor(input.dueDate),
    kind: 'expense',
    note: input.note.trim(),
  };
  setState({
    ...state,
    bills: [bill, ...state.bills],
    activities: [
      tenantActivity(
        tenant,
        'Shared expense billed',
        [input.note.trim(), formatPeso(input.amount)].filter(Boolean).join(' · ')
      ),
      ...state.activities,
    ],
  });
  await persist();
}

/** Sum of unpaid rent + shared expenses for a tenant. */
export function outstandingBalanceOf(data: LandlordData, tenantId: string): number {
  return data.bills
    .filter((bill) => bill.tenantId === tenantId && !bill.paidAt)
    .reduce((sum, bill) => sum + bill.amount, 0);
}

/** Earliest unpaid due date (ISO) for a tenant, if any. */
export function nextDueOf(data: LandlordData, tenantId: string): string | null {
  return (
    data.bills
      .filter((bill) => bill.tenantId === tenantId && !bill.paidAt)
      .map((bill) => bill.dueDate)
      .sort()[0] ?? null
  );
}

/** "AB" style initials for avatar fallbacks. */
export function tenantInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Tenant-scoped activity feed, newest first. */
export function tenantActivitiesOf(data: LandlordData, tenantId: string): ActivityRecord[] {
  return data.activities
    .filter((activity) => activity.tenantId === tenantId)
    .sort((a, b) => b.at.localeCompare(a.at));
}

/* -------------------------------------------------------------------------- */
/* Rental requests & registrations                                            */
/* -------------------------------------------------------------------------- */

export type RentalRequestErrorCode =
  | 'room-not-found'
  | 'room-unavailable'
  | 'unknown-property'
  | 'duplicate-request'
  | 'request-not-found'
  | 'request-decided';

export class RentalRequestError extends Error {
  readonly code: RentalRequestErrorCode;

  constructor(code: RentalRequestErrorCode, message: string) {
    super(message);
    this.name = 'RentalRequestError';
    this.code = code;
  }
}

function findListing(roomRefId: string) {
  return renterMockRooms.find((room) => room.id === roomRefId) ?? null;
}

function findLandlordRoom(propertyId: string, roomId: string) {
  const property = state.properties.find((item) => item.id === propertyId) ?? null;
  const room = property?.rooms.find((item) => item.id === roomId) ?? null;
  return { property, room };
}

function pendingRequestFor(renterId: string, roomRefId: string): RentalRequest | undefined {
  return state.requests.find(
    (item) =>
      item.renterId === renterId && item.roomRefId === roomRefId && item.status === 'Pending'
  );
}

function confirmedRegistrationFor(renterId: string, propertyId: string): Registration | undefined {
  return state.registrations.find(
    (item) =>
      item.renterId === renterId &&
      item.propertyId === propertyId &&
      item.status === 'Confirmed'
  );
}

/**
 * Files a rental request for a marketplace listing. The listing resolves the
 * owning property and room inside this landlord book, and the rent is
 * snapshotted from the landlord room — client-supplied ownership, price, and
 * availability are never trusted. Also opens a `Pending` registration so the
 * renter can follow the request; the registration only becomes `Confirmed`
 * through `decideRentalRequest`.
 */
export async function submitRentalRequest(input: {
  renterId: string;
  renterName: string;
  roomRefId: string;
}): Promise<RentalRequest> {
  const listing = findListing(input.roomRefId);
  if (!listing || !listing.available) {
    throw new RentalRequestError('room-not-found', 'This room is no longer listed.');
  }

  const { property, room } = findLandlordRoom(listing.propertyId, listing.landlordRoomId);
  if (!property || !room) {
    throw new RentalRequestError('unknown-property', 'This room is no longer listed.');
  }
  if (room.status !== 'Available') {
    throw new RentalRequestError(
      'room-unavailable',
      'This room was just taken. Please choose another room.'
    );
  }
  if (pendingRequestFor(input.renterId, listing.id)) {
    throw new RentalRequestError(
      'duplicate-request',
      'You already have a pending request for this room.'
    );
  }
  if (confirmedRegistrationFor(input.renterId, property.id)) {
    throw new RentalRequestError(
      'duplicate-request',
      'You are already registered at this property.'
    );
  }

  const now = new Date().toISOString();
  const request: RentalRequest = {
    id: Crypto.randomUUID(),
    renterId: input.renterId,
    renterName: input.renterName,
    roomRefId: listing.id,
    propertyId: property.id,
    roomId: room.id,
    monthlyRent: room.rent,
    status: 'Pending',
    createdAt: now,
  };
  const registration: Registration = {
    id: Crypto.randomUUID(),
    renterId: input.renterId,
    renterName: input.renterName,
    landlordId: listing.landlordId,
    propertyId: property.id,
    roomId: room.id,
    status: 'Pending',
    createdAt: now,
  };
  const activity: ActivityRecord = {
    id: Crypto.randomUUID(),
    kind: 'request',
    title: 'New rental request',
    detail: `${input.renterName} · ${property.name} · ${room.label} · ${formatPeso(room.rent)}/month`,
    at: now,
  };

  setState({
    ...state,
    requests: [request, ...state.requests],
    registrations: [registration, ...state.registrations],
    activities: [activity, ...state.activities],
    notifications: notifyLandlord(
      {
        kind: 'inquiry',
        title: 'New rental request',
        detail: `${input.renterName} requested ${property.name} · ${room.label}.`,
        link: { kind: 'property', propertyId: property.id },
      },
      state.notifications,
      now
    ),
  });
  await persist();
  void mirrorRentalRequest({
    renterId: request.renterId,
    requestId: request.id,
    roomId: request.roomRefId,
    roomTitle: listing.title,
    propertyName: property.name,
    monthlyRent: request.monthlyRent,
    status: 'Pending',
    submittedAt: toISODate(new Date(now)),
  });
  return request;
}

/**
 * Landlord decision on a pending request. Approving revalidates availability,
 * occupies the room, records the tenant, and confirms the registration (which
 * lights up the renter's Verified Renter badge). Declining closes the request
 * and its registration while preserving both for history.
 */
export async function decideRentalRequest(
  requestId: string,
  decision: 'approve' | 'decline'
): Promise<RentalRequest> {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) {
    throw new RentalRequestError('request-not-found', 'This request no longer exists.');
  }
  if (request.status !== 'Pending') {
    throw new RentalRequestError('request-decided', 'This request was already decided.');
  }

  const { property, room } = findLandlordRoom(request.propertyId, request.roomId);
  if (!property || !room) {
    throw new RentalRequestError('unknown-property', 'This room is no longer listed.');
  }

  const now = new Date().toISOString();

  if (decision === 'decline') {
    const declined: RentalRequest = { ...request, status: 'Declined', decidedAt: now };
    const activity: ActivityRecord = {
      id: Crypto.randomUUID(),
      kind: 'request',
      title: 'Rental request declined',
      detail: `${request.renterName} · ${property.name} · ${room.label}`,
      at: now,
    };
    setState({
      ...state,
      requests: state.requests.map((item) => (item.id === requestId ? declined : item)),
      registrations: state.registrations.map((item) =>
        item.renterId === request.renterId &&
          item.propertyId === request.propertyId &&
          item.status === 'Pending'
          ? { ...item, status: 'Declined' }
          : item
      ),
      activities: [activity, ...state.activities],
    });
    await persist();
    void mirrorRentalRequest({
      renterId: request.renterId,
      requestId: request.id,
      roomId: request.roomRefId,
      roomTitle: findListing(request.roomRefId)?.title ?? room.label,
      propertyName: property.name,
      monthlyRent: request.monthlyRent,
      status: 'Declined',
      submittedAt: toISODate(new Date(request.createdAt)),
      decidedAt: toISODate(new Date(now)),
    });
    pushNotification({
      category: 'rent',
      title: 'Request declined',
      description: `The landlord declined your request for ${property.name} · ${room.label}.`,
      statusLabel: 'Declined',
    });
    return declined;
  }

  if (room.status !== 'Available') {
    throw new RentalRequestError(
      'room-unavailable',
      'This room was just taken, so the request can no longer be approved.'
    );
  }

  const tenantId = Crypto.randomUUID();
  const approved: RentalRequest = { ...request, status: 'Approved', decidedAt: now };
  const activity: ActivityRecord = {
    id: Crypto.randomUUID(),
    kind: 'tenant',
    title: 'Tenant registered',
    detail: `${request.renterName} moved into ${property.name} · ${room.label}`,
    at: now,
  };

  setState({
    ...state,
    requests: state.requests.map((item) => (item.id === requestId ? approved : item)),
    registrations: state.registrations.map((item) =>
      item.renterId === request.renterId &&
        item.propertyId === request.propertyId &&
        item.status === 'Pending'
        ? { ...item, status: 'Confirmed', confirmedAt: now }
        : item
    ),
    properties: state.properties.map((item) =>
      item.id === property.id
        ? {
          ...item,
          rooms: item.rooms.map((candidate) =>
            candidate.id === room.id
              ? { ...candidate, status: 'Occupied', tenantId }
              : candidate
          ),
        }
        : item
    ),
    tenants: [
      ...state.tenants,
      {
        id: tenantId,
        fullName: request.renterName,
        propertyId: property.id,
        roomId: room.id,
        monthlyRent: room.rent,
        leaseStart: toISODate(new Date()),
        status: 'Active',
      },
    ],
    activities: [activity, ...state.activities],
    notifications: notifyLandlord(
      {
        kind: 'request',
        title: 'Registration confirmed',
        detail: `${request.renterName} · ${property.name} · ${room.label}.`,
        link: { kind: 'tenant', tenantId },
      },
      state.notifications,
      now
    ),
  });
  await persist();
  void mirrorRentalRequest({
    renterId: request.renterId,
    requestId: request.id,
    roomId: request.roomRefId,
    roomTitle: findListing(request.roomRefId)?.title ?? room.label,
    propertyName: property.name,
    monthlyRent: request.monthlyRent,
    status: 'Confirmed',
    submittedAt: toISODate(new Date(request.createdAt)),
    decidedAt: toISODate(new Date(now)),
  });
  pushNotification({
    category: 'rent',
    title: 'Request approved',
    description: `${property.name} · ${room.label} is confirmed for you — your registration is verified.`,
    statusLabel: 'Confirmed',
  });
  return approved;
}

/**
 * Renter-initiated withdrawal of their own pending request. Closes the book
 * request and its pending registration; the caller also cancels the mirrored
 * local record. Only the requesting renter may withdraw, and only while the
 * request is still pending.
 */
export async function withdrawRentalRequest(
  renterId: string,
  requestId: string
): Promise<void> {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request || request.renterId !== renterId) {
    throw new RentalRequestError('request-not-found', 'This request no longer exists.');
  }
  if (request.status !== 'Pending') {
    throw new RentalRequestError('request-decided', 'Only pending requests can be withdrawn.');
  }

  const { property, room } = findLandlordRoom(request.propertyId, request.roomId);
  const now = new Date().toISOString();
  const detail = [
    request.renterName,
    property?.name,
    room?.label,
  ]
    .filter(Boolean)
    .join(' · ');

  setState({
    ...state,
    requests: state.requests.filter((item) => item.id !== requestId),
    registrations: state.registrations.filter(
      (item) =>
        !(
          item.renterId === request.renterId &&
          item.propertyId === request.propertyId &&
          item.status === 'Pending'
        )
    ),
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'request',
        title: 'Rental request withdrawn',
        detail,
        at: now,
      },
      ...state.activities,
    ],
  });
  await persist();
}

export function useRentalRequests(): RentalRequest[] {
  return useLandlordData().requests;
}

export function useMyRentalRequests(renterId: string | null): RentalRequest[] {
  const { requests } = useLandlordData();
  return useMemo(
    () => (renterId ? requests.filter((item) => item.renterId === renterId) : []),
    [requests, renterId]
  );
}

export function useMyRegistrations(renterId: string | null): Registration[] {
  const { registrations } = useLandlordData();
  return useMemo(
    () => (renterId ? registrations.filter((item) => item.renterId === renterId) : []),
    [registrations, renterId]
  );
}

/**
 * Whether the renter holds a *confirmed* registration — the single source of
 * truth behind the Verified Renter badge. Scoped to one property when
 * `propertyId` is given so verification never leaks across landlords.
 */
export function isVerifiedRenter(
  registrations: Registration[],
  renterId: string | null,
  propertyId?: string
): boolean {
  if (!renterId) return false;
  return registrations.some(
    (item) =>
      item.renterId === renterId &&
      item.status === 'Confirmed' &&
      (propertyId ? item.propertyId === propertyId : true)
  );
}

export function useIsVerifiedRenter(renterId: string | null, propertyId?: string): boolean {
  const { registrations } = useLandlordData();
  return useMemo(
    () => isVerifiedRenter(registrations, renterId, propertyId),
    [registrations, renterId, propertyId]
  );
}

/** Renter-facing state of one marketplace listing. */
export type RoomRequestState = 'none' | 'pending' | 'approved' | 'declined';

export function roomRequestState(
  data: LandlordData,
  renterId: string | null,
  roomRefId: string
): RoomRequestState {
  if (!renterId) return 'none';
  const mine = data.requests.filter(
    (item) => item.renterId === renterId && item.roomRefId === roomRefId
  );
  if (mine.some((item) => item.status === 'Pending')) return 'pending';
  if (mine.some((item) => item.status === 'Approved')) return 'approved';
  if (mine.some((item) => item.status === 'Declined')) return 'declined';
  return 'none';
}

export function useRoomRequestState(
  renterId: string | null,
  roomRefId: string
): RoomRequestState {
  const data = useLandlordData();
  return useMemo(() => roomRequestState(data, renterId, roomRefId), [data, renterId, roomRefId]);
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
  /** Unpaid rent + shared expenses in PHP. */
  outstandingBalance: number;
  /** Earliest unpaid due date (ISO), if any. */
  nextDueDate: string | null;
  initials: string;
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
    const occupiedRooms = property.rooms.filter(
      (room) => roomAvailability(room) === 'Occupied'
    ).length;
    const availableRooms = property.rooms.filter(
      (room) => roomAvailability(room) === 'Available'
    ).length;
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
      availableRooms,
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

/* -------------------------------------------------------------------------- */
/* Rent & payment management selectors                                        */
/* -------------------------------------------------------------------------- */

/** Payments recorded against a bill, most recent first. */
export function paymentsOfBill(data: LandlordData, billId: string): PaymentEntry[] {
  return data.payments
    .filter((item) => item.billId === billId)
    .sort(
      (a, b) => b.paidAt.localeCompare(a.paidAt) || b.createdAt.localeCompare(a.createdAt)
    );
}

/** Total amount recorded against a bill. */
export function paidAmountOfBill(data: LandlordData, billId: string): number {
  return roundMoney(
    data.payments
      .filter((item) => item.billId === billId)
      .reduce((sum, item) => sum + item.amount, 0)
  );
}

/** Remaining balance on a bill given what has been paid. */
export function outstandingOfBill(bill: RentBill, paidAmount: number): number {
  return Math.max(0, roundMoney(bill.amount - paidAmount));
}

/**
 * Balance- and due-date-derived payment status. Never set by hand, so the
 * four states cannot drift out of sync with the money.
 */
export function paymentStatusOfBill(
  bill: RentBill,
  paidAmount: number,
  today: Date = new Date()
): PaymentStatus {
  if (outstandingOfBill(bill, paidAmount) <= 0) return 'Paid';
  const due = parseISODate(bill.dueDate);
  if (due && startOfDay(due).getTime() < startOfDay(today).getTime()) return 'Overdue';
  return paidAmount > 0 ? 'Partially Paid' : 'Unpaid';
}

/** One searchable payment-record row (derived from a bill + its payments). */
export interface PaymentRecordView {
  billId: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomLabel: string;
  /** Billing period label, e.g. "15 Oct – 14 Nov". */
  period: string;
  dueDate: string;
  kind: 'rent' | 'expense';
  note?: string;
  amountDue: number;
  amountPaid: number;
  remaining: number;
  status: PaymentStatus;
  /** Date of the most recent payment, if any. */
  paymentDate: string | null;
  /** Method of the most recent payment, if any. */
  method: PaymentMethod | null;
  reference: string | null;
  notes: string | null;
  paymentCount: number;
}

export type PaymentStatusFilter = 'All' | PaymentStatus;

export interface PaymentRecordQuery {
  propertyId?: string | null;
  period?: string | null;
  status?: PaymentStatusFilter;
  /** Free-text search across tenant, property, room, period, reference, notes. */
  query?: string;
}

/** Bill rows with derived money + status, filterable and searchable. */
export function toPaymentRecords(
  data: LandlordData,
  query: PaymentRecordQuery = {}
): PaymentRecordView[] {
  const today = new Date();
  const needle = query.query?.trim().toLowerCase();
  const rows = data.bills
    .filter((bill) => !query.propertyId || bill.propertyId === query.propertyId)
    .filter((bill) => !query.period || bill.period === query.period)
    .map((bill): PaymentRecordView => {
      const tenant = data.tenants.find((item) => item.id === bill.tenantId);
      const property = data.properties.find((item) => item.id === bill.propertyId);
      const room = property?.rooms.find((item) => item.id === bill.roomId);
      const payments = paymentsOfBill(data, bill.id);
      const latest = payments[0];
      const amountPaid = paidAmountOfBill(data, bill.id);
      return {
        billId: bill.id,
        tenantId: bill.tenantId,
        tenantName: tenant?.fullName ?? 'Tenant',
        propertyId: bill.propertyId,
        propertyName: property?.name ?? '',
        roomId: bill.roomId,
        roomLabel: room?.label ?? '',
        period: bill.period,
        dueDate: bill.dueDate,
        kind: bill.kind ?? 'rent',
        note: bill.note,
        amountDue: bill.amount,
        amountPaid,
        remaining: outstandingOfBill(bill, amountPaid),
        status: paymentStatusOfBill(bill, amountPaid, today),
        paymentDate: latest?.paidAt ?? null,
        method: latest?.method ?? null,
        reference: latest?.reference ?? null,
        notes: latest?.notes ?? null,
        paymentCount: payments.length,
      };
    })
    .filter((row) => !query.status || query.status === 'All' || row.status === query.status)
    .filter((row) => {
      if (!needle) return true;
      return [row.tenantName, row.propertyName, row.roomLabel, row.period, row.reference, row.notes]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle));
    });

  return rows.sort(
    (a, b) => b.dueDate.localeCompare(a.dueDate) || a.tenantName.localeCompare(b.tenantName)
  );
}

/** An unpaid, not-yet-overdue bill shown under "Upcoming due dates". */
export interface UpcomingDueView {
  billId: string;
  tenantName: string;
  propertyName: string;
  roomLabel: string;
  period: string;
  dueDate: string;
  amountDue: number;
  remaining: number;
  status: PaymentStatus;
}

/** A recorded payment with its tenant/property/room display names. */
export interface RecentPaymentView extends PaymentEntry {
  tenantName: string;
  propertyName: string;
  roomLabel: string;
}

/** Totals for the billing overview under a property + period selection. */
export interface BillingOverview {
  propertyId: string | null;
  period: string | null;
  /** Sum of bill amounts in the selection. */
  totalBilled: number;
  /** Sum of recorded payments in the selection. */
  totalReceived: number;
  /** Sum of remaining balances in the selection. */
  outstanding: number;
  /** Sum of remaining balances on past-due bills. */
  overdue: number;
  billCount: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  overdueCount: number;
  /** Unpaid, not-yet-overdue bills, soonest first (max 6). */
  upcoming: UpcomingDueView[];
  /** Latest recorded payments in the selection, newest first (max 5). */
  recentPayments: RecentPaymentView[];
}

export interface BillingFilter {
  propertyId?: string | null;
  period?: string | null;
}

export function summarizeBilling(data: LandlordData, filter: BillingFilter = {}): BillingOverview {
  const propertyId = filter.propertyId ?? null;
  const period = filter.period ?? null;
  const rows = toPaymentRecords(data, { propertyId, period });
  const billIds = new Set(rows.map((row) => row.billId));

  const totalBilled = roundMoney(rows.reduce((sum, row) => sum + row.amountDue, 0));
  const totalReceived = roundMoney(rows.reduce((sum, row) => sum + row.amountPaid, 0));
  const outstanding = roundMoney(rows.reduce((sum, row) => sum + row.remaining, 0));
  const overdue = roundMoney(
    rows
      .filter((row) => row.status === 'Overdue')
      .reduce((sum, row) => sum + row.remaining, 0)
  );

  const upcoming = rows
    .filter((row) => row.remaining > 0 && row.status !== 'Overdue')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)
    .map((row): UpcomingDueView => ({
      billId: row.billId,
      tenantName: row.tenantName,
      propertyName: row.propertyName,
      roomLabel: row.roomLabel,
      period: row.period,
      dueDate: row.dueDate,
      amountDue: row.amountDue,
      remaining: row.remaining,
      status: row.status,
    }));

  const recentPayments = data.payments
    .filter((payment) => billIds.has(payment.billId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((payment): RecentPaymentView => {
      const tenant = data.tenants.find((item) => item.id === payment.tenantId);
      const property = data.properties.find((item) => item.id === payment.propertyId);
      const room = property?.rooms.find((item) => item.id === payment.roomId);
      return {
        ...payment,
        tenantName: tenant?.fullName ?? 'Tenant',
        propertyName: property?.name ?? '',
        roomLabel: room?.label ?? '',
      };
    });

  return {
    propertyId,
    period,
    totalBilled,
    totalReceived,
    outstanding,
    overdue,
    billCount: rows.length,
    paidCount: rows.filter((row) => row.status === 'Paid').length,
    partialCount: rows.filter((row) => row.status === 'Partially Paid').length,
    unpaidCount: rows.filter((row) => row.status === 'Unpaid').length,
    overdueCount: rows.filter((row) => row.status === 'Overdue').length,
    upcoming,
    recentPayments,
  };
}

/** Distinct billing periods, most recent first (for the period selector). */
export function billingPeriods(data: LandlordData): string[] {
  const earliestByPeriod = new Map<string, string>();
  for (const bill of data.bills) {
    const seen = earliestByPeriod.get(bill.period);
    if (!seen || bill.dueDate < seen) earliestByPeriod.set(bill.period, bill.dueDate);
  }
  return [...earliestByPeriod.entries()]
    .sort((a, b) => b[1].localeCompare(a[1]))
    .map(([period]) => period);
}

export function toTenantViews(data: LandlordData): TenantView[] {
  const today = new Date();
  return data.tenants.map((tenant) => {
    const property = data.properties.find((item) => item.id === tenant.propertyId);
    const room = property?.rooms.find((item) => item.id === tenant.roomId);
    const openBills = data.bills.filter(
      (bill) => bill.tenantId === tenant.id && !bill.paidAt
    );
    const outstandingBalance = openBills.reduce((sum, bill) => sum + bill.amount, 0);
    const nextDueDate = openBills.map((bill) => bill.dueDate).sort()[0] ?? null;
    const initials = tenant.fullName
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return {
      ...tenant,
      propertyName: property?.name ?? '',
      roomLabel: room?.label ?? '',
      leaseStatus: leaseStatus(tenant, today),
      outstandingBalance,
      nextDueDate,
      initials,
    };
  });
}

export interface RequestView extends RentalRequest {
  propertyName: string;
  roomLabel: string;
}

/** Rental requests newest-first with their property/room display names. */
export function toRequestViews(data: LandlordData): RequestView[] {
  return [...data.requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((request) => {
      const property = data.properties.find((item) => item.id === request.propertyId);
      const room = property?.rooms.find((item) => item.id === request.roomId);
      return {
        ...request,
        propertyName: property?.name ?? '',
        roomLabel: room?.label ?? '',
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

/* -------------------------------------------------------------------------- */
/* Shared expenses, allocation & tenant billing statements                    */
/* -------------------------------------------------------------------------- */

export class BillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BillingError';
  }
}

function ownedPropertyOrThrow(propertyId: string, landlordId?: string): LandlordProperty {
  const property = state.properties.find((item) => item.id === propertyId);
  if (!property) throw new BillingError('That property no longer exists.');
  assertAuthorized(property, landlordId);
  return property;
}

/** Active tenants with an assigned room — the usual expense/billing audience. */
export function eligibleTenantsOf(data: LandlordData, propertyId: string): LandlordTenant[] {
  return data.tenants.filter(
    (tenant) =>
      tenant.propertyId === propertyId && tenant.status === 'Active' && tenant.roomId
  );
}

/** "1–31 Oct 2026" for same-month periods, "15 Sep – 14 Oct 2026" otherwise. */
export function formatPeriodLabel(start: string, end: string): string {
  const from = parseISODate(start);
  const to = parseISODate(end);
  if (!from || !to) return `${start} – ${end}`;
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `${from.getDate()}–${to.getDate()} ${MONTH_ABBRS[from.getMonth()]} ${from.getFullYear()}`;
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)} ${to.getFullYear()}`;
}

/** The current calendar month as a billing period. */
export function currentMonthPeriod(): { start: string; end: string } {
  const now = new Date();
  return {
    start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

/**
 * Largest-remainder split of an integer centavo amount across weighted shares,
 * so the pieces ALWAYS add back up to the total (no lost or double-peso).
 */
function allocateCentavos(totalCents: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const safeWeights = weightSum > 0 ? weights : weights.map(() => 1);
  const safeSum = weightSum > 0 ? weightSum : safeWeights.length;
  const raw = safeWeights.map((weight) => (totalCents * weight) / safeSum);
  const cents = raw.map((value) => Math.floor(value));
  let remainder = totalCents - cents.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  let cursor = 0;
  while (remainder > 0) {
    cents[order[cursor % order.length].index] += 1;
    cursor += 1;
    remainder -= 1;
  }
  return cents;
}

export interface AllocationInput {
  propertyId: string;
  tenantIds: string[];
  total: number;
  method: AllocationMethod;
  customAmounts?: Record<string, number>;
}

/**
 * Split `total` across the given tenants. Equal / by-room / by-occupancy use
 * integer-centavos math with largest-remainder rounding, so shares always add
 * up to the total (e.g. ₱800 ÷ 3 = ₱266.70 / ₱266.70 / ₱266.60). Custom uses
 * the typed amounts as-is; callers validate that they sum to the total.
 */
export function computeAllocation(
  data: LandlordData,
  input: AllocationInput
): ExpenseAllocation[] {
  const subjects = input.tenantIds
    .map((id) => data.tenants.find((tenant) => tenant.id === id))
    .filter((tenant): tenant is LandlordTenant => Boolean(tenant));
  if (subjects.length === 0) return [];

  if (input.method === 'custom') {
    return subjects.map((tenant) => ({
      tenantId: tenant.id,
      amount: roundMoney(Math.max(0, input.customAmounts?.[tenant.id] ?? 0)),
    }));
  }

  const roomCounts = new Map<string, number>();
  for (const tenant of subjects) {
    const key = tenant.roomId ?? tenant.id;
    roomCounts.set(key, (roomCounts.get(key) ?? 0) + 1);
  }

  const property = data.properties.find((item) => item.id === input.propertyId);
  const weights = subjects.map((tenant) => {
    if (input.method === 'byRoom') {
      const key = tenant.roomId ?? tenant.id;
      return 1 / (roomCounts.get(key) ?? 1);
    }
    if (input.method === 'byOccupancy') {
      const room = property?.rooms.find((item) => item.id === tenant.roomId);
      return Math.max(1, room?.maxCapacity ?? 1);
    }
    return 1;
  });

  const totalCents = Math.round(input.total * 100);
  const shares = allocateCentavos(totalCents, weights);
  return subjects.map((tenant, index) => ({
    tenantId: tenant.id,
    amount: shares[index] / 100,
  }));
}

export interface NewSharedExpenseInput {
  propertyId: string;
  category: ExpenseCategory;
  description?: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  billDate: string;
  dueDate: string;
  attachmentName?: string;
  attachmentUri?: string;
  allocationMethod: AllocationMethod;
  tenantIds: string[];
  customAmounts?: Record<string, number>;
  landlordId?: string;
}

function validateSharedExpenseInput(input: NewSharedExpenseInput): {
  property: LandlordProperty;
  amount: number;
  tenantIds: string[];
} {
  const property = ownedPropertyOrThrow(input.propertyId, input.landlordId);
  if (!EXPENSE_CATEGORIES.includes(input.category)) {
    throw new BillingError('Choose an expense category.');
  }
  const amount = roundMoney(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BillingError('Enter a total amount greater than ₱0.');
  }
  const periodStart = parseISODate(input.periodStart);
  const periodEnd = parseISODate(input.periodEnd);
  if (!periodStart) throw new BillingError('Enter a valid period start (YYYY-MM-DD).');
  if (!periodEnd) throw new BillingError('Enter a valid period end (YYYY-MM-DD).');
  if (periodStart.getTime() > periodEnd.getTime()) {
    throw new BillingError('The period start cannot be after the end.');
  }
  if (!parseISODate(input.billDate)) throw new BillingError('Enter a valid bill date (YYYY-MM-DD).');
  if (!parseISODate(input.dueDate)) throw new BillingError('Enter a valid due date (YYYY-MM-DD).');

  const eligible = new Set(eligibleTenantsOf(state, property.id).map((tenant) => tenant.id));
  const tenantIds = [...new Set(input.tenantIds)].filter((id) => eligible.has(id));
  if (tenantIds.length === 0) {
    throw new BillingError('Select at least one tenant with an occupied room.');
  }

  if (input.allocationMethod === 'custom') {
    const custom = input.customAmounts ?? {};
    let sum = 0;
    for (const id of tenantIds) {
      const value = Number(custom[id]);
      if (!Number.isFinite(value) || value < 0) {
        throw new BillingError('Custom amounts must be ₱0 or more.');
      }
      sum += value;
    }
    if (Math.abs(roundMoney(sum) - amount) > 0.009) {
      throw new BillingError(
        `Custom amounts must add up to ${formatPeso(amount)} — they currently total ${formatPeso(
          roundMoney(sum)
        )}.`
      );
    }
  }

  return { property, amount, tenantIds };
}

function buildAllocation(
  data: LandlordData,
  input: NewSharedExpenseInput,
  property: LandlordProperty,
  amount: number,
  tenantIds: string[]
): ExpenseAllocation[] {
  return computeAllocation(data, {
    propertyId: property.id,
    tenantIds,
    total: amount,
    method: input.allocationMethod,
    customAmounts: input.customAmounts,
  });
}

/** Record a confirmed shared expense with frozen per-tenant shares. */
export async function createSharedExpense(
  input: NewSharedExpenseInput
): Promise<SharedExpense> {
  const { property, amount, tenantIds } = validateSharedExpenseInput(input);
  const allocations = buildAllocation(state, input, property, amount, tenantIds);
  const expense: SharedExpense = {
    id: Crypto.randomUUID(),
    propertyId: property.id,
    category: input.category,
    description: input.description?.trim() || undefined,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    amount,
    billDate: input.billDate,
    dueDate: input.dueDate,
    attachmentName: input.attachmentName?.trim() || undefined,
    attachmentUri: input.attachmentUri,
    allocationMethod: input.allocationMethod,
    tenantIds,
    allocations,
    createdAt: new Date().toISOString(),
  };
  setState({
    ...state,
    sharedExpenses: [expense, ...state.sharedExpenses],
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Shared expense recorded',
        detail: [
          input.category,
          formatPeso(amount),
          property.name,
          `${tenantIds.length} tenants`,
        ].join(' · '),
        at: expense.createdAt,
      },
      ...state.activities,
    ],
    notifications: notifyLandlord(
      {
        kind: 'billing',
        title: `Shared expense · ${input.category}`,
        detail: [formatPeso(amount), property.name, `${tenantIds.length} tenants`].join(' · '),
        link: { kind: 'expense', expenseId: expense.id },
      },
      state.notifications,
      expense.createdAt
    ),
  });
  await persist();
  return expense;
}

/**
 * Update a shared expense. Allocations are recomputed; statements already
 * generated keep their frozen snapshot (corrections handle finalized bills).
 */
export async function updateSharedExpense(
  expenseId: string,
  input: NewSharedExpenseInput
): Promise<SharedExpense> {
  const existing = state.sharedExpenses.find((item) => item.id === expenseId);
  if (!existing) throw new BillingError('That shared expense no longer exists.');
  const { property, amount, tenantIds } = validateSharedExpenseInput(input);
  const allocations = buildAllocation(state, input, property, amount, tenantIds);
  const now = new Date().toISOString();
  const updated: SharedExpense = {
    ...existing,
    propertyId: property.id,
    category: input.category,
    description: input.description?.trim() || undefined,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    amount,
    billDate: input.billDate,
    dueDate: input.dueDate,
    attachmentName: input.attachmentName?.trim() || undefined,
    attachmentUri: input.attachmentUri,
    allocationMethod: input.allocationMethod,
    tenantIds,
    allocations,
  };
  setState({
    ...state,
    sharedExpenses: state.sharedExpenses.map((item) =>
      item.id === expenseId ? updated : item
    ),
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Shared expense updated',
        detail: [input.category, formatPeso(amount), property.name].join(' · '),
        at: now,
      },
      ...state.activities,
    ],
  });
  await persist();
  return updated;
}

/** Remove a shared expense. Statements generated from it keep their snapshot. */
export async function deleteSharedExpense(expenseId: string): Promise<void> {
  const existing = state.sharedExpenses.find((item) => item.id === expenseId);
  if (!existing) throw new BillingError('That shared expense no longer exists.');
  const now = new Date().toISOString();
  setState({
    ...state,
    sharedExpenses: state.sharedExpenses.filter((item) => item.id !== expenseId),
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Shared expense removed',
        detail: [existing.category, formatPeso(existing.amount)].join(' · '),
        at: now,
      },
      ...state.activities,
    ],
  });
  await persist();
}

/* ----------------------------- billing statements ------------------------ */

function overlapsPeriod(
  item: { periodStart: string; periodEnd: string },
  start: string,
  end: string
): boolean {
  return item.periodStart <= end && item.periodEnd >= start;
}

export function statementTotalDue(statement: TenantStatement): number {
  const charges =
    statement.lines.reduce((sum, line) => sum + line.amount, 0) + statement.previousBalance;
  const corrections = statement.corrections.reduce((sum, item) => sum + item.amount, 0);
  return roundMoney(charges + corrections);
}

export interface GenerateStatementsInput {
  propertyId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  landlordId?: string;
}

/**
 * Generate DRAFT statements for one property and billing period. Tenants who
 * already have a statement for the same period are skipped. Rent comes from an
 * existing bill in the period when one exists, otherwise it is estimated from
 * the tenant's monthly rent. Expenses contribute their frozen allocations.
 * Drafts never create RentBills — finalizing does.
 */
export async function generateStatements(
  input: GenerateStatementsInput
): Promise<number> {
  const property = ownedPropertyOrThrow(input.propertyId, input.landlordId);
  const periodStart = parseISODate(input.periodStart);
  const periodEnd = parseISODate(input.periodEnd);
  if (!periodStart) throw new BillingError('Enter a valid period start (YYYY-MM-DD).');
  if (!periodEnd) throw new BillingError('Enter a valid period end (YYYY-MM-DD).');
  if (periodStart.getTime() > periodEnd.getTime()) {
    throw new BillingError('The period start cannot be after the end.');
  }
  if (!parseISODate(input.dueDate)) {
    throw new BillingError('Enter a valid due date (YYYY-MM-DD).');
  }

  const covered = new Set(
    state.statements
      .filter(
        (statement) =>
          statement.propertyId === property.id &&
          statement.periodStart === input.periodStart &&
          statement.periodEnd === input.periodEnd
      )
      .map((statement) => statement.tenantId)
  );
  const subjects = eligibleTenantsOf(state, property.id).filter(
    (tenant) => !covered.has(tenant.id)
  );
  if (subjects.length === 0) return 0;

  const expenses = state.sharedExpenses.filter(
    (expense) =>
      expense.propertyId === property.id &&
      overlapsPeriod(expense, input.periodStart, input.periodEnd)
  );
  const now = new Date().toISOString();

  const created: TenantStatement[] = [];
  for (const tenant of subjects) {
    const lines: StatementLine[] = [];
    const rentBill = state.bills.find(
      (bill) =>
        bill.tenantId === tenant.id &&
        bill.kind !== 'expense' &&
        bill.dueDate >= input.periodStart &&
        bill.dueDate <= input.periodEnd
    );
    if (rentBill) {
      lines.push({
        id: Crypto.randomUUID(),
        kind: 'rent',
        label: 'Monthly rent',
        amount: rentBill.amount,
        billId: rentBill.id,
      });
    } else if (tenant.monthlyRent > 0) {
      lines.push({
        id: Crypto.randomUUID(),
        kind: 'rent',
        label: 'Monthly rent',
        amount: tenant.monthlyRent,
      });
    }
    for (const expense of expenses) {
      const allocation = expense.allocations.find(
        (item) => item.tenantId === tenant.id
      );
      if (!allocation || allocation.amount <= 0) continue;
      lines.push({
        id: Crypto.randomUUID(),
        kind: expense.category,
        label: `${expense.category} share`,
        amount: allocation.amount,
        expenseId: expense.id,
      });
    }
    const priorBills = state.bills.filter(
      (bill) => bill.tenantId === tenant.id && !bill.paidAt && bill.dueDate < input.periodStart
    );
    const previousBalance = roundMoney(
      priorBills.reduce((sum, bill) => sum + bill.amount, 0)
    );
    if (lines.length === 0 && previousBalance <= 0) continue;

    created.push({
      id: Crypto.randomUUID(),
      propertyId: property.id,
      tenantId: tenant.id,
      roomId: tenant.roomId ?? '',
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      dueDate: input.dueDate,
      status: 'draft',
      lines,
      previousBalance,
      previousBalanceBillIds: priorBills.map((bill) => bill.id),
      corrections: [],
      createdAt: now,
    });
  }
  if (created.length === 0) return 0;

  setState({
    ...state,
    statements: [...created, ...state.statements],
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Draft bills generated',
        detail: [
          `${created.length} tenants`,
          property.name,
          formatPeriodLabel(input.periodStart, input.periodEnd),
        ].join(' · '),
        at: now,
      },
      ...state.activities,
    ],
    notifications: notifyLandlord(
      {
        kind: 'billing',
        title: 'Draft bills generated',
        detail: [
          `${created.length} tenants`,
          property.name,
          formatPeriodLabel(input.periodStart, input.periodEnd),
        ].join(' · '),
        link: { kind: 'statements' },
      },
      state.notifications,
      now
    ),
  });
  await persist();
  return created.length;
}

/**
 * Finalize a draft: freeze its calculation, post each line as a real RentBill,
 * and notify the landlord. Finalized amounts never change silently afterwards.
 */
export async function finalizeStatement(statementId: string): Promise<TenantStatement> {
  const statement = state.statements.find((item) => item.id === statementId);
  if (!statement) throw new BillingError('That bill no longer exists.');
  if (statement.status === 'finalized') {
    throw new BillingError('That bill is already finalized.');
  }

  const now = new Date().toISOString();
  const periodLabel = formatPeriodLabel(statement.periodStart, statement.periodEnd);
  const createdBills: RentBill[] = [];
  const lines = statement.lines.map((line): StatementLine => {
    if (line.billId) return line;
    const bill: RentBill = {
      id: Crypto.randomUUID(),
      tenantId: statement.tenantId,
      propertyId: statement.propertyId,
      roomId: statement.roomId,
      amount: line.amount,
      dueDate: statement.dueDate,
      period: periodLabel,
      kind: line.kind === 'rent' ? 'rent' : 'expense',
      note: line.kind === 'rent' ? undefined : line.label,
    };
    createdBills.push(bill);
    return { ...line, billId: bill.id };
  });

  const tenant = state.tenants.find((item) => item.id === statement.tenantId);
  const property = state.properties.find((item) => item.id === statement.propertyId);
  const totalDue = statementTotalDue({ ...statement, lines });

  const finalized: TenantStatement = {
    ...statement,
    lines,
    status: 'finalized',
    finalizedAt: now,
  };

  setState({
    ...state,
    statements: state.statements.map((item) =>
      item.id === statementId ? finalized : item
    ),
    bills: [...createdBills, ...state.bills],
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Statement finalized',
        detail: [
          tenant?.fullName ?? 'Tenant',
          formatPeso(totalDue),
          property?.name ?? '',
          periodLabel,
        ]
          .filter(Boolean)
          .join(' · '),
        at: now,
        tenantId: statement.tenantId,
      },
      ...state.activities,
    ],
    notifications: notifyLandlord(
      {
        kind: 'billing',
        title: 'Statement finalized',
        detail: `${tenant?.fullName ?? 'Tenant'} · ${formatPeso(totalDue)} due ${formatShortDate(
          statement.dueDate
        )}.`,
        link: { kind: 'statement', statementId },
      },
      state.notifications,
      now
    ),
  });
  await persist();
  return finalized;
}

/** Drop a draft statement. Finalized statements must be corrected, not removed. */
export async function discardStatement(statementId: string): Promise<void> {
  const statement = state.statements.find((item) => item.id === statementId);
  if (!statement) throw new BillingError('That bill no longer exists.');
  if (statement.status === 'finalized') {
    throw new BillingError('Finalized bills cannot be discarded — add a correction instead.');
  }
  setState({
    ...state,
    statements: state.statements.filter((item) => item.id !== statementId),
  });
  await persist();
}

export interface StatementCorrectionInput {
  label: string;
  amount: number;
  reason: string;
}

/**
 * Apply a signed correction to a FINALIZED statement. Positive amounts charge
 * the tenant more; negative amounts credit them. The change is recorded as a
 * visible, auditable row — never a silent recalculation.
 */
export async function addStatementCorrection(
  statementId: string,
  input: StatementCorrectionInput
): Promise<TenantStatement> {
  const statement = state.statements.find((item) => item.id === statementId);
  if (!statement) throw new BillingError('That bill no longer exists.');
  if (statement.status !== 'finalized') {
    throw new BillingError('Only finalized bills can be corrected.');
  }
  const label = input.label.trim();
  const reason = input.reason.trim();
  const amount = roundMoney(input.amount);
  if (!label) throw new BillingError('Enter a short label for the correction.');
  if (!Number.isFinite(amount) || amount === 0) {
    throw new BillingError('Enter a correction amount other than ₱0.');
  }
  if (!reason) throw new BillingError('Enter a reason for the correction.');

  const correction: StatementCorrection = {
    id: Crypto.randomUUID(),
    label,
    amount,
    reason,
    at: new Date().toISOString(),
  };
  const updated: TenantStatement = {
    ...statement,
    corrections: [...statement.corrections, correction],
  };
  setState({
    ...state,
    statements: state.statements.map((item) =>
      item.id === statementId ? updated : item
    ),
    activities: [
      {
        id: Crypto.randomUUID(),
        kind: 'payment',
        title: 'Statement corrected',
        detail: [label, formatPeso(amount), reason].join(' · '),
        at: correction.at,
        tenantId: statement.tenantId,
      },
      ...state.activities,
    ],
  });
  await persist();
  return updated;
}

/* --------------------------------- selectors ----------------------------- */

/** Distinct expense + statement periods for a property, newest first. */
export function expensePeriods(
  data: LandlordData,
  propertyId?: string | null
): ExpensePeriod[] {
  const seen = new Map<string, ExpensePeriod>();
  const add = (start: string, end: string): void => {
    const key = `${start}::${end}`;
    if (!seen.has(key)) {
      seen.set(key, {
        start,
        end,
        label: formatPeriodLabel(start, end),
      });
    }
  };
  for (const expense of data.sharedExpenses) {
    if (propertyId && expense.propertyId !== propertyId) continue;
    add(expense.periodStart, expense.periodEnd);
  }
  for (const statement of data.statements) {
    if (propertyId && statement.propertyId !== propertyId) continue;
    add(statement.periodStart, statement.periodEnd);
  }
  return [...seen.values()].sort((a, b) => b.start.localeCompare(a.start));
}

export interface ExpensePeriod {
  start: string;
  end: string;
  label: string;
}

export type BillingStatusTone = 'none' | 'draft' | 'finalized' | 'mixed';

export interface ExpenseDashboardSummary {
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  electricity: number;
  water: number;
  other: number;
  total: number;
  expenseCount: number;
  tenantCount: number;
  draftCount: number;
  finalizedCount: number;
  statusLabel: string;
  statusTone: BillingStatusTone;
}

export interface ExpenseFilter {
  propertyId?: string | null;
  periodStart: string;
  periodEnd: string;
}

/** Totals + billing status for the expense dashboard's selected period. */
export function summarizeExpenses(
  data: LandlordData,
  filter: ExpenseFilter
): ExpenseDashboardSummary {
  const expenses = data.sharedExpenses.filter(
    (expense) =>
      (!filter.propertyId || expense.propertyId === filter.propertyId) &&
      overlapsPeriod(expense, filter.periodStart, filter.periodEnd)
  );
  const sumCategories = (categories: ExpenseCategory[]): number =>
    expenses
      .filter((expense) => categories.includes(expense.category))
      .reduce((sum, expense) => sum + expense.amount, 0);

  const electricity = sumCategories(['Electricity']);
  const water = sumCategories(['Water']);
  const total = roundMoney(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const other = roundMoney(total - electricity - water);

  const propertyIds = filter.propertyId
    ? [filter.propertyId]
    : data.properties.map((property) => property.id);
  const tenantCount = data.tenants.filter(
    (tenant) =>
      propertyIds.includes(tenant.propertyId) &&
      tenant.status === 'Active' &&
      tenant.roomId
  ).length;

  const statements = data.statements.filter(
    (statement) =>
      (!filter.propertyId || statement.propertyId === filter.propertyId) &&
      statement.periodStart === filter.periodStart &&
      statement.periodEnd === filter.periodEnd
  );
  const draftCount = statements.filter((item) => item.status === 'draft').length;
  const finalizedCount = statements.filter((item) => item.status === 'finalized').length;

  let statusLabel: string;
  let statusTone: BillingStatusTone;
  if (statements.length === 0) {
    statusLabel = expenses.length > 0 ? 'Not billed yet' : 'No expenses';
    statusTone = 'none';
  } else if (draftCount > 0 && finalizedCount > 0) {
    statusLabel = `${finalizedCount} finalized · ${draftCount} estimated`;
    statusTone = 'mixed';
  } else if (draftCount > 0) {
    statusLabel =
      draftCount === 1 ? '1 draft bill (estimated)' : `${draftCount} draft bills (estimated)`;
    statusTone = 'draft';
  } else {
    statusLabel =
      finalizedCount === 1 ? 'Statement finalized' : 'All statements finalized';
    statusTone = 'finalized';
  }

  return {
    periodStart: filter.periodStart,
    periodEnd: filter.periodEnd,
    periodLabel: formatPeriodLabel(filter.periodStart, filter.periodEnd),
    electricity: roundMoney(electricity),
    water: roundMoney(water),
    other,
    total,
    expenseCount: expenses.length,
    tenantCount,
    draftCount,
    finalizedCount,
    statusLabel,
    statusTone,
  };
}

export interface ExpenseView extends SharedExpense {
  propertyName: string;
  tenantCount: number;
  periodLabel: string;
}

export interface ExpenseFilterInput {
  propertyId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export function toExpenseViews(
  data: LandlordData,
  filter: ExpenseFilterInput = {}
): ExpenseView[] {
  return data.sharedExpenses
    .filter(
      (expense) =>
        (!filter.propertyId || expense.propertyId === filter.propertyId) &&
        (!filter.periodStart || !filter.periodEnd ||
          overlapsPeriod(expense, filter.periodStart, filter.periodEnd))
    )
    .map((expense) => ({
      ...expense,
      propertyName:
        data.properties.find((property) => property.id === expense.propertyId)?.name ??
        'Property',
      tenantCount: expense.allocations.length,
      periodLabel: formatPeriodLabel(expense.periodStart, expense.periodEnd),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface ExpenseAllocationRow {
  tenantId: string;
  tenantName: string;
  roomLabel: string;
  amount: number;
}

/** Allocation rows with tenant + room names resolved for display. */
export function expenseAllocationRows(
  data: LandlordData,
  expense: Pick<SharedExpense, 'propertyId' | 'allocations'>
): ExpenseAllocationRow[] {
  const property = data.properties.find((item) => item.id === expense.propertyId);
  return expense.allocations.map((allocation) => {
    const tenant = data.tenants.find((item) => item.id === allocation.tenantId);
    const room = property?.rooms.find((item) => item.id === tenant?.roomId);
    return {
      tenantId: allocation.tenantId,
      tenantName: tenant?.fullName ?? 'Tenant',
      roomLabel: room?.label ?? '',
      amount: allocation.amount,
    };
  });
}

export interface StatementView extends TenantStatement {
  tenantName: string;
  propertyName: string;
  roomLabel: string;
  rentAmount: number;
  electricityAmount: number;
  waterAmount: number;
  otherAmount: number;
  /** Rent + allocations + carried balance. */
  chargesTotal: number;
  correctionsTotal: number;
  totalDue: number;
  /** Payments recorded against this statement's linked bills. */
  paymentsApplied: number;
  remaining: number;
}

function toStatementView(data: LandlordData, statement: TenantStatement): StatementView {
  const tenant = data.tenants.find((item) => item.id === statement.tenantId);
  const property = data.properties.find((item) => item.id === statement.propertyId);
  const room = property?.rooms.find((item) => item.id === statement.roomId);

  let rentAmount = 0;
  let electricityAmount = 0;
  let waterAmount = 0;
  let otherAmount = 0;
  for (const line of statement.lines) {
    if (line.kind === 'rent') rentAmount += line.amount;
    else if (line.kind === 'Electricity') electricityAmount += line.amount;
    else if (line.kind === 'Water') waterAmount += line.amount;
    else otherAmount += line.amount;
  }

  const chargesTotal = roundMoney(
    statement.lines.reduce((sum, line) => sum + line.amount, 0) + statement.previousBalance
  );
  const correctionsTotal = roundMoney(
    statement.corrections.reduce((sum, item) => sum + item.amount, 0)
  );
  const totalDue = roundMoney(chargesTotal + correctionsTotal);

  const billIds = new Set(
    [...statement.lines.map((line) => line.billId), ...statement.previousBalanceBillIds].filter(
      (id): id is string => Boolean(id)
    )
  );
  const paymentsApplied = roundMoney(
    data.payments
      .filter((payment) => billIds.has(payment.billId))
      .reduce((sum, payment) => sum + payment.amount, 0)
  );

  return {
    ...statement,
    tenantName: tenant?.fullName ?? 'Tenant',
    propertyName: property?.name ?? 'Property',
    roomLabel: room?.label ?? '',
    rentAmount: roundMoney(rentAmount),
    electricityAmount: roundMoney(electricityAmount),
    waterAmount: roundMoney(waterAmount),
    otherAmount: roundMoney(otherAmount),
    chargesTotal,
    correctionsTotal,
    totalDue,
    paymentsApplied,
    remaining: Math.max(0, roundMoney(totalDue - paymentsApplied)),
  };
}

export interface StatementFilter {
  propertyId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

/** Matching statements as display views; drafts sort before finalized, then by name. */
export function toStatementViews(
  data: LandlordData,
  filter: StatementFilter = {}
): StatementView[] {
  return data.statements
    .filter(
      (statement) =>
        (!filter.propertyId || statement.propertyId === filter.propertyId) &&
        (!filter.periodStart || statement.periodStart === filter.periodStart) &&
        (!filter.periodEnd || statement.periodEnd === filter.periodEnd)
    )
    .map((statement) => toStatementView(data, statement))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'draft' ? -1 : 1;
      return a.tenantName.localeCompare(b.tenantName);
    });
}

/** One statement as a display view (for the detail screen). */
export function statementViewOf(data: LandlordData, statementId: string): StatementView | null {
  const statement = data.statements.find((item) => item.id === statementId);
  return statement ? toStatementView(data, statement) : null;
}

/** One shared expense as a display view (for the detail screen). */
export function expenseViewOf(data: LandlordData, expenseId: string): ExpenseView | null {
  const expense = data.sharedExpenses.find((item) => item.id === expenseId);
  if (!expense) return null;
  return {
    ...expense,
    propertyName:
      data.properties.find((property) => property.id === expense.propertyId)?.name ?? 'Property',
    tenantCount: expense.allocations.length,
    periodLabel: formatPeriodLabel(expense.periodStart, expense.periodEnd),
  };
}
