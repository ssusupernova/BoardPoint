/**
 * Admin data layer barrel.
 *
 * Screens import from `@/services/admin` so a future swap to a Supabase
 * client only touches this folder.
 */
export * from './types';
export * from './store';
export * from './selectors';
export * from './actor';
export * from './audit';
export * from './notifications';
export * from './verification';
export * from './accounts';
export * from './moderation';
export * from './reports';
export * from './documents';
export * from './settings';
export * from './adminAccounts';
