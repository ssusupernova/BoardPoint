import type {
  MaintenanceTicket,
  PaymentOverview,
  PaymentRecord,
  Reminder,
  RenterRoom,
  Tenancy,
} from './types';

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
