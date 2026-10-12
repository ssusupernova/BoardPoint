import { useAuthSession } from '@/services/auth';
import { ALL_PERMISSIONS, PERMISSION_LABELS, type AdminProfile, type Permission } from './types';
import { useAdminStore } from './store';

export class AdminPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminPermissionError';
  }
}

/**
 * Guards a privileged action. The panel only has super admins today, who hold
 * every permission; the check stays so a future role split keeps working.
 */
export function requirePermission(
  actor: AdminProfile | null,
  permission: Permission
): AdminProfile {
  if (!actor) {
    throw new AdminPermissionError('You need to be signed in as an administrator to do that.');
  }
  if (!actor.permissions.includes(permission)) {
    throw new AdminPermissionError(
      `Your administrator role does not include “${PERMISSION_LABELS[permission]}”. Ask a super admin for access.`
    );
  }
  return actor;
}

/**
 * Resolves the signed-in administrator. Returns `null` for regular users so
 * screens can render a clear "not authorized" state instead of crashing.
 */
export function useAdminActor(): AdminProfile | null {
  const { session } = useAuthSession();
  const { db } = useAdminStore();

  if (!session || session.user.role !== 'super_admin') return null;

  const fromDatabase = db?.admins.find((admin) => admin.id === session.user.id);
  if (fromDatabase) return fromDatabase;

  return {
    id: session.user.id,
    fullName: session.user.fullName,
    email: session.user.email,
    role: 'super_admin',
    title: 'Super administrator',
    permissions: [...ALL_PERMISSIONS],
    createdAt: '',
    lastSignInAt: null,
  };
}
