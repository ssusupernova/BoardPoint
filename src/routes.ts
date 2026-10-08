import type { Href } from 'expo-router';

export const routes = {
  signIn: '/' as Href,
  chooseRole: '/choose-role' as Href,
  signUp: '/sign-up' as Href,
  forgotPassword: '/forgot-password' as Href,
  home: '/home' as Href,
  preferences: '/renter/preferences',
  landlordListSpace: '/landlord/list-space' as Href,
} as const;
