import type { Href } from 'expo-router';
import type { LandlordNotificationLink } from '@/services/landlordNotifications';

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
  forgotPassword: href('/forgot-password'),
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
  landlordReports: href('/landlord/reports'),
  landlordBills: href('/landlord/bills'),
  landlordPayments: href('/landlord/payments'),
  landlordPaymentNew: href('/landlord/payment-new'),
  landlordExpenses: href('/landlord/expenses'),
  landlordExpenseNew: href('/landlord/expense-new'),
  landlordStatements: href('/landlord/statements'),
  landlordProperties: href('/landlord/properties'),
  landlordPropertyMap: href('/landlord/property-map'),
  landlordRooms: href('/landlord/rooms'),
  landlordRoomNew: href('/landlord/room-new'),
  landlordRoomDetailsBase: href('/landlord/room-details'),
  landlordTenants: href('/landlord/tenants'),
  landlordTenantNew: href('/landlord/tenant-new'),
  landlordTenantDetailsBase: href('/landlord/tenant-details'),
  landlordMaintenance: href('/landlord/maintenance'),
  landlordLeases: href('/landlord/leases'),
  landlordProfile: href('/landlord/profile'),
  landlordProfileEdit: href('/landlord/edit-profile'),
  landlordChangePassword: href('/landlord/change-password'),
  landlordSetting: (section: string) => href(`/landlord/settings/${section}`),
  landlordVerification: href('/landlord/verification'),
  landlordVerificationPending: href('/landlord/verification/pending'),
  landlordAddProperty: href('/landlord/property-new'),
  landlordListSpace: href('/landlord/list-space'),
  landlordNotifications: href('/landlord/notifications'),
  landlordNotificationSettings: href('/landlord/notification-settings'),
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

/** Add-property form; pass an id to edit an existing listing. */
export function landlordPropertyForm(propertyId?: string): Href {
  return propertyId
    ? href(`/landlord/property-new?propertyId=${encodeURIComponent(propertyId)}`)
    : routes.landlordAddProperty;
}

/** Landlord property details — highlights the given property in the list. */
export function landlordPropertyDetails(propertyId: string): Href {
  return href(`/landlord/properties?propertyId=${encodeURIComponent(propertyId)}`);
}

/** Landlord bills — highlights the given rent bill. */
export function landlordBillDetails(billId: string): Href {
  return href(`/landlord/bills?billId=${encodeURIComponent(billId)}`);
}

/** Record-payment form; pass a billId to preselect the bill. */
export function landlordPaymentNewFor(billId?: string): Href {
  return billId
    ? href(`/landlord/payment-new?billId=${encodeURIComponent(billId)}`)
    : routes.landlordPaymentNew;
}

/** Payment details — transactions recorded against one bill. */
export function landlordPaymentDetails(billId: string): Href {
  return href(`/landlord/payment-details?billId=${encodeURIComponent(billId)}`);
}

/** Landlord leases — highlights the given tenant record. */
export function landlordTenantDetails(tenantId: string): Href {
  return href(`/landlord/leases?tenantId=${encodeURIComponent(tenantId)}`);
}

/** Shared-expense dashboard, optionally filtered to one property. */
export function landlordExpensesFor(propertyId?: string): Href {
  return propertyId
    ? href(`/landlord/expenses?propertyId=${encodeURIComponent(propertyId)}`)
    : routes.landlordExpenses;
}

/** Add/edit shared-expense form; pass an expenseId to edit an existing record. */
export function landlordExpenseForm(expenseId?: string): Href {
  return expenseId
    ? href(`/landlord/expense-new?expenseId=${encodeURIComponent(expenseId)}`)
    : routes.landlordExpenseNew;
}

/** Shared-expense details — stored allocation breakdown for one expense. */
export function landlordExpenseDetails(expenseId: string): Href {
  return href(`/landlord/expense-details?expenseId=${encodeURIComponent(expenseId)}`);
}

/** Billing-statements list, optionally filtered to one property. */
export function landlordStatementsFor(propertyId?: string): Href {
  return propertyId
    ? href(`/landlord/statements?propertyId=${encodeURIComponent(propertyId)}`)
    : routes.landlordStatements;
}

/** One tenant's itemised statement (draft or finalized). */
export function landlordStatement(statementId: string): Href {
  return href(`/landlord/statement?statementId=${encodeURIComponent(statementId)}`);
}

/** Room management list, optionally filtered to one property. */
export function landlordRoomList(propertyId?: string): Href {
  return propertyId
    ? href(`/landlord/rooms?propertyId=${encodeURIComponent(propertyId)}`)
    : routes.landlordRooms;
}

/** Room add/edit form. Pass roomId to edit; propertyId to preselect a property. */
export function landlordRoomForm(roomId?: string, propertyId?: string): Href {
  const query: string[] = [];
  if (roomId) query.push(`roomId=${encodeURIComponent(roomId)}`);
  if (propertyId) query.push(`propertyId=${encodeURIComponent(propertyId)}`);
  return query.length
    ? href(`/landlord/room-new?${query.join('&')}`)
    : routes.landlordRoomNew;
}

/** Room details — occupancy, tenancy records, and rental history for one room. */
export function landlordRoomDetails(roomId: string): Href {
  return href(`/landlord/room-details?roomId=${encodeURIComponent(roomId)}`);
}

/** Tenant directory, optionally filtered to one property. */
export function landlordTenantList(propertyId?: string): Href {
  return propertyId
    ? href(`/landlord/tenants?propertyId=${encodeURIComponent(propertyId)}`)
    : routes.landlordTenants;
}

/** Tenant form — pass tenantId to edit an existing record. */
export function landlordTenantForm(tenantId?: string): Href {
  return tenantId
    ? href(`/landlord/tenant-new?tenantId=${encodeURIComponent(tenantId)}`)
    : routes.landlordTenantNew;
}

/** Tenant profile — payments, messages, and tenancy history for one person. */
export function landlordTenantProfile(tenantId: string): Href {
  return href(`/landlord/tenant-details?tenantId=${encodeURIComponent(tenantId)}`);
}

/** Resolve a notification deep link to its destination screen. */
export function landlordNotificationLink(link?: LandlordNotificationLink): Href {
  switch (link?.kind) {
    case 'property':
      return landlordPropertyDetails(link.propertyId);
    case 'room':
      return landlordRoomDetails(link.roomId);
    case 'tenant':
      return landlordTenantProfile(link.tenantId);
    case 'bill':
      return landlordPaymentDetails(link.billId);
    case 'statement':
      return landlordStatement(link.statementId);
    case 'expense':
      return landlordExpenseDetails(link.expenseId);
    case 'bills':
      return routes.landlordBills;
    case 'leases':
      return routes.landlordLeases;
    case 'payments':
      return routes.landlordPayments;
    case 'expenses':
      return routes.landlordExpenses;
    case 'statements':
      return routes.landlordStatements;
    default:
      return routes.landlordNotifications;
  }
}
