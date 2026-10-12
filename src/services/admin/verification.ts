/**
 * Landlord verification workflow.
 *
 * Approvals are deliberately guarded: an application can only be approved when
 * every required document is present, so no administrator can bypass the
 * document review step. Every decision records the administrator, timestamp and
 * reason in the audit trail and notifies the landlord of the outcome.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { notifyLandlord } from './notifications';
import { mutateAdminDatabase, newId, roundTrip } from './store';
import { documentCompleteness } from './selectors';
import type {
  AdminDatabase,
  AdminProfile,
  VerificationApplication,
  VerificationStatus,
} from './types';

const DECIDABLE: VerificationStatus[] = ['pending', 'info_requested', 'resubmitted'];

function loadApplication(db: AdminDatabase, applicationId: string): VerificationApplication {
  const application = db.applications.find((entry) => entry.id === applicationId);
  if (!application) {
    throw new Error('That verification application no longer exists.');
  }
  return application;
}

function assertDecidable(application: VerificationApplication): void {
  if (!DECIDABLE.includes(application.status)) {
    throw new Error(
      `This application was already ${application.status === 'approved' ? 'approved' : 'rejected'}. Decisions cannot be undone — the landlord must submit a new application.`
    );
  }
}

function landlordOf(db: AdminDatabase, application: VerificationApplication) {
  const landlord = db.landlords.find((entry) => entry.id === application.landlordId);
  if (!landlord) throw new Error('The landlord account linked to this application was not found.');
  return landlord;
}

function applicationLabel(db: AdminDatabase, application: VerificationApplication): string {
  return `${application.reference} · ${landlordOf(db, application).fullName}`;
}

function pushHistory(
  application: VerificationApplication,
  actor: { id: string | null; name: string },
  action: 'assigned' | 'info_requested' | 'documents_reviewed' | 'approved' | 'rejected',
  reason: string | null = null,
  note: string | null = null
): void {
  application.reviewHistory = [
    ...application.reviewHistory,
    {
      id: newId('rev'),
      at: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      action,
      reason,
      note,
    },
  ];
}

export interface ApplicationDecisionInput {
  applicationId: string;
  actor: AdminProfile;
  /** Optional reviewer note stored on the application. */
  note?: string;
}

/** Approves an application — requires every mandatory document to be present. */
export async function approveApplication(
  input: ApplicationDecisionInput
): Promise<VerificationApplication> {
  requirePermission(input.actor, 'verification.decide');
  await roundTrip();

  let result: VerificationApplication | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const application = loadApplication(db, input.applicationId);
    assertDecidable(application);

    const completeness = documentCompleteness(application);
    if (completeness.missing.length > 0) {
      throw new Error(
        `This application is missing ${completeness.missing.length} required document${completeness.missing.length === 1 ? '' : 's'} (${completeness.missing.join(', ')}). Ask the landlord to send them instead of approving.`
      );
    }

    const landlord = landlordOf(db, application);
    application.status = 'approved';
    application.decidedAt = now;
    application.decidedBy = input.actor.id;
    application.decidedByName = input.actor.fullName;
    application.updatedAt = now;
    application.lastReason = input.note?.trim() || null;
    application.internalNote = input.note?.trim() || application.internalNote;
    pushHistory(application, { id: input.actor.id, name: input.actor.fullName }, 'approved');

    landlord.verificationStatus = 'verified';

    appendAudit(
      db,
      input.actor,
      'verification.approved',
      { type: 'application', id: application.id, label: applicationLabel(db, application) },
      { reason: input.note?.trim() || null, metadata: { documents: application.documents.length } }
    );

    notifyLandlord(db, {
      landlordId: landlord.id,
      applicationId: application.id,
      kind: 'approved',
      title: 'Your landlord account is verified',
      body: `Your verification ${application.reference} was approved by ${input.actor.fullName}.`,
      nextSteps: 'You can now publish listings. Each listing is still moderated separately.',
    });

    result = application;
  });

  if (!result) throw new Error('The approval could not be saved. Please try again.');
  return result;
}

export interface RejectApplicationInput extends ApplicationDecisionInput {
  reason: string;
}

/** Rejects an application. A reason is mandatory and is sent to the landlord. */
export async function rejectApplication(input: RejectApplicationInput): Promise<VerificationApplication> {
  requirePermission(input.actor, 'verification.decide');
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new Error('A reason of at least 8 characters is required so the landlord knows what to fix.');
  }
  await roundTrip();

  let result: VerificationApplication | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const application = loadApplication(db, input.applicationId);
    assertDecidable(application);
    const landlord = landlordOf(db, application);

    application.status = 'rejected';
    application.decidedAt = now;
    application.decidedBy = input.actor.id;
    application.decidedByName = input.actor.fullName;
    application.updatedAt = now;
    application.lastReason = reason;
    application.internalNote = input.note?.trim() || application.internalNote;
    pushHistory(application, { id: input.actor.id, name: input.actor.fullName }, 'rejected', reason);

    landlord.verificationStatus = 'rejected';

    appendAudit(
      db,
      input.actor,
      'verification.rejected',
      { type: 'application', id: application.id, label: applicationLabel(db, application) },
      { reason }
    );

    notifyLandlord(db, {
      landlordId: landlord.id,
      applicationId: application.id,
      kind: 'rejected',
      title: 'Verification was not approved',
      body: reason,
      nextSteps: 'Fix the issue described above and submit a new application from your profile.',
    });

    result = application;
  });

  if (!result) throw new Error('The decision could not be saved. Please try again.');
  return result;
}

export interface RequestInformationInput extends ApplicationDecisionInput {
  message: string;
}

/** Asks the landlord for more information and pauses the decision. */
export async function requestAdditionalInformation(
  input: RequestInformationInput
): Promise<VerificationApplication> {
  requirePermission(input.actor, 'verification.decide');
  const message = input.message.trim();
  if (message.length < 8) {
    throw new Error('Describe exactly what the landlord needs to send.');
  }
  await roundTrip();

  let result: VerificationApplication | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const application = loadApplication(db, input.applicationId);
    assertDecidable(application);
    const landlord = landlordOf(db, application);

    application.status = 'info_requested';
    application.decidedAt = null;
    application.decidedBy = null;
    application.decidedByName = null;
    application.updatedAt = now;
    application.lastReason = message;
    pushHistory(application, { id: input.actor.id, name: input.actor.fullName }, 'info_requested', message);

    landlord.verificationStatus = 'info_requested';

    appendAudit(
      db,
      input.actor,
      'verification.info_requested',
      { type: 'application', id: application.id, label: applicationLabel(db, application) },
      { reason: message }
    );

    notifyLandlord(db, {
      landlordId: landlord.id,
      applicationId: application.id,
      kind: 'info_requested',
      title: 'More information is needed for your verification',
      body: message,
      nextSteps: 'Upload the requested document from your profile to continue the review.',
    });

    result = application;
  });

  if (!result) throw new Error('Your request could not be saved. Please try again.');
  return result;
}

export interface ReviewResubmissionInput extends ApplicationDecisionInput {
  note?: string;
}

/**
 * Completes the "review resubmitted documents" step: the application returns
 * to the pending queue so a decision can be made on the fresh documents.
 */
export async function reviewResubmission(
  input: ReviewResubmissionInput
): Promise<VerificationApplication> {
  requirePermission(input.actor, 'verification.decide');
  await roundTrip();

  let result: VerificationApplication | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const application = loadApplication(db, input.applicationId);
    if (application.status !== 'resubmitted') {
      throw new Error('There is no resubmission waiting for review on this application.');
    }

    const completeness = documentCompleteness(application);
    if (completeness.missing.length > 0) {
      throw new Error(
        `${completeness.missing.length} required document${completeness.missing.length === 1 ? ' is' : 's are'} still missing (${completeness.missing.join(', ')}). Request them from the landlord instead.`
      );
    }

    const landlord = landlordOf(db, application);
    application.status = 'pending';
    application.updatedAt = now;
    application.internalNote = input.note?.trim() || application.internalNote;
    pushHistory(
      application,
      { id: input.actor.id, name: input.actor.fullName },
      'documents_reviewed',
      null,
      input.note?.trim() || 'Resubmitted documents reviewed and accepted.'
    );

    landlord.verificationStatus = 'pending';

    appendAudit(
      db,
      input.actor,
      'verification.resubmission_reviewed',
      { type: 'application', id: application.id, label: applicationLabel(db, application) },
      { reason: input.note?.trim() || null, metadata: { documents: application.documents.length } }
    );

    result = application;
  });

  if (!result) throw new Error('The review could not be saved. Please try again.');
  return result;
}

/** Claims an unassigned application for review. */
export async function assignApplication(
  applicationId: string,
  actor: AdminProfile
): Promise<VerificationApplication> {
  requirePermission(actor, 'verification.decide');
  await roundTrip(100);

  let result: VerificationApplication | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const application = loadApplication(db, applicationId);
    if (application.assignedTo === actor.id) {
      throw new Error('You already own this review.');
    }
    application.assignedTo = actor.id;
    application.assignedToName = actor.fullName;
    application.updatedAt = now;
    pushHistory(application, { id: actor.id, name: actor.fullName }, 'assigned');

    appendAudit(
      db,
      actor,
      'verification.assigned',
      { type: 'application', id: application.id, label: applicationLabel(db, application) },
      { metadata: { assignedTo: actor.fullName } }
    );

    result = application;
  });

  if (!result) throw new Error('The assignment could not be saved. Please try again.');
  return result;
}
