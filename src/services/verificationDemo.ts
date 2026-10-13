/**
 * Temporary landlord-verification submission.
 *
 * STUB ONLY — there is no backend. This simulates a short network round trip
 * so the UI can show a realistic loading state before confirming the demo.
 *
 * To go live later, replace the body of `submitLandlordVerification` with a
 * real call (e.g. Supabase insert into a `verification_applications` table)
 * and keep the same signature — the verification screen won't need changes.
 */

export interface LandlordVerificationPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  idNumber: string;
}

export const VERIFICATION_DEMO_NOTICE =
  'This is a temporary frontend demonstration — your application was not sent to a server, and no administrator has received it yet.';

export const VERIFICATION_SUCCESS_MESSAGE =
  'Your landlord verification application has been submitted successfully. Our admin team will review your information.';

/** Simulates submitting the application; resolves when the "round trip" ends. */
export async function submitLandlordVerification(
  _payload: LandlordVerificationPayload
): Promise<void> {
  // TODO(backend): replace with the real submission (Supabase / API).
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
