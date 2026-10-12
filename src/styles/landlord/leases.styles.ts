import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

export const leaseStyles = StyleSheet.create({
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
  propertyRoomTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  leaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  actionButton: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionButtonPressed: {
    opacity: 0.75,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 18,
  },
  addIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardBody: {
    flex: 1,
  },
  addCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  addCardText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LANDLORD_THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonText: {
    color: LANDLORD_THEME.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default function LeasesStyleRoute() {
  return null;
}
