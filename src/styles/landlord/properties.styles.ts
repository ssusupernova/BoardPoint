import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

export const propertyStyles = StyleSheet.create({
  headerAction: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionPressed: {
    opacity: 0.75,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  headerTextColFlex: {
    justifyContent: 'center',
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
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
    gap: 8,
  },
  roomsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
    marginBottom: 4,
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#FAF7F3',
  },
  roomNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  roomTenant: {
    fontSize: 11,
    color: LANDLORD_THEME.textSecondary,
  },
  roomAvailableText: {
    fontSize: 11,
    color: LANDLORD_THEME.primary,
  },
});

export default function PropertiesStyleRoute() {
  return null;
}
