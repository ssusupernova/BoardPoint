import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const propertyListStyles = StyleSheet.create({
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerAction: {
    backgroundColor: LANDLORD_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: LANDLORD_THEME.textPrimary,
    paddingVertical: 0,
  },

  // Filter chips
  chipsRow: {
    gap: 8,
    paddingTop: 12,
  },
  chipsRowSpaced: {
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.primary,
  },
  chipInactive: {
    backgroundColor: LANDLORD_THEME.surface,
    borderColor: LANDLORD_THEME.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  chipTextInactive: {
    color: LANDLORD_THEME.textSecondary,
  },

  // Cards
  listContainer: {
    marginTop: 14,
  },
  card: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  coverWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  cover: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    backgroundColor: LANDLORD_THEME.borderSubtle,
  },
  coverPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.textSecondary,
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.borderSubtle,
  },
  countPillPeach: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  countPillBlue: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
  },
  countPillTextPeach: {
    color: LANDLORD_THEME.badgePeachText,
  },
  countPillTextBlue: {
    color: LANDLORD_THEME.badgeBlueText,
  },

  // Card actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.primary,
  },
  actionButtonPrimary: {
    backgroundColor: LANDLORD_THEME.primary,
    borderColor: LANDLORD_THEME.primary,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  actionButtonTextPrimary: {
    color: LANDLORD_THEME.onPrimary,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  emptyButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
});
