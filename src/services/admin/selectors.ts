/**
 * Read-side selectors. Every number rendered by the dashboard, analytics and
 * list screens is computed here from the stored rows — no constants in the UI.
 */
import { formatDateRangeLabel, hoursBetween, isWithinRange } from './format';
import type {
  AdminDatabase,
  AuditAction,
  AuditLogEntry,
  ContentReport,
  DateRange,
  LandlordAccount,
  ListingStatus,
  PropertyListing,
  ReportStatus,
  VerificationApplication,
  VerificationStatus,
} from './types';

/* ------------------------------------------------------------- utilities */

export function matchesQuery(haystack: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle);
}

export const DATE_RANGES: DateRange[] = ['7d', '30d', '90d', 'all'];
export { formatDateRangeLabel };

/* ------------------------------------------------------------- documents */

export interface DocumentCompleteness {
  required: number;
  uploaded: number;
  missing: string[];
  /** 0–100 percentage of required documents that are usable. */
  percent: number;
}

const USABLE: string[] = ['uploaded'];

export function documentCompleteness(application: VerificationApplication): DocumentCompleteness {
  const requiredDocuments = application.documents.filter((document) => document.required);
  const usable = requiredDocuments.filter((document) => USABLE.includes(document.status));
  const missing = requiredDocuments
    .filter((document) => !USABLE.includes(document.status))
    .map((document) => document.label);
  const percent = requiredDocuments.length
    ? Math.round((usable.length / requiredDocuments.length) * 100)
    : 100;
  return { required: requiredDocuments.length, uploaded: usable.length, missing, percent };
}

/* -------------------------------------------------------------- dashboard */

export interface SummaryStats {
  pendingApplications: number;
  verifiedLandlords: number;
  rejectedApplications: number;
  suspendedAccounts: number;
  activeListings: number;
  pendingReports: number;
}

export function summaryStats(db: AdminDatabase): SummaryStats {
  return {
    pendingApplications: db.applications.filter((app) => app.status === 'pending').length,
    verifiedLandlords: db.landlords.filter((landlord) => landlord.verificationStatus === 'verified')
      .length,
    rejectedApplications: db.applications.filter((app) => app.status === 'rejected').length,
    suspendedAccounts: db.landlords.filter((landlord) => landlord.accountStatus === 'suspended')
      .length,
    activeListings: db.listings.filter((listing) => listing.status === 'active').length,
    pendingReports: db.reports.filter((report) => report.status === 'open').length,
  };
}

/** Applications waiting on an administrator, oldest submission first. */
export function openApplications(db: AdminDatabase): VerificationApplication[] {
  return db.applications
    .filter((app) => app.status === 'pending' || app.status === 'info_requested' || app.status === 'resubmitted')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export function recentApplications(
  db: AdminDatabase,
  range: DateRange = 'all'
): VerificationApplication[] {
  return db.applications
    .filter((app) => isWithinRange(app.submittedAt, range))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function recentReports(db: AdminDatabase, range: DateRange = 'all'): ContentReport[] {
  return db.reports
    .filter((report) => isWithinRange(report.submittedAt, range))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function openReports(db: AdminDatabase): ContentReport[] {
  return db.reports
    .filter((report) => report.status !== 'resolved')
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function listingsForLandlord(db: AdminDatabase, landlordId: string): PropertyListing[] {
  return db.listings.filter((listing) => listing.landlordId === landlordId);
}

export function applicationsForLandlord(
  db: AdminDatabase,
  landlordId: string
): VerificationApplication[] {
  return db.applications
    .filter((application) => application.landlordId === landlordId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function reportsForTarget(
  db: AdminDatabase,
  targetType: ContentReport['targetType'],
  targetId: string
): ContentReport[] {
  return db.reports.filter(
    (report) => report.targetType === targetType && report.targetId === targetId
  );
}

export function reportCountForListing(db: AdminDatabase, listingId: string): number {
  return reportsForTarget(db, 'listing', listingId).length;
}

export function getLandlord(db: AdminDatabase, landlordId: string): LandlordAccount | null {
  return db.landlords.find((landlord) => landlord.id === landlordId) ?? null;
}

export function getListing(db: AdminDatabase, listingId: string): PropertyListing | null {
  return db.listings.find((listing) => listing.id === listingId) ?? null;
}

export function getApplication(
  db: AdminDatabase,
  applicationId: string
): VerificationApplication | null {
  return db.applications.find((application) => application.id === applicationId) ?? null;
}

export function getReport(db: AdminDatabase, reportId: string): ContentReport | null {
  return db.reports.find((report) => report.id === reportId) ?? null;
}

/* ---------------------------------------------------------------- search */

export type SearchResult =
  | { kind: 'landlord'; id: string; title: string; subtitle: string; route: string }
  | { kind: 'application'; id: string; title: string; subtitle: string; route: string }
  | { kind: 'listing'; id: string; title: string; subtitle: string; route: string }
  | { kind: 'report'; id: string; title: string; subtitle: string; route: string };

/** Global search across landlords, applications, listings and reports. */
export function searchAll(db: AdminDatabase, query: string, limit = 8): SearchResult[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const results: SearchResult[] = [];

  for (const application of db.applications) {
    const landlord = getLandlord(db, application.landlordId);
    const haystack = `${application.reference} ${landlord?.fullName ?? ''} ${landlord?.email ?? ''}`;
    if (matchesQuery(haystack, needle)) {
      results.push({
        kind: 'application',
        id: application.id,
        title: `${application.reference} · ${landlord?.fullName ?? 'Landlord'}`,
        subtitle: `Verification application · ${application.status.replace('_', ' ')}`,
        route: `/admin/verification/${application.id}`,
      });
    }
  }

  for (const landlord of db.landlords) {
    const haystack = `${landlord.fullName} ${landlord.email} ${landlord.city} ${landlord.phone}`;
    if (matchesQuery(haystack, needle)) {
      results.push({
        kind: 'landlord',
        id: landlord.id,
        title: landlord.fullName,
        subtitle: `Landlord account · ${landlord.city}`,
        route: `/admin/accounts/${landlord.id}`,
      });
    }
  }

  for (const listing of db.listings) {
    const landlord = getLandlord(db, listing.landlordId);
    const haystack = `${listing.title} ${listing.city} ${listing.address} ${landlord?.fullName ?? ''}`;
    if (matchesQuery(haystack, needle)) {
      results.push({
        kind: 'listing',
        id: listing.id,
        title: listing.title,
        subtitle: `Listing · ${landlord?.fullName ?? 'Landlord'}`,
        route: `/admin/moderation/${listing.id}`,
      });
    }
  }

  for (const report of db.reports) {
    const haystack = `${report.reference} ${report.category} ${report.targetLabel} ${report.description}`;
    if (matchesQuery(haystack, needle)) {
      results.push({
        kind: 'report',
        id: report.id,
        title: `${report.reference} · ${report.targetLabel}`,
        subtitle: `Report · ${report.status}`,
        route: `/admin/reports/${report.id}`,
      });
    }
  }

  return results.slice(0, limit);
}

/* -------------------------------------------------------------- analytics */

export interface TurnaroundStat {
  name: string;
  decisions: number;
  averageHours: number;
}

export interface AnalyticsSummary {
  outcomes: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    infoRequested: number;
    resubmitted: number;
    approvalRate: number;
    rejectionRate: number;
  };
  turnaround: {
    decided: number;
    averageHours: number | null;
    medianHours: number | null;
    fastestHours: number | null;
    longestHours: number | null;
    awaitingAverageHours: number | null;
    byAdmin: TurnaroundStat[];
  };
  weekly: { key: string; label: string; submitted: number; decided: number }[];
  listings: Record<ListingStatus, number> & { total: number };
  reports: Record<ReportStatus, number> & { total: number; resolutionRate: number; averageResolutionHours: number | null };
  verificationQueue: Record<VerificationStatus, number> & { total: number };
  moderationActions: { label: string; count: number }[];
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function weekKey(date: Date): string {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

export function analyticsSummary(db: AdminDatabase): AnalyticsSummary {
  const counts = {
    approved: db.applications.filter((app) => app.status === 'approved').length,
    rejected: db.applications.filter((app) => app.status === 'rejected').length,
    pending: db.applications.filter((app) => app.status === 'pending').length,
    infoRequested: db.applications.filter((app) => app.status === 'info_requested').length,
    resubmitted: db.applications.filter((app) => app.status === 'resubmitted').length,
  };
  const total = db.applications.length;

  const durations = db.applications
    .map((app) => hoursBetween(app.submittedAt, app.decidedAt))
    .filter((value): value is number => value !== null && value >= 0);

  const awaitingDurations = db.applications
    .filter((app) => app.decidedAt === null)
    .map((app) => hoursBetween(app.submittedAt, new Date().toISOString()))
    .filter((value): value is number => value !== null);

  const byAdminMap = new Map<string, { name: string; values: number[] }>();
  for (const application of db.applications) {
    if (!application.decidedAt || !application.decidedByName) continue;
    const value = hoursBetween(application.submittedAt, application.decidedAt);
    if (value === null || value < 0) continue;
    const key = application.decidedByName;
    const bucket = byAdminMap.get(key) ?? { name: key, values: [] };
    bucket.values.push(value);
    byAdminMap.set(key, bucket);
  }

  const weeks: { key: string; label: string; submitted: number; decided: number }[] = [];
  for (let index = 5; index >= 0; index -= 1) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - index * 7);
    weeks.push({
      key: start.toISOString().slice(0, 10),
      label: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      submitted: 0,
      decided: 0,
    });
  }
  for (const application of db.applications) {
    const submittedWeek = weekKey(new Date(application.submittedAt));
    const target = weeks.find((week) => week.key === submittedWeek);
    if (target) target.submitted += 1;
    if (application.decidedAt) {
      const decidedWeek = weekKey(new Date(application.decidedAt));
      const decidedTarget = weeks.find((week) => week.key === decidedWeek);
      if (decidedTarget) decidedTarget.decided += 1;
    }
  }

  const listingCounts: Record<ListingStatus, number> = {
    active: 0,
    flagged: 0,
    correction_requested: 0,
    hidden: 0,
  };
  for (const listing of db.listings) listingCounts[listing.status] += 1;

  const reportCounts: Record<ReportStatus, number> = {
    open: 0,
    investigating: 0,
    escalated: 0,
    resolved: 0,
  };
  for (const report of db.reports) reportCounts[report.status] += 1;
  const resolutionDurations = db.reports
    .map((report) => hoursBetween(report.submittedAt, report.resolvedAt))
    .filter((value): value is number => value !== null && value >= 0);

  const queueCounts: Record<VerificationStatus, number> = {
    pending: 0,
    info_requested: 0,
    resubmitted: 0,
    approved: 0,
    rejected: 0,
  };
  for (const application of db.applications) queueCounts[application.status] += 1;

  const actionCounts = new Map<string, number>();
  for (const entry of db.auditLogs) {
    if (!entry.action.startsWith('listing.')) continue;
    actionCounts.set(entry.action, (actionCounts.get(entry.action) ?? 0) + 1);
  }

  return {
    outcomes: {
      total,
      ...counts,
      approvalRate: total ? Math.round((counts.approved / total) * 100) : 0,
      rejectionRate: total ? Math.round((counts.rejected / total) * 100) : 0,
    },
    turnaround: {
      decided: durations.length,
      averageHours: average(durations),
      medianHours: median(durations),
      fastestHours: durations.length ? Math.min(...durations) : null,
      longestHours: durations.length ? Math.max(...durations) : null,
      awaitingAverageHours: average(awaitingDurations),
      byAdmin: [...byAdminMap.values()]
        .map((bucket) => ({
          name: bucket.name,
          decisions: bucket.values.length,
          averageHours: average(bucket.values) ?? 0,
        }))
        .sort((a, b) => b.decisions - a.decisions),
    },
    weekly: weeks,
    listings: { ...listingCounts, total: db.listings.length },
    reports: {
      ...reportCounts,
      total: db.reports.length,
      resolutionRate: db.reports.length
        ? Math.round((reportCounts.resolved / db.reports.length) * 100)
        : 0,
      averageResolutionHours: average(resolutionDurations),
    },
    verificationQueue: { ...queueCounts, total: db.applications.length },
    moderationActions: [
      { label: 'Flagged', count: actionCounts.get('listing.flagged') ?? 0 },
      { label: 'Corrections requested', count: actionCounts.get('listing.correction_requested') ?? 0 },
      { label: 'Hidden', count: actionCounts.get('listing.hidden') ?? 0 },
      { label: 'Restored', count: actionCounts.get('listing.restored') ?? 0 },
    ],
  };
}

/** Cases that have been waiting longer than the 48-hour target. */
export function overdueReports(db: AdminDatabase, targetHours = 48): ContentReport[] {
  return db.reports.filter((report) => {
    if (report.status === 'resolved') return false;
    const waiting = hoursBetween(report.submittedAt, new Date().toISOString());
    return waiting !== null && waiting > targetHours;
  });
}

/* ------------------------------------------------------------- audit logs */

export interface AuditFilters {
  query?: string;
  action?: AuditAction | 'all';
  actorId?: string | 'all';
  range?: DateRange;
}

export function filterAuditLogs(db: AdminDatabase, filters: AuditFilters = {}): AuditLogEntry[] {
  const query = (filters.query ?? '').trim().toLowerCase();
  const range = filters.range ?? 'all';

  return db.auditLogs.filter((entry) => {
    if (filters.action && filters.action !== 'all' && entry.action !== filters.action) return false;
    if (filters.actorId && filters.actorId !== 'all' && entry.actorId !== filters.actorId) return false;
    if (!isWithinRange(entry.at, range)) return false;
    if (!query) return true;
    const haystack = `${entry.actorName} ${entry.targetLabel} ${entry.reason ?? ''} ${entry.action}`;
    return haystack.toLowerCase().includes(query);
  });
}
