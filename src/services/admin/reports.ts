/**
 * Reports and complaints: assignment, findings, resolution and escalation.
 * Resolving requires written resolution notes so the case history stays useful.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { pushAdminNotification } from './notifications';
import { mutateAdminDatabase, newId, roundTrip } from './store';
import type { AdminDatabase, AdminProfile, ContentReport, ReportEvent } from './types';

function loadReport(db: AdminDatabase, reportId: string): ContentReport {
  const report = db.reports.find((entry) => entry.id === reportId);
  if (!report) throw new Error('That report no longer exists.');
  return report;
}

function addHistory(
  report: ContentReport,
  actorName: string,
  action: ReportEvent['action'],
  note: string | null
): void {
  report.history = [
    ...report.history,
    { id: newId('rptev'), at: new Date().toISOString(), actorName, action, note },
  ];
}

export async function assignReportToMe(
  reportId: string,
  actor: AdminProfile
): Promise<ContentReport> {
  requirePermission(actor, 'reports.manage');
  await roundTrip(120);

  let result: ContentReport | null = null;

  await mutateAdminDatabase((db) => {
    const report = loadReport(db, reportId);
    if (report.status === 'resolved') {
      throw new Error('This report is already resolved.');
    }
    if (report.assignedTo === actor.id) {
      throw new Error('You are already the assigned reviewer for this report.');
    }

    report.assignedTo = actor.id;
    report.assignedToName = actor.fullName;
    if (report.status === 'open') report.status = 'investigating';
    addHistory(report, actor.fullName, 'assigned', 'Reviewer assigned to the case.');

    appendAudit(
      db,
      actor,
      'report.assigned',
      { type: 'report', id: report.id, label: `${report.reference} · ${report.targetLabel}` },
      { metadata: { assignedTo: actor.fullName } }
    );

    result = report;
  });

  if (!result) throw new Error('The assignment could not be saved. Please try again.');
  return result;
}

export interface ReportFindingsInput {
  reportId: string;
  actor: AdminProfile;
  findings: string;
}

/** Saves investigation findings without closing the case. */
export async function addReportFindings(input: ReportFindingsInput): Promise<ContentReport> {
  requirePermission(input.actor, 'reports.manage');
  const findings = input.findings.trim();
  if (findings.length < 8) {
    throw new Error('Write at least a sentence describing what you found.');
  }
  await roundTrip();

  let result: ContentReport | null = null;

  await mutateAdminDatabase((db) => {
    const report = loadReport(db, input.reportId);
    if (report.status === 'resolved') {
      throw new Error('This report is already resolved.');
    }

    report.findings = findings;
    if (report.status === 'open') {
      report.status = 'investigating';
      report.assignedTo = report.assignedTo ?? input.actor.id;
      report.assignedToName = report.assignedToName ?? input.actor.fullName;
    }
    addHistory(report, input.actor.fullName, 'findings_added', findings);

    appendAudit(
      db,
      input.actor,
      'report.findings_added',
      { type: 'report', id: report.id, label: `${report.reference} · ${report.targetLabel}` },
      { reason: findings, metadata: { step: 'findings' } }
    );

    result = report;
  });

  if (!result) throw new Error('The findings could not be saved. Please try again.');
  return result;
}

export interface ResolveReportInput {
  reportId: string;
  actor: AdminProfile;
  findings?: string;
  resolutionNotes: string;
}

export async function resolveReport(input: ResolveReportInput): Promise<ContentReport> {
  requirePermission(input.actor, 'reports.manage');
  const resolutionNotes = input.resolutionNotes.trim();
  if (resolutionNotes.length < 8) {
    throw new Error('Resolution notes are required so the case can be audited later.');
  }
  await roundTrip();

  let result: ContentReport | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const report = loadReport(db, input.reportId);
    if (report.status === 'resolved') {
      throw new Error('This report is already resolved.');
    }

    report.status = 'resolved';
    report.findings = input.findings?.trim() || report.findings;
    report.resolutionNotes = resolutionNotes;
    report.resolvedAt = now;
    report.resolvedBy = input.actor.id;
    report.assignedTo = report.assignedTo ?? input.actor.id;
    report.assignedToName = report.assignedToName ?? input.actor.fullName;
    addHistory(report, input.actor.fullName, 'resolved', resolutionNotes);

    appendAudit(
      db,
      input.actor,
      'report.resolved',
      { type: 'report', id: report.id, label: `${report.reference} · ${report.targetLabel}` },
      { reason: resolutionNotes }
    );

    result = report;
  });

  if (!result) throw new Error('The resolution could not be saved. Please try again.');
  return result;
}

export interface EscalateReportInput {
  reportId: string;
  actor: AdminProfile;
  reason: string;
}

export async function escalateReport(input: EscalateReportInput): Promise<ContentReport> {
  requirePermission(input.actor, 'reports.manage');
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new Error('Explain why this case needs to be escalated.');
  }
  await roundTrip();

  let result: ContentReport | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const report = loadReport(db, input.reportId);
    if (report.status === 'resolved') {
      throw new Error('A resolved report cannot be escalated.');
    }
    if (report.status === 'escalated') {
      throw new Error('This report is already escalated.');
    }

    report.status = 'escalated';
    report.escalatedAt = now;
    report.escalationReason = reason;
    report.assignedTo = report.assignedTo ?? input.actor.id;
    report.assignedToName = report.assignedToName ?? input.actor.fullName;
    addHistory(report, input.actor.fullName, 'escalated', reason);

    appendAudit(
      db,
      input.actor,
      'report.escalated',
      { type: 'report', id: report.id, label: `${report.reference} · ${report.targetLabel}` },
      { reason }
    );

    pushAdminNotification(db, {
      type: 'unresolved_case',
      title: `${report.reference} escalated`,
      body: reason,
      severity: 'critical',
      route: `/admin/reports/${report.id}`,
    });

    result = report;
  });

  if (!result) throw new Error('The escalation could not be saved. Please try again.');
  return result;
}
