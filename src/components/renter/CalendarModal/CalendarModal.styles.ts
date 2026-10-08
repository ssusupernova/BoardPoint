import { StyleSheet } from 'react-native';
import { colors, spacing, radii, fonts } from '@/theme';

const CELL = 40;

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(66, 43, 31, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPressed: {
    backgroundColor: colors.surfacePressed,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: CELL,
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayCell: {
    width: CELL,
    height: CELL,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayPressed: {
    backgroundColor: colors.surfacePressed,
  },
  dayText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  dayTextToday: {
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
});
