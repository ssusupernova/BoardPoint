import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

/** Shared styles for the Shared Expenses & Automated Billing module. */
export const expenseStyles = StyleSheet.create({
  /* Screen scaffolding */
  pageHead: {
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  pageSub: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  /* Selector chips (property / period / category / method) */
  selectorLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  chipActive: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.badgePeachBg,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  chipTextActive: {
    color: LANDLORD_THEME.badgePeachText,
  },

  /* Dashboard summary — spec peach #FDECD8 = badgePeachBg */
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
  },
  totalCard: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  totalCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 6,
  },
  totalCardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 6,
  },
  summaryCaption: {
    fontSize: 11,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
  },
  totalCardCaption: {
    fontSize: 11.5,
    color: LANDLORD_THEME.badgePeachText,
    marginTop: 4,
  },

  /* Billing-status banner */
  statusBanner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
  },
  statusBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  statusNone: {
    backgroundColor: LANDLORD_THEME.surface,
    borderColor: LANDLORD_THEME.border,
  },
  statusNoneText: {
    color: LANDLORD_THEME.textSecondary,
  },
  statusDraft: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.badgePeachBg,
  },
  statusDraftText: {
    color: LANDLORD_THEME.badgePeachText,
  },
  statusFinalized: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
    borderColor: LANDLORD_THEME.badgeBlueBg,
  },
  statusFinalizedText: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  statusMixed: {
    backgroundColor: LANDLORD_THEME.surface,
    borderColor: LANDLORD_THEME.primaryLight,
  },
  statusMixedText: {
    color: LANDLORD_THEME.primaryDark,
  },

  /* Section heads */
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
  },

  /* Expense cards */
  expenseCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  expenseCardPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  expenseTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },
  expenseMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  expenseMethod: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    flexShrink: 1,
  },
  expenseLink: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primary,
  },

  /* Allocation breakdown (shared component) */
  allocCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  allocHead: {
    fontSize: 13,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  allocHint: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
  },
  allocTableHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.border,
  },
  allocTableHeadText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  allocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  allocTenant: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  allocRoom: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  allocAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  allocTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginTop: 2,
  },
  allocTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: LANDLORD_THEME.textSecondary,
  },
  allocTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  allocTotalValueBad: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  roundingNote: {
    fontSize: 11,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  roundingNoteBad: {
    color: LANDLORD_THEME.badgeUrgentText,
    fontStyle: 'normal',
    fontWeight: '700',
  },

  /* Add / edit expense form extras (fields/buttons come from propertyFormStyles) */
  pesoPrefix: {
    fontSize: 14.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
    marginRight: 6,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    backgroundColor: LANDLORD_THEME.surface,
    marginTop: 8,
  },
  tenantRowActive: {
    borderColor: LANDLORD_THEME.primary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  tenantBox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LANDLORD_THEME.surface,
  },
  tenantBoxActive: {
    backgroundColor: LANDLORD_THEME.primary,
    borderColor: LANDLORD_THEME.primary,
  },
  tenantBoxMark: {
    color: LANDLORD_THEME.onPrimary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  tenantInfo: {
    flex: 1,
    minWidth: 0,
  },
  tenantName: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  tenantMeta: {
    fontSize: 11,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 1,
  },
  customAmountInput: {
    width: 96,
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    backgroundColor: LANDLORD_THEME.surface,
  },

  /* Attachment picker */
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: LANDLORD_THEME.primaryLight,
    backgroundColor: LANDLORD_THEME.surface,
  },
  attachButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  attachThumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    backgroundColor: LANDLORD_THEME.surface,
  },
  attachThumbImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  attachThumbIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachThumbName: {
    flex: 1,
    fontSize: 12,
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  attachRemove: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  attachRemoveText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeUrgentText,
  },

  /* Statements screen */
  genCard: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  genTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },
  genHint: {
    fontSize: 11.5,
    color: LANDLORD_THEME.badgePeachText,
    marginTop: 3,
    lineHeight: 16,
  },
  genFields: {
    gap: 10,
    marginTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCol: {
    flex: 1,
  },
  statementCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  statementCardPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  statementTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  statementName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  statementMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  statementPeriod: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
  },
  statementTotals: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statementTotalCol: {
    flex: 1,
    backgroundColor: LANDLORD_THEME.background,
    borderRadius: 10,
    padding: 8,
  },
  statementTotalLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statementTotalValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 2,
  },
  statementTotalValueDue: {
    color: LANDLORD_THEME.primaryDark,
  },

  /* Status pills: Estimated (peach) / Finalized (blue) */
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pillDraft: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  pillDraftText: {
    color: LANDLORD_THEME.badgePeachText,
  },
  pillFinalized: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  pillFinalizedText: {
    color: LANDLORD_THEME.badgeBlueText,
  },

  /* Statement detail — itemised rows */
  detailHeadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  detailSub: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
  },
  estimateBanner: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  estimateBannerText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.badgePeachText,
  },
  lockedBanner: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  lockedBannerText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.badgeBlueText,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  lineLabel: {
    fontSize: 13,
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  lineNote: {
    fontSize: 10.5,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  lineAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  lineAmountCredit: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginTop: 4,
  },
  totalRowLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: LANDLORD_THEME.textSecondary,
  },
  totalRowValue: {
    fontSize: 17,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  metaLabel: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  metaValueAlert: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  metaValueGood: {
    color: LANDLORD_THEME.badgeBlueText,
  },

  /* Corrections */
  correctionCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  correctionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  correctionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  correctionAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  correctionAmountCredit: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  correctionReason: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  correctionAt: {
    fontSize: 10.5,
    color: LANDLORD_THEME.textMuted,
    marginTop: 4,
  },

  /* Shared layout bits */
  actionStack: {
    gap: 10,
    marginTop: 16,
  },
  secondaryAction: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    backgroundColor: LANDLORD_THEME.surface,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  dangerAction: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  dangerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  emptyCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 16,
    padding: 20,
    marginTop: 14,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  missing: {
    fontSize: 14,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 21,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
  },
});

export default function ExpensesStyleRoute() {
  return null;
}
