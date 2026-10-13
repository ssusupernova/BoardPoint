/**
 * Append-only audit trail. Every administrative decision writes one entry with
 * the actor, timestamp, target record, action and — where applicable — the
 * reason the administrator gave.
 */
import { newId } from './store';
import type {
  AdminDatabase,
  AdminProfile,
  AuditAction,
  AuditLogEntry,
  AuditTargetType,
} from './types';

export interface AuditTarget {
  type: AuditTargetType;
  id: string;
  label: string;
}

export function appendAudit(
  db: AdminDatabase,
  actor: AdminProfile,
  action: AuditAction,
  target: AuditTarget,
  options: { reason?: string | null; metadata?: Record<string, string | number | boolean> } = {}
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: newId('aud'),
    at: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.fullName,
    actorRole: actor.role,
    action,
    targetType: target.type,
    targetId: target.id,
    targetLabel: target.label,
    reason: options.reason ?? null,
    metadata: options.metadata ?? null,
  };
  db.auditLogs = [entry, ...db.auditLogs];
  return entry;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'verification.assigned': 'Verification assigned',
  'verification.info_requested': 'More information requested',
  'verification.resubmission_reviewed': 'Resubmission reviewed',
  'verification.approved': 'Verification approved',
  'verification.rejected': 'Verification rejected',
  'account.suspended': 'Account suspended',
  'account.reactivated': 'Account reactivated',
  'listing.flagged': 'Listing flagged',
  'listing.correction_requested': 'Listing correction requested',
  'listing.hidden': 'Listing hidden',
  'listing.restored': 'Listing restored',
  'report.assigned': 'Report assigned',
  'report.findings_added': 'Report findings recorded',
  'report.resolved': 'Report resolved',
  'report.escalated': 'Report escalated',
  'document.viewed': 'Secure document viewed',
  'settings.updated': 'Admin settings updated',
  'database.reset': 'Demo database reset',
};

export const AUDIT_TARGET_LABELS: Record<AuditTargetType, string> = {
  landlord: 'Landlord account',
  application: 'Verification application',
  listing: 'Property listing',
  report: 'Report',
  document: 'Identity document',
  admin: 'Administrator',
  system: 'System',
};

export type AuditTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

/** Presentation hints so every screen renders the same action identically. */
export function auditPresentation(action: AuditAction): { tone: AuditTone; icon: string } {
  if (action.includes('approved') || action.includes('reactivated') || action.includes('restored')) {
    return { tone: 'success', icon: 'checkmark-circle-outline' };
  }
  if (action.includes('resolved')) return { tone: 'success', icon: 'checkmark-done-outline' };
  if (
    action.includes('rejected') ||
    action.includes('hidden') ||
    action.includes('suspended') ||
    action.includes('escalated')
  ) {
    return { tone: 'danger', icon: 'alert-circle-outline' };
  }
  if (action.includes('requested') || action.includes('flagged') || action.includes('correction')) {
    return { tone: 'warning', icon: 'warning-outline' };
  }
  if (action.includes('viewed')) return { tone: 'info', icon: 'eye-outline' };
  if (action.includes('assigned') || action.includes('findings')) {
    return { tone: 'info', icon: 'person-outline' };
  }
  if (action.includes('settings') || action.includes('permissions') || action.includes('database')) {
    return { tone: 'primary', icon: 'options-outline' };
  }
  return { tone: 'neutral', icon: 'ellipse-outline' };
}
