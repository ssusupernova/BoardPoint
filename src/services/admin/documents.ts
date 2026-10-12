/**
 * Restricted access to identity documents.
 *
 * Documents are stored under a private key and are never handed out as a URL:
 * the only way to inspect one is this audited viewer, which records who opened
 * it, when, and which file they looked at. Viewing requires the verification
 * permission.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { mutateAdminDatabase, roundTrip } from './store';
import type { AdminDatabase, AdminProfile, VerificationDocument } from './types';

export interface SecureDocumentAccess {
  applicationId: string;
  applicationReference: string;
  landlordName: string;
  document: VerificationDocument;
  viewedAt: string;
  auditEntryId: string;
}

function loadDocument(
  db: AdminDatabase,
  applicationId: string,
  documentId: string
): { document: VerificationDocument; reference: string; landlordName: string } {
  const application = db.applications.find((entry) => entry.id === applicationId);
  if (!application) throw new Error('That verification application no longer exists.');
  const document = application.documents.find((entry) => entry.id === documentId);
  if (!document) throw new Error('That document is no longer attached to this application.');
  const landlord = db.landlords.find((entry) => entry.id === application.landlordId);
  return {
    document,
    reference: application.reference,
    landlordName: landlord?.fullName ?? 'Landlord',
  };
}

export async function openDocumentSecurely(input: {
  applicationId: string;
  documentId: string;
  actor: AdminProfile;
}): Promise<SecureDocumentAccess> {
  requirePermission(input.actor, 'verification.decide');
  await roundTrip(120);

  let access: SecureDocumentAccess | null = null;
  const now = new Date().toISOString();

  await mutateAdminDatabase((db) => {
    const { document, reference, landlordName } = loadDocument(
      db,
      input.applicationId,
      input.documentId
    );

    const entry = appendAudit(
      db,
      input.actor,
      'document.viewed',
      {
        type: 'document',
        id: document.id,
        label: `${reference} · ${document.label}`,
      },
      {
        reason: 'Opened during a verification review.',
        metadata: { landlord: landlordName, storageKey: document.storageKey },
      }
    );

    access = {
      applicationId: input.applicationId,
      applicationReference: reference,
      landlordName,
      document,
      viewedAt: now,
      auditEntryId: entry.id,
    };
  });

  if (!access) throw new Error('The document could not be opened.');
  return access;
}
