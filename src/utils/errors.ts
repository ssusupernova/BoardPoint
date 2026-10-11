/**
 * Normalizes unknown thrown values into a user-facing message.
 * Errors thrown by the auth service already carry readable copy, so we surface
 * `Error.message` directly and fall back to a generic message otherwise.
 */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
