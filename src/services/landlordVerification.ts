import { supabase } from '@/backend/config/supabase';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useState } from 'react';

export type LandlordVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'more_information_requested'
  | 'approved'
  | 'rejected';

export type LandlordVerificationDocumentKind =
  | 'id_front'
  | 'id_back'
  | 'selfie'
  | 'proof_of_address'
  | 'ownership_proof';

export interface SelectedVerificationDocument {
  base64: string;
  name?: string | null;
  mimeType?: string | null;
}

export interface LandlordVerificationPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  documents: Partial<Record<LandlordVerificationDocumentKind, SelectedVerificationDocument>>;
}

interface VerificationStatusRow {
  status: LandlordVerificationStatus;
  reviewer_notes: string | null;
}

interface VerificationSnapshot {
  status: LandlordVerificationStatus | null;
  reviewerNotes: string | null;
}

const verificationCache = new Map<string, VerificationSnapshot>();
const verificationListeners = new Set<
  (userId: string, snapshot: VerificationSnapshot) => void
>();
const REQUIRED_DOCUMENTS: LandlordVerificationDocumentKind[] = [
  'id_front',
  'id_back',
  'selfie',
  'proof_of_address',
];
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function verificationError(error: unknown): Error {
  return error instanceof Error ? error : new Error('The verification request failed.');
}

function publishVerification(userId: string, snapshot: VerificationSnapshot): void {
  verificationCache.set(userId, snapshot);
  for (const listener of verificationListeners) listener(userId, snapshot);
}

export async function getLandlordVerification(
  userId: string
): Promise<VerificationSnapshot> {
  const { data, error } = await supabase
    .from('landlord_verification_applications')
    .select('status, reviewer_notes')
    .eq('landlord_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle<VerificationStatusRow>();

  if (error) throw new Error(`Could not load landlord verification status: ${error.message}`);
  const snapshot = {
    status: data?.status ?? null,
    reviewerNotes: data?.reviewer_notes ?? null,
  };
  publishVerification(userId, snapshot);
  return snapshot;
}

export function assertLandlordWriteAccess(userId: string): void {
  if (verificationCache.get(userId)?.status !== 'approved') {
    throw new Error('Your landlord account is in view-only mode until verification is approved.');
  }
}

export function useLandlordVerification(userId: string | undefined) {
  const [status, setStatus] = useState<LandlordVerificationStatus | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const listener = (updatedUserId: string, snapshot: VerificationSnapshot) => {
      if (updatedUserId !== userId) return;
      setStatus(snapshot.status);
      setReviewerNotes(snapshot.reviewerNotes);
      setError(null);
    };
    verificationListeners.add(listener);
    return () => {
      verificationListeners.delete(listener);
    };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setReviewerNotes(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snapshot = await getLandlordVerification(userId);
      setStatus(snapshot.status);
      setReviewerNotes(snapshot.reviewerNotes);
    } catch (loadError) {
      setError(verificationError(loadError).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return { status, reviewerNotes, loading, error, refresh };
}

function normalizedImageType(mimeType: string | null | undefined): string {
  const normalized = (mimeType ?? 'image/jpeg').toLowerCase();
  return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
}

function fileExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function decodeBase64(value: string): ArrayBuffer {
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('The selected image data is invalid.');
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const output = new Uint8Array(Math.floor((value.length * 3) / 4) - padding);
  let accumulator = 0;
  let bits = 0;
  let offset = 0;

  for (const character of value) {
    if (character === '=') break;
    const digit = alphabet.indexOf(character);
    if (digit < 0) throw new Error('The selected image data is invalid.');
    accumulator = (accumulator << 6) | digit;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[offset++] = (accumulator >> bits) & 0xff;
    }
  }

  return output.buffer;
}

export async function submitLandlordVerification(
  payload: LandlordVerificationPayload,
  userId: string
): Promise<void> {
  for (const kind of REQUIRED_DOCUMENTS) {
    if (!payload.documents[kind]) {
      throw new Error('Upload the front and back of your ID, a selfie holding the ID, and proof of address.');
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from('landlord_verification_applications')
    .select('id, status')
    .eq('landlord_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; status: LandlordVerificationStatus }>();
  if (existingError) throw new Error(`Could not check previous applications: ${existingError.message}`);
  if (existing && ['pending', 'under_review'].includes(existing.status)) {
    throw new Error('Your landlord verification is already waiting for review.');
  }
  if (existing?.status === 'approved') {
    throw new Error('Your landlord account is already verified.');
  }

  const isResubmission = existing?.status === 'more_information_requested';
  const applicationId = isResubmission ? existing.id : Crypto.randomUUID();
  const uploadedPaths: string[] = [];
  let applicationCreated = false;
  let documentRowsCreated = false;

  try {
    if (!isResubmission) {
      const { error: applicationError } = await supabase
        .from('landlord_verification_applications')
        .insert({
          id: applicationId,
          landlord_id: userId,
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          city: payload.city,
          address: payload.address,
          status: 'pending',
        });
      if (applicationError) throw applicationError;
      applicationCreated = true;
    }

    const documentRows: {
      application_id: string;
      document_kind: LandlordVerificationDocumentKind;
      storage_path: string;
    }[] = [];

    for (const [kind, document] of Object.entries(payload.documents) as [
      LandlordVerificationDocumentKind,
      SelectedVerificationDocument,
    ][]) {
      if (!document) continue;

      const mimeType = normalizedImageType(document.mimeType);
      if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
        throw new Error(`${kind.replace(/_/g, ' ')} must be a JPEG, PNG, or WebP image.`);
      }

      const padding = document.base64.endsWith('==') ? 2 : document.base64.endsWith('=') ? 1 : 0;
      const fileSize = Math.floor((document.base64.length * 3) / 4) - padding;
      if (fileSize > MAX_DOCUMENT_BYTES) {
        throw new Error(`${kind.replace(/_/g, ' ')} must be 8 MB or smaller.`);
      }
      if (fileSize <= 0) throw new Error(`The selected ${kind.replace(/_/g, ' ')} file is empty.`);

      const storagePath = `${userId}/${applicationId}/${kind}-${Crypto.randomUUID()}.${fileExtension(mimeType)}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-files')
        .upload(storagePath, decodeBase64(document.base64), {
          contentType: mimeType,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      uploadedPaths.push(storagePath);
      documentRows.push({
        application_id: applicationId,
        document_kind: kind,
        storage_path: storagePath,
      });
    }

    const { error: documentsError } = await supabase
      .from('verification_documents')
      .insert(documentRows);
    if (documentsError) throw documentsError;
    documentRowsCreated = true;
    if (isResubmission) {
      const { error: resubmissionError } = await supabase.rpc(
        'resubmit_landlord_verification',
        {
          p_application_id: applicationId,
          p_full_name: payload.fullName,
          p_email: payload.email,
          p_phone: payload.phone,
          p_city: payload.city,
          p_address: payload.address,
        },
      );
      if (resubmissionError) throw resubmissionError;
    }
    publishVerification(userId, { status: 'pending', reviewerNotes: null });
  } catch (submissionError) {
    const cleanupErrors: string[] = [];
    if (documentRowsCreated && isResubmission) {
      try {
        const { error } = await supabase
          .from('verification_documents')
          .delete()
          .eq('application_id', applicationId)
          .in('storage_path', uploadedPaths);
        if (error) cleanupErrors.push(error.message);
      } catch (cleanupError) {
        cleanupErrors.push(verificationError(cleanupError).message);
      }
    }
    if (uploadedPaths.length > 0) {
      try {
        const { error } = await supabase.storage.from('verification-files').remove(uploadedPaths);
        if (error) cleanupErrors.push(error.message);
      } catch (cleanupError) {
        cleanupErrors.push(verificationError(cleanupError).message);
      }
    }
    if (applicationCreated) {
      try {
        const { error } = await supabase
          .from('landlord_verification_applications')
          .delete()
          .eq('id', applicationId);
        if (error) cleanupErrors.push(error.message);
      } catch (cleanupError) {
        cleanupErrors.push(verificationError(cleanupError).message);
      }
    }
    const originalError = verificationError(submissionError);
    if (cleanupErrors.length > 0) {
      throw new Error(`${originalError.message} Cleanup also failed: ${cleanupErrors.join('; ')}`);
    }
    throw originalError;
  }
}
