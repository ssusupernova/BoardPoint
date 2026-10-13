import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const roomDetailsStyles = StyleSheet.create({
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
    fontWeight: '600',
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  notFoundBody: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LANDLORD_THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editButtonPressed: {
    opacity: 0.85,
  },
  editButtonText: {
    color: LANDLORD_THEME.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Hero
  hero: {
    flexDirection: 'row',
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  heroImage: {
    width: 104,
    height: 104,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  heroPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  heroRent: {
    fontSize: 19,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  heroRentUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.textMuted,
  },
  heroOccupancy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroOccupancyText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeBlueText,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: LANDLORD_THEME.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
  },
  tabTextActive: {
    color: LANDLORD_THEME.onPrimary,
  },

  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: LANDLORD_THEME.textSecondary,
  },
  mutedText: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.badgePeachText,
  },

  // Capacity
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  capacityValue: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  capacityLabel: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    textAlign: 'center',
  },
  capacityDivider: {
    width: 1,
    height: 34,
    backgroundColor: LANDLORD_THEME.border,
  },

  // Chips (availability)
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  chipInactive: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  chipTextInactive: {
    color: LANDLORD_THEME.textMuted,
  },

  // Property link card
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyCopy: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  propertyAddress: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },

  // Empty states
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 22,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 2,
  },
  emptyBody: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Tenants
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  tenantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  tenantCopy: {
    flex: 1,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  tenantMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Bills
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  billCopy: {
    flex: 1,
  },
  billPeriod: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  billMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  billRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  billAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
});
