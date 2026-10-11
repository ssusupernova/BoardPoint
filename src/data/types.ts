/**
 * BoardPoint domain types shared by mock data and, later, the real API layer.
 */

export type RoomPrivacy = 'Private' | 'Shared';

export interface RenterRoom {
  id: string;
  title: string;
  area: string;
  roomType: 'Private room' | 'Shared room';
  /** Monthly rent in PHP. */
  price: number;
  distanceKm: number;
  /** 0-100 match against the renter's checklist. */
  matchPercent: number;
  /** Short unit label, e.g. "Room 5". */
  roomLabel?: string;
  privacy?: RoomPrivacy;
  /** Occupancy summary, e.g. "1 person". */
  occupancy?: string;
  /** Small highlight pills, e.g. ["Wi-Fi", "Private bathroom"]. */
  featureBadges?: string[];
  /** Dot-separated amenity line, e.g. ["Furnished", "Laundry", "Non-smoking"]. */
  amenities?: string[];
  /** Availability pill text, e.g. "Available by 15 Oct". */
  availabilityLabel?: string;
  /** Landmark the distance is measured from, e.g. "Sta. Cruz". */
  distanceFromLabel?: string;
  /** Optional photo; a token-based placeholder renders when omitted. */
  imageUri?: string;
  /** Whether the renter has bookmarked this room. */
  isFavorite?: boolean;
}

export interface LandlordListing {
  id: string;
  propertyName: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  /** Monthly rent per unit in PHP. */
  monthlyRent: number;
  status: 'Pending verification' | 'Listed' | 'Rented';
}

/** Shared status vocabulary for tenancy, payments, reminders and tickets. */
export type TenantStatus = 'Active' | 'Unpaid' | 'Scheduled' | 'Completed';

export interface Tenancy {
  id: string;
  propertyName: string;
  unitLabel: string;
  address: string;
  /** Monthly rent in PHP. */
  monthlyRent: number;
  leaseStartedAt: string;
  leaseEndsAt: string;
  status: 'Active';
  /** Security deposit held, in PHP. */
  depositHeld?: number;
  /** Day of the month rent is due, e.g. 20 -> "20th of each month". */
  rentDueDay?: number;
}

export interface PaymentOverview {
  period: string;
  amountDue: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Due soon';
}

export interface PaymentRecord {
  id: string;
  period: string;
  amount: number;
  paidAt: string;
  method: string;
  status: 'Paid';
}

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  date: string;
  status: TenantStatus;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  detail: string;
  /** Issue area the renter picked, e.g. "Plumbing". */
  category?: string;
  updatedAt: string;
  status: TenantStatus;
  /** Optional photo attached to the report (local file/blob URI). */
  photoUri?: string;
}

/* --------------------------------------------------------------- profile */

export interface RenterProfile {
  fullName: string;
  email: string;
  mobile: string;
  emergencyContact: string;
  memberSince: string;
}

/* --------------------------------------------------------- notifications */

export type NotificationCategory = 'bills' | 'maintenance' | 'rent';

export type NotificationAction =
  | { kind: 'maintenance' }
  | { kind: 'bills' }
  | { kind: 'receipt'; receiptId: string };

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  /** Grouping bucket in the timeline. */
  day: 'today' | 'earlier';
  /** Display timestamp, e.g. "11 Oct · 8:30 AM". */
  timestampLabel: string;
  title: string;
  description: string;
  /** Optional status pill text, e.g. "Scheduled". */
  statusLabel?: string;
  /** Optional contextual action shown on the card. */
  actionLabel?: string;
  action?: NotificationAction;
  read: boolean;
}

/* ------------------------------------------------------------- payments */

export interface BillLine {
  id: string;
  label: string;
  amount: number;
  /** Supporting line, e.g. "October · Due 20 Oct 2026". */
  meta: string;
}

export interface CurrentBill {
  /** Period heading, e.g. "October 2026 bills". */
  periodLabel: string;
  total: number;
  status: PaymentOverview['status'];
  /** Supporting line under the total. */
  note: string;
  /** Next due line, e.g. "Next due: 15 Oct 2026 · Utilities". */
  nextDueLabel: string;
}

export interface PaymentTransaction {
  id: string;
  period: string;
  amount: number;
  /** Breakdown line, e.g. "Rent ₱4,500 + utilities ₱800". */
  breakdown: string;
  /** Display timestamp, e.g. "20 Sep 2026 · 10:42 AM". */
  timestampLabel: string;
  /** Reference line, e.g. "GCash · Ref: 2P0B6D20-1842". */
  reference: string;
  method: string;
  status: 'Paid';
}

export interface PaymentMethod {
  id: string;
  provider: string;
  /** Account label, e.g. "Magellan Ferdinand · •••• 2810". */
  accountLabel: string;
  /** Ionicons name for the provider mark. */
  icon: string;
}
