/**
 * Palette for the landlord flow.
 *
 * Kept separate from the global theme so the landlord screens can match the
 * warm cream / caramel design spec exactly without touching the sign-in and
 * dashboard screens.
 */
export const landlordColors = {
  background: '#FFF5E8',
  surface: '#FFFDFC',
  surfacePressed: '#F7EFE3',
  primary: '#C17D3F',
  primaryPressed: '#A96A33',
  onPrimary: '#FFFFFF',
  textPrimary: '#493326',
  textSecondary: '#8A7566',
  border: '#EFE3D3',
  borderStrong: '#E4D6C3',
  decorativeShape: '#D9E4F0',
  iconStrong: '#1E1A16',
} as const;
