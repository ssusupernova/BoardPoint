/**
 * Admin settings operations.
 *
 * Every signed-in account is a super admin, so preferences changes always pass
 * the `settings.manage` gate. No action can rewrite the verification workflow
 * from settings.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { mutateAdminDatabase, resetAdminDatabase, roundTrip } from './store';
import type { AdminPreferences, AdminProfile } from './types';

export async function updatePreferences(
  actor: AdminProfile,
  patch: Partial<AdminPreferences>
): Promise<AdminPreferences> {
  requirePermission(actor, 'settings.manage');
  await roundTrip(100);

  let updated: AdminPreferences | null = null;

  await mutateAdminDatabase((db) => {
    db.preferences = { ...db.preferences, ...patch };
    appendAudit(
      db,
      actor,
      'settings.updated',
      { type: 'admin', id: actor.id, label: 'Administrator preferences' },
      { metadata: Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, String(value)])) }
    );
    updated = db.preferences;
  });

  if (!updated) throw new Error('Your settings could not be saved. Please try again.');
  return updated;
}

/** Clears the local database and restores the seeded dataset. */
export async function resetDemoData(actor: AdminProfile): Promise<void> {
  requirePermission(actor, 'settings.manage');
  await roundTrip(180);
  const db = await resetAdminDatabase();
  await mutateAdminDatabase((fresh) => {
    appendAudit(
      fresh,
      actor,
      'database.reset',
      { type: 'system', id: 'admin-database', label: 'Admin demo database' },
      { reason: 'Restored the seeded dataset from Admin Settings.', metadata: { rows: db.applications.length } }
    );
  });
}
