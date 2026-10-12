/**
 * Property moderation — deliberately separate from landlord verification, so a
 * verified landlord's listings can still be flagged, corrected or hidden.
 */
import { requirePermission } from './actor';
import { appendAudit } from './audit';
import { notifyLandlord } from './notifications';
import { mutateAdminDatabase, newId, roundTrip } from './store';
import type { AdminDatabase, AdminProfile, FlagKind, PropertyListing } from './types';

function loadListing(db: AdminDatabase, listingId: string): PropertyListing {
  const listing = db.listings.find((entry) => entry.id === listingId);
  if (!listing) throw new Error('That listing no longer exists.');
  return listing;
}

function listingLabel(db: AdminDatabase, listing: PropertyListing): string {
  const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
  return `${listing.title} · ${landlord?.fullName ?? 'Landlord'}`;
}

function addModerationEvent(
  listing: PropertyListing,
  actor: AdminProfile,
  action: 'flagged' | 'correction_requested' | 'hidden' | 'restored',
  reason: string | null
): void {
  listing.moderationHistory = [
    ...listing.moderationHistory,
    { id: newId('mod'), at: new Date().toISOString(), actorName: actor.fullName, action, reason },
  ];
  listing.updatedAt = new Date().toISOString();
}

export interface FlagListingInput {
  listingId: string;
  actor: AdminProfile;
  kind: FlagKind;
  reason: string;
  duplicateOfId?: string | null;
}

export async function flagListing(input: FlagListingInput): Promise<PropertyListing> {
  requirePermission(input.actor, 'moderation.manage');
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new Error('Describe what looks wrong with this listing — the reason is kept in the audit log.');
  }
  await roundTrip();

  let result: PropertyListing | null = null;

  await mutateAdminDatabase((db) => {
    const listing = loadListing(db, input.listingId);
    if (listing.status === 'hidden') {
      throw new Error('This listing is hidden. Restore it before flagging it again.');
    }

    listing.status = 'flagged';
    listing.flags = [
      ...listing.flags,
      {
        id: newId('flg'),
        kind: input.kind,
        reason,
        duplicateOfId: input.duplicateOfId ?? null,
        at: new Date().toISOString(),
        byName: input.actor.fullName,
      },
    ];
    addModerationEvent(listing, input.actor, 'flagged', reason);

    appendAudit(
      db,
      input.actor,
      'listing.flagged',
      { type: 'listing', id: listing.id, label: listingLabel(db, listing) },
      { reason, metadata: { kind: input.kind } }
    );

    result = listing;
  });

  if (!result) throw new Error('The flag could not be saved. Please try again.');
  return result;
}

export interface RequestCorrectionInput {
  listingId: string;
  actor: AdminProfile;
  message: string;
}

export async function requestListingCorrection(
  input: RequestCorrectionInput
): Promise<PropertyListing> {
  requirePermission(input.actor, 'moderation.manage');
  const message = input.message.trim();
  if (message.length < 8) {
    throw new Error('Tell the landlord exactly what needs to change.');
  }
  await roundTrip();

  let result: PropertyListing | null = null;

  await mutateAdminDatabase((db) => {
    const listing = loadListing(db, input.listingId);
    if (listing.status === 'hidden') {
      throw new Error('This listing is hidden. Restore it before requesting corrections.');
    }

    listing.status = 'correction_requested';
    addModerationEvent(listing, input.actor, 'correction_requested', message);

    const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
    appendAudit(
      db,
      input.actor,
      'listing.correction_requested',
      { type: 'listing', id: listing.id, label: listingLabel(db, listing) },
      { reason: message }
    );

    if (landlord) {
      notifyLandlord(db, {
        landlordId: landlord.id,
        kind: 'correction_requested',
        title: `Corrections needed on ${listing.title}`,
        body: message,
        nextSteps: 'Update the listing and resubmit it for another review.',
      });
    }

    result = listing;
  });

  if (!result) throw new Error('The correction request could not be saved. Please try again.');
  return result;
}

export interface HideListingInput {
  listingId: string;
  actor: AdminProfile;
  reason: string;
}

export async function hideListing(input: HideListingInput): Promise<PropertyListing> {
  requirePermission(input.actor, 'moderation.manage');
  const reason = input.reason.trim();
  if (reason.length < 8) {
    throw new Error('A reason of at least 8 characters is required before hiding a listing.');
  }
  await roundTrip();

  let result: PropertyListing | null = null;

  await mutateAdminDatabase((db) => {
    const listing = loadListing(db, input.listingId);
    if (listing.status === 'hidden') {
      throw new Error('This listing is already hidden.');
    }

    listing.status = 'hidden';
    addModerationEvent(listing, input.actor, 'hidden', reason);

    const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
    appendAudit(
      db,
      input.actor,
      'listing.hidden',
      { type: 'listing', id: listing.id, label: listingLabel(db, listing) },
      { reason }
    );

    if (landlord) {
      notifyLandlord(db, {
        landlordId: landlord.id,
        kind: 'listing_hidden',
        title: `${listing.title} was hidden`,
        body: reason,
        nextSteps: 'Fix the issue described above, then contact support to request a restore.',
      });
    }

    result = listing;
  });

  if (!result) throw new Error('The listing could not be hidden. Please try again.');
  return result;
}

export interface RestoreListingInput {
  listingId: string;
  actor: AdminProfile;
  note?: string;
}

export async function restoreListing(input: RestoreListingInput): Promise<PropertyListing> {
  requirePermission(input.actor, 'moderation.manage');
  const note = input.note?.trim() || null;
  await roundTrip();

  let result: PropertyListing | null = null;

  await mutateAdminDatabase((db) => {
    const listing = loadListing(db, input.listingId);
    if (listing.status === 'active') {
      throw new Error('This listing is already live.');
    }

    const previousFlagCount = listing.flags.length;
    listing.status = 'active';
    listing.flags = [];
    addModerationEvent(listing, input.actor, 'restored', note);

    const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
    appendAudit(
      db,
      input.actor,
      'listing.restored',
      { type: 'listing', id: listing.id, label: listingLabel(db, listing) },
      { reason: note, metadata: { previousFlags: previousFlagCount } }
    );

    if (landlord) {
      notifyLandlord(db, {
        landlordId: landlord.id,
        kind: 'listing_restored',
        title: `${listing.title} is live again`,
        body: note ?? 'Your listing passed the follow-up review and is visible to renters again.',
        nextSteps: 'Keep the listing details accurate to avoid another review.',
      });
    }

    result = listing;
  });

  if (!result) throw new Error('The listing could not be restored. Please try again.');
  return result;
}
