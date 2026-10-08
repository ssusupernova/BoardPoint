import { colors } from './colors';
import { fonts } from './typography';
import { radii } from './radius';
import { spacing } from './spacing';

/** Shared label style for renter form fields (MoneyInput/SelectField/DateField). */
export const fieldLabel = {
  fontFamily: fonts.semibold,
  fontSize: 14,
  color: colors.textPrimary,
  marginBottom: 8,
};

/** Base container for a 54px form field (also used by LoginInput). */
export const fieldBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  height: 54,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.surface,
  borderRadius: radii.md,
  borderWidth: 1,
  borderColor: colors.border,
};

/** Border tint applied when a field has an error. */
export const fieldError = {
  borderColor: colors.error,
};
