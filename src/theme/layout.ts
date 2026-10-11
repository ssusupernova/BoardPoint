/**
 * Shared layout metrics for full-screen scaffolds.
 *
 * Centralizes the previously duplicated magic numbers in `screenScaffold`
 * (auth/welcome screens) and `ScreenContainer` (app screens) so page widths and
 * padding are defined in one place.
 */
export const layout = {
  /** Centered content column used by app screens (ScreenContainer). */
  contentMaxWidth: 520,
  /** Slightly narrower column used by the auth/welcome screens. */
  authMaxWidth: 440,
  /** Horizontal page padding for app screens. */
  contentPaddingHorizontal: 20,
  /** Horizontal page padding for auth/welcome screens. */
  authPaddingHorizontal: 24,
} as const;
