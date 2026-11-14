import { supabase } from '@/backend/config/supabase';

const verificationListeners = new Set<() => void>();

export function subscribeToLiveVerificationUpdates(listener: () => void): () => void {
  verificationListeners.add(listener);
  return () => verificationListeners.delete(listener);
}

export type LiveVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'more_information_requested'
  | 'approved'
  | 'rejected';

export interface LiveVerificationDocument {
  id: string;
  document_kind: string;
  storage_path: string;
  status: string;
  uploaded_at: string;
}

export interface LiveVerificationApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: LiveVerificationStatus;
  reviewer_notes: string | null;
  submitted_at: string;
  documents: LiveVerificationDocument[];
}

export async function listLiveVerificationApplications(): Promise<LiveVerificationApplication[]> {
  const { data: applications, error } = await supabase
    .from('landlord_verification_applications')
    .select('id, full_name, email, phone, city, address, status, reviewer_notes, submitted_at')
    .in('status', ['pending', 'under_review', 'more_information_requested'])
    .order('submitted_at', { ascending: true });

  if (error) throw new Error(`Could not load live verification applications: ${error.message}`);
  if (!applications?.length) return [];

  const applicationIds = applications.map((application) => application.id);
  const { data: documents, error: documentsError } = await supabase
    .from('verification_documents')
    .select('id, application_id, document_kind, storage_path, status, uploaded_at')
    .in('application_id', applicationIds);

  if (documentsError) throw new Error(`Could not load verification document details: ${documentsError.message}`);

  return applications.map((application) => ({
    ...application,
    status: application.status as LiveVerificationStatus,
    documents: (documents ?? [])
      .filter((document) => document.application_id === application.id)
      .map(({ id, document_kind, storage_path, status, uploaded_at }) => ({
        id,
        document_kind,
        storage_path,
        status,
        uploaded_at,
      })),
  }));
}

export async function getLiveVerificationApplication(
  applicationId: string
): Promise<LiveVerificationApplication> {
  const { data: application, error } = await supabase
    .from('landlord_verification_applications')
    .select('id, full_name, email, phone, city, address, status, reviewer_notes, submitted_at')
    .eq('id', applicationId)
    .single();
  if (error) throw new Error(`Could not load the verification application: ${error.message}`);

  const { data: documents, error: documentsError } = await supabase
    .from('verification_documents')
    .select('id, document_kind, storage_path, status, uploaded_at')
    .eq('application_id', applicationId)
    .order('uploaded_at', { ascending: true });
  if (documentsError) throw new Error(`Could not load verification documents: ${documentsError.message}`);

  return {
    ...application,
    status: application.status as LiveVerificationStatus,
    documents: documents ?? [],
  };
}

export async function openLiveVerificationDocument(input: {
  applicationId: string;
  documentId: string;
  storagePath: string;
}): Promise<string> {
  const { error: auditError } = await supabase.rpc('admin_log_verification_document_view', {
    p_application_id: input.applicationId,
    p_document_id: input.documentId,
  });
  if (auditError) throw new Error(`Could not record document access: ${auditError.message}`);

  const { data, error } = await supabase.storage
    .from('verification-files')
    .createSignedUrl(input.storagePath, 60);
  if (error) throw new Error(`Could not open the private verification document: ${error.message}`);
  return data.signedUrl;
}

export async function decideLiveVerificationApplication(input: {
  applicationId: string;
  decision: 'approved' | 'rejected' | 'more_information_requested';
  reason?: string;
}): Promise<void> {
  const { error } = await supabase.rpc('admin_review_landlord_verification', {
    p_application_id: input.applicationId,
    p_decision: input.decision,
    p_reason: input.reason ?? null,
  });
  if (error) throw new Error(`Could not save the admin decision: ${error.message}`);
  for (const listener of verificationListeners) listener();
}
