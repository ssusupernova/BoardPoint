/**
 * Seeded administrator identities.
 *
 * These accounts are written into the local auth store on first launch (see
 * `services/auth.ts`) and mirrored into the admin database so audit entries,
 * assignments and permissions resolve to a real profile.
 *
 * Swap this file for a Supabase `admin_profiles` query when the backend lands.
 */
import type { AdminProfile, AdminRole } from './types';
import { ALL_PERMISSIONS } from './types';

export interface SeededAdminAccount {
  id: string;
  fullName: string;
  email: string;
  username: string;
  /** Demo password for local development. Change before shipping. */
  password: string;
  role: AdminRole;
  title: string;
}

export const ADMIN_SEED_ACCOUNTS: SeededAdminAccount[] = [
  {
    id: 'adm-super-0001',
    fullName: 'Amara Boateng',
    email: 'admin.boardpoint@gmail.com',
    username: 'admin.boardpoint',
    password: 'Admin@1234',
    role: 'super_admin',
    title: 'Trust & Safety Lead',
  },
];

export function buildAdminProfiles(now: string): AdminProfile[] {
  return ADMIN_SEED_ACCOUNTS.map((account) => ({
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    role: account.role,
    title: account.title,
    permissions: [...ALL_PERMISSIONS],
    createdAt: now,
    lastSignInAt: now,
  }));
}
