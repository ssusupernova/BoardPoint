import type { Href } from 'expo-router';

/**
 * Build a typed href from a plain path.
 *
 * Casting through `unknown` keeps this map independent of the generated route
 * union (`.expo/types/router.d.ts`), which is produced by the dev server.
 * Declared as a hoisted function so the route map below can call it.
 */
export function href(path: string | Href): Href {
  return path as unknown as Href;
}

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
  home: href('/home'),
  admin: href('/admin'),
  adminVerification: href('/admin/verification'),
  adminAccounts: href('/admin/accounts'),
  adminModeration: href('/admin/moderation'),
  adminReports: href('/admin/reports'),
  adminAuditLogs: href('/admin/audit-logs'),
  adminAnalytics: href('/admin/analytics'),
  adminNotifications: href('/admin/notifications'),
  adminSettings: href('/admin/settings'),
} as const;

/** Dynamic admin detail routes. */
export const adminRoutes = {
  application: (id: string) => href(`/admin/verification/${id}`),
  account: (id: string) => href(`/admin/accounts/${id}`),
  listing: (id: string) => href(`/admin/moderation/${id}`),
  report: (id: string) => href(`/admin/reports/${id}`),
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
