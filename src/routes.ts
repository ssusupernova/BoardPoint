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
  landlordDashboard: href('/landlord'),
  preferences: href('/renter/preferences'),
  renterTenancy: href('/renter/tenancy'),
  renterBills: href('/renter/bills'),
  renterSaved: href('/renter/saved'),
  renterAlerts: href('/renter/alerts'),
  renterPayments: href('/renter/payments'),
  renterProfile: href('/renter/profile'),
  renterMaintenance: href('/renter/maintenance'),
  renterReportIssue: href('/renter/maintenance/new'),
  renterRooms: href('/renter/rooms'),
  renterHistory: href('/renter/history'),
  renterPaymentMethods: href('/renter/payment-methods'),
  renterProfileEdit: href('/renter/profile-edit'),
  renterRoom: (id: string) => href(`/renter/rooms/${id}`),
  renterReceipt: (id: string) => href(`/renter/receipts/${id}`),
  renterSetting: (section: string) => href(`/renter/settings/${section}`),
  landlordListSpace: href('/landlord/list-space'),
} as const;

export type DashboardRole = 'renter' | 'landlord';

export function dashboardForRole(role?: DashboardRole): Href {
  return role === 'landlord' ? routes.landlordDashboard : routes.renterDashboard;
}
