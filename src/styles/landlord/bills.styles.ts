import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

export const billStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackBtnPressed: {
    opacity: 0.7,
  },
  headerTextCol: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 6,
  },
  filterChip: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  filterChipInactive: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  filterChipTextInactive: {
    color: LANDLORD_THEME.textSecondary,
  },
  listContainer: {
    marginTop: 10,
  },
  emptyList: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  billHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: LANDLORD_THEME.primary,
  },
  billAmountPaid: {
    color: LANDLORD_THEME.textPrimary,
  },
  tenantName: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  dueDateUrgent: {
    color: '#D15828',
  },
  periodText: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionBtnBlue: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  actionBtnPressed: {
    opacity: 0.75,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  actionBtnTextBlue: {
    color: LANDLORD_THEME.badgeBlueText,
  },
});

export default function BillsStyleRoute() {
  return null;
}
