/**
 * BoardPoint domain types shared by mock data and, later, the real API layer.
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
