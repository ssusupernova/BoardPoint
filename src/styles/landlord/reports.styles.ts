import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

/** Shared styles for the landlord Reports screen. */
export const reportStyles = StyleSheet.create({
  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 8,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackBtnPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  headerTextCol: {
    flex: 1,
  },

  /* Filters */
  filtersCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 16,
    marginTop: 16,
  },
  selectorLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  selectorLabelFirst: {
    marginTop: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  activeFilters: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  categoriesNote: {
    fontSize: 11.5,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
    marginTop: 8,
  },

  /* Section shells */
  section: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  sectionCaption: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
    marginTop: 4,
  },

  /* Summary cards */
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  summaryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: LANDLORD_THEME.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: LANDLORD_THEME.textMuted,
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  summaryValuePrimary: {
    color: LANDLORD_THEME.primaryDark,
  },
  summaryValueUrgent: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  summaryValueBlue: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  summaryCaption: {
    fontSize: 10.5,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
  },

  /* List rows */
  list: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  rowSub: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  rowAmountUrgent: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  rowAmountBlue: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  rowAmountMuted: {
    color: LANDLORD_THEME.textSecondary,
  },

  /* Status pills */
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillPaid: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  pillPaidText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeBlueText,
  },
  pillUrgent: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  pillUrgentText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  pillPending: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  pillPendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },
  pillNeutral: {
    backgroundColor: LANDLORD_THEME.background,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  pillNeutralText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.textSecondary,
  },

  /* Simple proportional bars (expenses + occupancy) */
  barRow: {
    marginTop: 10,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.background,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  barFillPrimary: {
    backgroundColor: LANDLORD_THEME.primary,
  },
  barCaption: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 4,
  },

  /* Empty states */
  empty: {
    backgroundColor: LANDLORD_THEME.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 14,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  emptyBody: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
  },

  /* No-data overall state */
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13.5,
    color: LANDLORD_THEME.textSecondary,
  },
});
