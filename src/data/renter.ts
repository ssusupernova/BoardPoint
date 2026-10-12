import type {
  AppNotification,
  BillLine,
  CurrentBill,
  MaintenanceTicket,
  PaymentMethod,
  PaymentOverview,
  PaymentRecord,
  PaymentTransaction,
  Reminder,
  RenterProfile,
  RenterRoom,
  Tenancy,
} from './types';

/**
 * Marketplace categories shown as horizontal carousels on the Recommended
 * Rooms page. Kept in the renter data layer so the shared domain types stay
 * untouched.
 */
export type RoomCategory = 'Village House' | 'Condo' | 'Apartment' | 'Boarding House';

/** Display order of the category carousels. */
export const ROOM_CATEGORY_ORDER: RoomCategory[] = [
  'Village House',
  'Condo',
  'Apartment',
  'Boarding House',
];

/**
 * A browsable room plus its marketplace category. Extends the shared
 * `RenterRoom` shape so existing consumers keep working.
 */
export interface RenterListing extends RenterRoom {
  category: RoomCategory;
  /** Property/complex the room belongs to (shown on requests + listings). */
  propertyName: string;
  /** Promoted listing: renders a gold outline and a SPECIAL badge. */
  featured?: boolean;
}

/**
 * Rooms the renter can browse. The `isFavorite` flag seeds the favorites store;
 * the first two are the renter's saved shortlist.
 */
export const renterMockRooms: RenterListing[] = [
  {
    id: 'room-city-garden',
    title: 'City Garden Rooms',
    propertyName: 'City Garden Residences',
    area: 'Sta. Cruz, Dapitan City',
    roomType: 'Private room',
    price: 5200,
    distanceKm: 1.2,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 96,
    roomLabel: 'Room 5',
    privacy: 'Private',
    occupancy: '1 person',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'Laundry', 'Non-smoking'],
    availabilityLabel: 'Available by 15 Oct',
    isFavorite: true,
    category: 'Boarding House',
    featured: true,
  },
  {
    id: 'room-north-haven',
    title: 'North Haven Boarding House',
    propertyName: 'North Haven Boarding House',
    area: 'Tambak, Dapitan City',
    roomType: 'Private room',
    price: 5800,
    distanceKm: 2.6,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 91,
    roomLabel: 'Room 2',
    privacy: 'Private',
    occupancy: '1 person',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'No curfew', 'Non-smoking'],
    availabilityLabel: 'Available by 15 Oct',
    isFavorite: true,
    category: 'Boarding House',
  },
  {
    id: 'room-studio-university',
    title: 'Studio Unit near University',
    propertyName: 'La Torre Apartelle',
    area: 'Poblacion, La Torre St.',
    roomType: 'Private room',
    price: 3500,
    distanceKm: 0.9,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 88,
    roomLabel: 'Room 1',
    privacy: 'Private',
    occupancy: '2 persons',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'Cooking allowed', 'Non-smoking'],
    availabilityLabel: 'Available by 01 Nov',
    isFavorite: false,
    category: 'Apartment',
  },
  {
    id: 'room-aircon-dorm',
    title: 'Aircon Dormitory Bed',
    propertyName: 'San Roque Dormitory',
    area: 'San Roque, Dapitan City',
    roomType: 'Shared room',
    price: 2200,
    distanceKm: 2.1,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 81,
    roomLabel: 'Bed 3',
    privacy: 'Shared',
    occupancy: '1 person',
    featureBadges: ['Wi-Fi'],
    amenities: ['Air-conditioned', 'Non-smoking'],
    availabilityLabel: 'Available now',
    isFavorite: false,
    category: 'Boarding House',
  },
  {
    id: 'room-sunrise-family',
    title: 'Sunrise Village Family Room',
    propertyName: 'Sunrise Village Homes',
    area: 'Poblacion, Dapitan City',
    roomType: 'Private room',
    price: 4800,
    distanceKm: 1.8,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 90,
    roomLabel: 'Family Room',
    privacy: 'Private',
    occupancy: '4 persons',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'Kitchen access', 'Water included', 'Non-smoking'],
    availabilityLabel: 'Available now',
    isFavorite: false,
    category: 'Village House',
  },
  {
    id: 'room-sunrise-twin',
    title: 'Sunrise Village Twin Room',
    propertyName: 'Sunrise Village Homes',
    area: 'Poblacion, Dapitan City',
    roomType: 'Private room',
    price: 4200,
    distanceKm: 1.8,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 86,
    roomLabel: 'Twin Room',
    privacy: 'Private',
    occupancy: '2 persons',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'Water included', 'No curfew', 'Non-smoking'],
    availabilityLabel: 'Available now',
    isFavorite: false,
    category: 'Village House',
  },
  {
    id: 'room-palm-studio',
    title: 'Palm Condo Studio',
    propertyName: 'Palm Street Condominium',
    area: 'San Roque, Dapitan City',
    roomType: 'Private room',
    price: 5500,
    distanceKm: 2.3,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 84,
    roomLabel: 'Studio',
    privacy: 'Private',
    occupancy: '2 persons',
    featureBadges: ['Wi-Fi', 'Air conditioning'],
    amenities: ['Furnished', 'Private bathroom', 'Electricity included', 'Non-smoking'],
    availabilityLabel: 'Available by 20 Oct',
    isFavorite: false,
    category: 'Condo',
  },
  {
    id: 'room-dahlia-loft',
    title: 'Dahlia Apartments Loft',
    propertyName: 'Dahlia Heights',
    area: 'Providencia, Dapitan City',
    roomType: 'Shared room',
    price: 5200,
    distanceKm: 3.4,
    distanceFromLabel: 'Sta. Cruz',
    matchPercent: 78,
    roomLabel: 'Loft',
    privacy: 'Shared',
    occupancy: '3 persons',
    featureBadges: ['Wi-Fi', 'Private bathroom'],
    amenities: ['Furnished', 'Laundry', 'Visitors allowed', 'Non-smoking'],
    availabilityLabel: 'Available now',
    isFavorite: false,
    category: 'Apartment',
  },
];

/* ------------------------------------------------- rental request / registration */

export type RentalRequestStatus = 'Pending' | 'Confirmed' | 'Declined';

/**
 * A renter's request for a marketplace room. Stored on-device per account by
 * `services/rentalRequests`. A `Confirmed` record is what backs the Verified
 * Renter badge on the renter profile.
 */
export interface RentalRequest {
  id: string;
  roomId: string;
  roomTitle: string;
  propertyName: string;
  monthlyRent: number;
  status: RentalRequestStatus;
  /** ISO yyyy-mm-dd the request was submitted. */
  submittedAt: string;
  /** ISO yyyy-mm-dd the landlord decided; absent while pending. */
  decidedAt?: string;
}

/**
 * Demo seed so the registration status and Verified Renter badge are
 * visualizable in this mock app (same convention as `renterTenancy`). The
 * confirmed record is replaced by real data once the backend exists.
 */
export const renterSeedRentalRequests: RentalRequest[] = [
  {
    id: 'req-seed-1',
    roomId: 'room-studio-university',
    roomTitle: 'Studio Unit near University',
    propertyName: 'La Torre Apartelle',
    monthlyRent: 3500,
    status: 'Confirmed',
    submittedAt: '2026-09-05',
    decidedAt: '2026-09-07',
  },
];

export const renterTenancy: Tenancy = {
  id: 'tenancy-1',
  propertyName: 'Casa De Lapulapu',
  unitLabel: 'Room 3',
  address: 'Sta. Cruz, Dapitan City',
  monthlyRent: 4500,
  leaseStartedAt: '2026-04-01',
  leaseEndsAt: '2026-10-31',
  status: 'Active',
  depositHeld: 4500,
  rentDueDay: 20,
};

export const renterProfile: RenterProfile = {
  fullName: 'Magellan Ferdinand',
  email: 'maggie.ferdinand@gmail.com',
  mobile: '+63 917 456 2810',
  emergencyContact: 'Maria Dela Cruz · +63 918 321 6745',
  memberSince: 'Member since April 2026',
};

export const renterNotifications: AppNotification[] = [
  {
    id: 'notif-faucet',
    category: 'maintenance',
    day: 'today',
    timestampLabel: '11 Oct · 8:30 AM',
    title: 'Faucet repair scheduled',
    description: 'A technician will visit on 13 Oct, 9:00 AM for the bathroom faucet.',
    statusLabel: 'Scheduled',
    actionLabel: 'View maintenance request',
    action: { kind: 'maintenance' },
    read: false,
  },
  {
    id: 'notif-utilities',
    category: 'bills',
    day: 'today',
    timestampLabel: '11 Oct · 7:15 AM',
    title: 'Utilities due 15 Oct',
    description: 'Electricity ₱700 and water ₱150 are ready to pay — ₱850 total.',
    statusLabel: 'Due 15 Oct',
    actionLabel: 'View utility bill',
    action: { kind: 'bills' },
    read: false,
  },
  {
    id: 'notif-rent',
    category: 'rent',
    day: 'today',
    timestampLabel: '11 Oct · 6:00 AM',
    title: 'October rent ready',
    description: 'Your ₱4,500 rent for October is ready. Due 20 Oct 2026.',
    statusLabel: 'Due 20 Oct',
    actionLabel: 'View rent bill',
    action: { kind: 'bills' },
    read: false,
  },
  {
    id: 'notif-hallway-light',
    category: 'maintenance',
    day: 'earlier',
    timestampLabel: '28 Sep · 4:45 PM',
    title: 'Hallway light repaired',
    description: 'The bulb was replaced and the fixture tested. Thanks for reporting it.',
    statusLabel: 'Completed',
    actionLabel: 'View maintenance request',
    action: { kind: 'maintenance' },
    read: true,
  },
  {
    id: 'notif-september-payment',
    category: 'rent',
    day: 'earlier',
    timestampLabel: '20 Sep · 10:42 AM',
    title: 'September payment received',
    description: 'We received ₱5,300 for September. Your receipt is ready.',
    statusLabel: 'Paid',
    actionLabel: 'View receipt',
    action: { kind: 'receipt', receiptId: 'txn-sep' },
    read: true,
  },
];

export const renterCurrentBill: CurrentBill = {
  periodLabel: 'October 2026 bills',
  total: 5350,
  status: 'Unpaid',
  note: 'Total upcoming balance · No overdue bills',
  nextDueLabel: 'Next due: 15 Oct 2026 · Utilities',
};

export const renterBillLines: BillLine[] = [
  {
    id: 'bill-rent',
    label: 'Monthly rent',
    amount: 4500,
    meta: 'October · Due 20 Oct 2026',
  },
  {
    id: 'bill-electricity',
    label: 'Electricity',
    amount: 700,
    meta: 'September · Due 15 Oct 2026',
  },
  {
    id: 'bill-water',
    label: 'Water',
    amount: 150,
    meta: 'September · Due 15 Oct 2026',
  },
];

export const renterPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-gcash',
    provider: 'GCash',
    accountLabel: 'Magellan Ferdinand · •••• 2810',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'pm-bank',
    provider: 'Bank transfer',
    accountLabel: 'BPI · •••• 4471',
    icon: 'business-outline',
  },
  {
    id: 'pm-cash',
    provider: 'Cash to landlord',
    accountLabel: 'Hand over in person · Get a receipt',
    icon: 'cash-outline',
  },
];

export const renterTransactions: PaymentTransaction[] = [
  {
    id: 'txn-sep',
    period: 'September 2026',
    amount: 5300,
    breakdown: 'Rent ₱4,500 + utilities ₱800',
    timestampLabel: '20 Sep 2026 · 10:42 AM',
    reference: 'GCash · Ref: 2P0B6D20-1842',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'txn-aug',
    period: 'August 2026',
    amount: 5250,
    breakdown: 'Rent ₱4,500 + utilities ₱750',
    timestampLabel: '20 Aug 2026 · 9:18 AM',
    reference: 'GCash · Ref: 2P0B6D20-1125',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'txn-jul',
    period: 'July 2026',
    amount: 5320,
    breakdown: 'Rent ₱4,500 + utilities ₱820',
    timestampLabel: '20 Jul 2026 · 10:05 AM',
    reference: 'GCash · Ref: 2P0B6D20-0970',
    method: 'GCash',
    status: 'Paid',
  },
];

/* Retained for the informational Bills screen and the dashboard. */
export const renterPaymentOverview: PaymentOverview = {
  period: 'October 2026',
  amountDue: 5350,
  dueDate: '2026-10-15',
  status: 'Unpaid',
};

export const renterPaymentHistory: PaymentRecord[] = [
  {
    id: 'pay-1',
    period: 'September 2026',
    amount: 5300,
    paidAt: '2026-09-20',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'pay-2',
    period: 'August 2026',
    amount: 5250,
    paidAt: '2026-08-20',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'pay-3',
    period: 'July 2026',
    amount: 5320,
    paidAt: '2026-07-20',
    method: 'GCash',
    status: 'Paid',
  },
];

export const renterReminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Rent due',
    detail: '₱4,500 for October 2026',
    date: '2026-10-20',
    status: 'Unpaid',
  },
  {
    id: 'rem-2',
    title: 'Unit inspection',
    detail: 'Landlord walkthrough of Room 3',
    date: '2026-10-18',
    status: 'Scheduled',
  },
  {
    id: 'rem-3',
    title: 'Lease renewal',
    detail: 'Current lease ends October 31, 2026',
    date: '2026-10-31',
    status: 'Scheduled',
  },
];

export const renterMaintenance: MaintenanceTicket[] = [
  {
    id: 'mnt-1',
    title: 'Leaking faucet',
    detail: 'Bathroom sink drips continuously even when closed.',
    category: 'Plumbing',
    updatedAt: '2026-10-08',
    status: 'Scheduled',
  },
  {
    id: 'mnt-2',
    title: 'Hallway light',
    detail: 'Bulb replaced and fixture tested.',
    category: 'Electrical',
    updatedAt: '2026-09-27',
    status: 'Completed',
  },
];
