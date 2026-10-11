/**
 * BoardPoint mock data.
 *
 * Stand-in for a real backend until the API is wired up. Screens that render
 * live data read from these arrays; replace them with fetched data later.
 */

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

export const renterMockRooms: RenterRoom[] = [
  {
    id: 'room-1',
    title: 'Studio Unit near University',
    area: 'Tambak, Potol Street',
    roomType: 'Private room',
    price: 3500,
    distanceKm: 0.8,
    matchPercent: 96,
  },
  {
    id: 'room-2',
    title: 'Shared Room with Wi-Fi',
    area: 'Providencia, Dahlia St.',
    roomType: 'Shared room',
    price: 1800,
    distanceKm: 1.5,
    matchPercent: 88,
  },
  {
    id: 'room-3',
    title: 'Aircon Dormitory Bed',
    area: 'San Roque, Palm Street',
    roomType: 'Shared room',
    price: 2200,
    distanceKm: 2.1,
    matchPercent: 81,
  },
  {
    id: 'room-4',
    title: 'Private Room with Kitchen Access',
    area: 'Poblacion, La Torre St.',
    roomType: 'Private room',
    price: 4200,
    distanceKm: 3.2,
    matchPercent: 74,
  },
];

/* --------------------------------------------------- renter dashboard data */

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
  updatedAt: string;
  status: TenantStatus;
}

export const renterTenancy: Tenancy = {
  id: 'tenancy-1',
  propertyName: 'Tambak Dormitory',
  unitLabel: 'Room 4B',
  address: 'Tambak, Potol Street, Ormoc City',
  monthlyRent: 3500,
  leaseStartedAt: '2026-01-15',
  leaseEndsAt: '2026-12-31',
  status: 'Active',
};

export const renterPaymentOverview: PaymentOverview = {
  period: 'October 2026',
  amountDue: 3500,
  dueDate: '2026-10-15',
  status: 'Unpaid',
};

export const renterPaymentHistory: PaymentRecord[] = [
  {
    id: 'pay-1',
    period: 'September 2026',
    amount: 3500,
    paidAt: '2026-09-14',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'pay-2',
    period: 'August 2026',
    amount: 3500,
    paidAt: '2026-08-12',
    method: 'GCash',
    status: 'Paid',
  },
  {
    id: 'pay-3',
    period: 'July 2026',
    amount: 3500,
    paidAt: '2026-07-13',
    method: 'Cash',
    status: 'Paid',
  },
];

export const renterReminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Rent due',
    detail: '₱3,500 for October 2026',
    date: '2026-10-15',
    status: 'Unpaid',
  },
  {
    id: 'rem-2',
    title: 'Unit inspection',
    detail: 'Landlord walkthrough of Room 4B',
    date: '2026-10-18',
    status: 'Scheduled',
  },
  {
    id: 'rem-3',
    title: 'Lease renewal',
    detail: 'Current lease ends December 31, 2026',
    date: '2026-12-01',
    status: 'Scheduled',
  },
];

export const renterMaintenance: MaintenanceTicket[] = [
  {
    id: 'mnt-1',
    title: 'Leaking faucet',
    detail: 'Bathroom sink drips continuously even when closed.',
    updatedAt: '2026-10-08',
    status: 'Scheduled',
  },
  {
    id: 'mnt-2',
    title: 'Hallway light',
    detail: 'Bulb replaced and fixture tested.',
    updatedAt: '2026-09-27',
    status: 'Completed',
  },
];

export const landlordMockListings: LandlordListing[] = [
  {
    id: 'listing-1',
    propertyName: 'Tambak Dormitory',
    address: 'Tambak, Potol Street',
    totalUnits: 12,
    occupiedUnits: 9,
    monthlyRent: 2500,
    status: 'Listed',
  },
  {
    id: 'listing-2',
    propertyName: 'Palm Street Boarding House',
    address: 'San Roque, Palm Street',
    totalUnits: 8,
    occupiedUnits: 8,
    monthlyRent: 2200,
    status: 'Rented',
  },
  {
    id: 'listing-3',
    propertyName: 'La Torre Apartelle',
    address: 'Poblacion, La Torre St.',
    totalUnits: 6,
    occupiedUnits: 2,
    monthlyRent: 4500,
    status: 'Listed',
  },
  {
    id: 'listing-4',
    propertyName: 'Dahlia Heights',
    address: 'Providencia, Dahlia St.',
    totalUnits: 10,
    occupiedUnits: 0,
    monthlyRent: 3000,
    status: 'Pending verification',
  },
];