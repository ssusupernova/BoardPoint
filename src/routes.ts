import type { Href } from 'expo-router';

/**
 * Build a typed href from a plain path.
 *
 * Casting through `unknown` keeps this map independent of the generated route
 * union (`.expo/types/router.d.ts`), which is produced by the dev server.
 */
const href = (path: string): Href => path as unknown as Href;

export const routes = {
  signIn: href('/'),
  chooseRole: href('/choose-role'),
  signUp: href('/sign-up'),
  renterDashboard: href('/renter'),
  preferences: href('/renter/preferences'),
  renterRecommended: href('/renter/recommended'),
  renterTenancy: href('/renter/tenancy'),
  renterBills: href('/renter/bills'),
  renterSaved: href('/renter/saved'),
  renterAlerts: href('/renter/alerts'),
  renterPayments: href('/renter/payments'),
  renterProfile: href('/renter/profile'),
  renterMaintenance: href('/renter/maintenance'),
  renterReportIssue: href('/renter/maintenance/new'),
  renterRooms: href('/renter/rooms'),
  renterRecommended: href('/renter/recommended'),
  renterApplications: href('/renter/applications'),
  renterRoomsByCategory: (category: string) =>
    href(`/renter/rooms?category=${encodeURIComponent(category)}`),
  renterHistory: href('/renter/history'),
  renterPaymentMethods: href('/renter/payment-methods'),
  renterProfileEdit: href('/renter/profile-edit'),
  renterRoom: (id: string) => href(`/renter/rooms/${id}`),
  renterReceipt: (id: string) => href(`/renter/receipts/${id}`),
  renterSetting: (section: string) => href(`/renter/settings/${section}`),
  landlordDashboard: href('/landlord'),
  landlordBills: href('/landlord/bills'),
  landlordProperties: href('/landlord/properties'),
  landlordMaintenance: href('/landlord/maintenance'),
  landlordLeases: href('/landlord/leases'),
  landlordProfile: href('/landlord/profile'),
  landlordListSpace: href('/landlord/list-space'),
} as const;

export type DashboardRole = 'renter' | 'landlord';

export function dashboardForRole(role?: DashboardRole): Href {
  return role === 'landlord' ? routes.landlordDashboard : routes.renterDashboard;
}

/** Landlord property details — highlights the given property in the list. */
export function landlordPropertyDetails(propertyId: string): Href {
  return href(`/landlord/properties?propertyId=${encodeURIComponent(propertyId)}`);
}

/** Landlord bills — highlights the given rent bill. */
export function landlordBillDetails(billId: string): Href {
  return href(`/landlord/bills?billId=${encodeURIComponent(billId)}`);
}

/** Landlord leases — highlights the given tenant record. */
export function landlordTenantDetails(tenantId: string): Href {
  return href(`/landlord/leases?tenantId=${encodeURIComponent(tenantId)}`);
}
