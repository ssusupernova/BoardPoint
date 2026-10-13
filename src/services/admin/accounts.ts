/**
 * Landlord account management: suspension and reactivation with mandatory
 * reasons, full audit coverage and a notification to the landlord.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { notifyLandlord, pushAdminNotification } from './notifications';
import { mutateAdminDatabase, roundTrip } from './store';
import type { AdminDatabase, AdminProfile, LandlordAccount } from './types';

function loadLandlord(db: AdminDatabase, landlordId: string): LandlordAccount {
  const landlord = db.landlords.find((entry) => entry.id === landlordId);
  if (!landlord) throw new Error('That landlord account no longer exists.');
  return landlord;
}

export interface SuspendLandlordInput {
  landlordId: string;
  actor: AdminProfile;
  reason: string;
}

export async function suspendLandlord(input: SuspendLandlordInput): Promise<LandlordAccount> {
  requirePermission(input.actor, 'accounts.manage');
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new Error('A reason of at least 8 characters is required — it is recorded in the audit log.');
  }
  await roundTrip();

  let result: LandlordAccount | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const landlord = loadLandlord(db, input.landlordId);
    if (landlord.accountStatus === 'suspended') {
      throw new Error('This account is already suspended.');
    }

    landlord.accountStatus = 'suspended';
    landlord.suspensionReason = reason;
    landlord.suspendedAt = now;
    landlord.suspendedBy = input.actor.fullName;
    landlord.reactivatedAt = null;

    appendAudit(
      db,
      input.actor,
      'account.suspended',
      { type: 'landlord', id: landlord.id, label: landlord.fullName },
      { reason, metadata: { email: landlord.email } }
    );

    notifyLandlord(db, {
      landlordId: landlord.id,
      kind: 'suspended',
      title: 'Your landlord account has been suspended',
      body: reason,
      nextSteps: 'Reply to the support team with your side of the reports to request reinstatement.',
    });

    pushAdminNotification(db, {
      type: 'account_suspended',
      title: `${landlord.fullName} was suspended`,
      body: reason,
      severity: 'warning',
      route: `/admin/accounts/${landlord.id}`,
    });

    result = landlord;
  });

  if (!result) throw new Error('The suspension could not be saved. Please try again.');
  return result;
}

export interface ReactivateLandlordInput {
  landlordId: string;
  actor: AdminProfile;
  note?: string;
}

export async function reactivateLandlord(
  input: ReactivateLandlordInput
): Promise<LandlordAccount> {
  requirePermission(input.actor, 'accounts.manage');
  const note = input.note?.trim() || null;
  await roundTrip();

  let result: LandlordAccount | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const landlord = loadLandlord(db, input.landlordId);
    if (landlord.accountStatus === 'active') {
      throw new Error('This account is already active.');
    }

    const previousReason = landlord.suspensionReason;
    landlord.accountStatus = 'active';
    landlord.reactivatedAt = now;
    landlord.suspendedAt = null;
    landlord.suspensionReason = null;
    landlord.suspendedBy = null;

    appendAudit(
      db,
      input.actor,
      'account.reactivated',
      { type: 'landlord', id: landlord.id, label: landlord.fullName },
      { reason: note, metadata: { previousReason: previousReason ?? '—' } }
    );

    notifyLandlord(db, {
      landlordId: landlord.id,
      kind: 'reactivated',
      title: 'Your landlord account is active again',
      body: note ?? 'Your account has been reactivated by the BoardPoint review team.',
      nextSteps: 'You can sign in and manage your listings as before.',
    });

    result = landlord;
  });

  if (!result) throw new Error('The reactivation could not be saved. Please try again.');
  return result;
}
