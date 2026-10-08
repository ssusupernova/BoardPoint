import { StyleSheet } from 'react-native';
import { spacing } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  budgetSlot: {
    flex: 1,
    minWidth: 0,
  },
  roomSlot: {
    flex: 1.4,
    minWidth: 0,
  },
  occupantsSlot: {
    flex: 1,
    minWidth: 0,
  },
  dateWrap: {
    marginTop: -spacing.sm,
  },
});
