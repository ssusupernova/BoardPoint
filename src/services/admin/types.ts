/**
 * Domain model for the BoardPoint admin panel.
 *
 * These types mirror the shape a Supabase/Postgres backend would expose
 * (tables + JSON columns), so the services layer can later be pointed at a
 * real backend without touching the screens.
 */

/** The panel has a single administrator role. */
export type AdminRole = 'super_admin';

export type Permission =
  | 'verification.decide'
  | 'accounts.manage'
  | 'moderation.manage'
  | 'reports.manage'
  | 'audit.view'
  | 'settings.manage';

export const ALL_PERMISSIONS: Permission[] = [
  'verification.decide',
  'accounts.manage',
  'moderation.manage',
  'reports.manage',
  'audit.view',
  'settings.manage',
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  'verification.decide': 'Decide landlord verifications',
  'accounts.manage': 'Suspend and reactivate accounts',
  'moderation.manage': 'Moderate property listings',
  'reports.manage': 'Investigate reports and complaints',
  'audit.view': 'Read audit logs',
  'settings.manage': 'Manage admin settings and permissions',
};

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  /** Job title shown in the admin drawer and audit trail. */
  title: string;
  permissions: Permission[];
  createdAt: string;
  lastSignInAt: string | null;
}

/* ------------------------------------------------------------ verification */

export type VerificationStatus =
  | 'pending'
  | 'info_requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected';

export type AccountStatus = 'active' | 'suspended';

/**
 * Verification state as shown on a landlord account. `verified` is the
 * account-level view of an `approved` application.
 */
export type LandlordVerificationState =
  | 'unverified'
  | 'pending'
  | 'info_requested'
  | 'resubmitted'
  | 'verified'
  | 'rejected';

export type DocumentStatus = 'uploaded' | 'missing' | 'rejected' | 'expired';

export type DocumentKind =
  | 'id_front'
  | 'id_back'
  | 'selfie'
  | 'proof_of_address'
  | 'ownership_proof'
  | 'tax_record';

export interface VerificationDocument {
  id: string;
  label: string;
  kind: DocumentKind;
  required: boolean;
  status: DocumentStatus;
  uploadedAt: string | null;
  mimeType: string;
  sizeBytes: number;
  /**
   * Private storage key (e.g. `verifications/<application>/<file>`).
   * Documents are only opened through the audited secure viewer — the key is
   * never turned into a public URL.
   */
  storageKey: string;
  note: string | null;
}

export type ReviewAction =
  | 'submitted'
  | 'assigned'
  | 'info_requested'
  | 'resubmitted'
  | 'documents_reviewed'
  | 'approved'
  | 'rejected';

export interface ReviewEvent {
  id: string;
  at: string;
  actorId: string | null;
  actorName: string;
  action: ReviewAction;
  reason: string | null;
  note: string | null;
}

export interface VerificationApplication {
  id: string;
  reference: string;
  landlordId: string;
  status: VerificationStatus;
  submittedAt: string;
  updatedAt: string;
  resubmittedAt: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  decidedByName: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  documents: VerificationDocument[];
  reviewHistory: ReviewEvent[];
  /** Reason from the most recent decision / information request. */
  lastReason: string | null;
  /** Notes the reviewing admin left on the file. */
  internalNote: string | null;
}

export interface LandlordAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  /** Masked national ID reference — the document itself stays private. */
  idNumberMasked: string;
  joinedAt: string;
  verificationStatus: LandlordVerificationState;
  accountStatus: AccountStatus;
  suspensionReason: string | null;
  suspendedAt: string | null;
  suspendedBy: string | null;
  reactivatedAt: string | null;
}

/* ---------------------------------------------------------------- listings */

export type ListingStatus = 'active' | 'flagged' | 'correction_requested' | 'hidden';

export type FlagKind = 'suspicious' | 'duplicate';

export interface ListingFlag {
  id: string;
  kind: FlagKind;
  reason: string;
  duplicateOfId: string | null;
  at: string;
  byName: string;
}

export interface ModerationEvent {
  id: string;
  at: string;
  actorName: string;
  action: 'flagged' | 'correction_requested' | 'hidden' | 'restored' | 'published';
  reason: string | null;
}

export interface PropertyListing {
  id: string;
  landlordId: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  description: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
  flags: ListingFlag[];
  moderationHistory: ModerationEvent[];
}

/* ----------------------------------------------------------------- reports */

export type ReportCategory =
  | 'fake_listing'
  | 'scam_or_fraud'
  | 'duplicate_listing'
  | 'wrong_information'
  | 'inappropriate_content'
  | 'other';

export type ReportStatus = 'open' | 'investigating' | 'escalated' | 'resolved';

export type ReportTargetType = 'listing' | 'account';

export interface ReportEvent {
  id: string;
  at: string;
  actorName: string;
  action: 'filed' | 'assigned' | 'findings_added' | 'resolved' | 'escalated';
  note: string | null;
}

export interface ContentReport {
  id: string;
  reference: string;
  category: ReportCategory;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  description: string;
  reportedBy: string;
  submittedAt: string;
  status: ReportStatus;
  assignedTo: string | null;
  assignedToName: string | null;
  findings: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  escalatedAt: string | null;
  escalationReason: string | null;
  history: ReportEvent[];
}

/* ------------------------------------------------------------ audit + news */

export type AuditAction =
  | 'verification.assigned'
  | 'verification.info_requested'
  | 'verification.resubmission_reviewed'
  | 'verification.approved'
  | 'verification.rejected'
  | 'account.suspended'
  | 'account.reactivated'
  | 'listing.flagged'
  | 'listing.correction_requested'
  | 'listing.hidden'
  | 'listing.restored'
  | 'report.assigned'
  | 'report.findings_added'
  | 'report.resolved'
  | 'report.escalated'
  | 'document.viewed'
  | 'settings.updated'
  | 'database.reset';

export type AuditTargetType =
  | 'landlord'
  | 'application'
  | 'listing'
  | 'report'
  | 'document'
  | 'admin'
  | 'system';

export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  reason: string | null;
  metadata: Record<string, string | number | boolean> | null;
}

export type NotificationType =
  | 'verification_submitted'
  | 'verification_resubmitted'
  | 'report_filed'
  | 'unresolved_case'
  | 'account_suspended'
  | 'system';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  at: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
  /** Relative route the notification opens, e.g. `/admin/verification/abc`. */
  route: string | null;
}

export type LandlordNoticeKind =
  | 'approved'
  | 'rejected'
  | 'info_requested'
  | 'suspended'
  | 'reactivated'
  | 'listing_hidden'
  | 'listing_restored'
  | 'correction_requested';

/** Message delivered to a landlord after an administrative decision. */
export interface LandlordNotice {
  id: string;
  landlordId: string;
  applicationId: string | null;
  kind: LandlordNoticeKind;
  title: string;
  body: string;
  nextSteps: string | null;
  at: string;
  delivery: 'sent';
}

/* ----------------------------------------------------------- preferences */

export interface AdminPreferences {
  notifyVerification: boolean;
  notifyReports: boolean;
  notifyUnresolved: boolean;
  dailyDigest: boolean;
  /** Auto-lock the admin session after this many minutes of inactivity. */
  autoLockMinutes: number;
  defaultDateRange: DateRange;
}

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface AdminDatabase {
  version: number;
  seededAt: string;
  admins: AdminProfile[];
  landlords: LandlordAccount[];
  applications: VerificationApplication[];
  listings: PropertyListing[];
  reports: ContentReport[];
  auditLogs: AuditLogEntry[];
  notifications: AdminNotification[];
  landlordNotices: LandlordNotice[];
  preferences: AdminPreferences;
}
