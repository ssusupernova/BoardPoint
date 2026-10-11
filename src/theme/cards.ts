import type { TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';
import { radii } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fonts } from './typography';

/**
 * Shared card containers so dashboard cards and detail screens stay visually
 * consistent instead of re-declaring the same border/shadow/padding recipe.
 */

/** Elevated card used by hero/summary surfaces (payment, tenancy, bills). */
export const card: ViewStyle = {
  borderRadius: radii.xl,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.lg,
  ...shadows.card,
};

/** Lower-elevation card used by list/section surfaces. */
export const cardSoft: ViewStyle = {
  borderRadius: radii.lg,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.lg,
  ...shadows.subtle,
};

/** Uppercase eyebrow text shared by payment, bill and dashboard labels. */
export const uppercaseLabel: TextStyle = {
  fontFamily: fonts.semibold,
  fontSize: 13,
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
};
