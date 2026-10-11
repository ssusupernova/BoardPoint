import type { Href } from 'expo-router';

export const routes = {
  signIn: '/' as Href,
  chooseRole: '/choose-role' as Href,
  signUp: '/sign-up' as Href,
  forgotPassword: '/forgot-password' as Href,
  renterDashboard: '/renter',
  landlordDashboard: '/landlord',
  preferences: '/renter/preferences',
  landlordListSpace: '/landlord/list-space' as Href,
} as const;

export type DashboardRole = 'renter' | 'landlord';

export function dashboardForRole(role?: DashboardRole): Href {
  return role === 'landlord' ? routes.landlordDashboard : routes.renterDashboard;
}
