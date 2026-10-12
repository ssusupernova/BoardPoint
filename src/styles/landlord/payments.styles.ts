import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

/** Shared styles for the Rent & Payment Management module. */
export const paymentStyles = StyleSheet.create({
  /* Selector chips (property / period / status / method) */
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

  /* Summary grid */
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
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 6,
  },
  summaryValueGood: {
    color: LANDLORD_THEME.primaryDark,
  },
  summaryValueDanger: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  summaryCaption: {
    fontSize: 11,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
  },

  /* Section cards */
  sectionCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  sectionLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primary,
  },
  sectionEmpty: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },

  /* Upcoming due rows */
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  dueName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  dueMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  dueRight: {
    alignItems: 'flex-end',
  },
  dueAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  dueDate: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
  },

  /* Recent payment rows */
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  recentAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeBlueText,
  },
  recentMeta: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },

  /* Derived status badges (see PaymentStatusBadge) */
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
  statusUnpaid: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  statusUnpaidText: {
    color: LANDLORD_THEME.badgePeachText,
  },
  statusPartial: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.primaryLight,
  },
  statusPartialText: {
    color: LANDLORD_THEME.primaryDark,
  },
  statusPaid: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  statusPaidText: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  statusOverdue: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  statusOverdueText: {
    color: LANDLORD_THEME.badgeUrgentText,
  },

  /* Records list */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: LANDLORD_THEME.textPrimary,
    paddingVertical: 0,
  },
  countLine: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 12,
  },
  recordCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  recordCardPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  recordName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  recordWhere: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  recordPeriod: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textMuted,
    marginTop: 2,
  },
  moneyRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  moneyCol: {
    flex: 1,
  },
  moneyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  moneyValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 2,
  },
  moneyValuePaid: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  moneyValueBalance: {
    color: LANDLORD_THEME.primaryDark,
  },
  moneyValueDanger: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  latestLine: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 8,
  },

  /* Record-payment form */
  billPickActive: {
    borderColor: LANDLORD_THEME.primary,
    backgroundColor: LANDLORD_THEME.background,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  reviewLabel: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  reviewValueStrong: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },

  /* Payment details */
  billHeadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
  },
  billSub: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 3,
  },
  billMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textMuted,
    marginTop: 3,
  },
  billAmountBig: {
    fontSize: 24,
    fontWeight: '800',
    color: LANDLORD_THEME.primary,
    marginTop: 10,
  },
  billKind: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  totalBox: {
    flex: 1,
    backgroundColor: LANDLORD_THEME.background,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.borderSubtle,
    borderRadius: 12,
    padding: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 3,
  },
  totalValuePaid: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  totalValueDanger: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  entryCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.borderSubtle,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  methodPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.background,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  methodPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  entryMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 6,
  },
  entryNote: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  recordedAt: {
    fontSize: 10.5,
    color: LANDLORD_THEME.textMuted,
    flexShrink: 1,
  },
  reverseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  reverseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  actionStack: {
    gap: 10,
    marginTop: 16,
  },
  missing: {
    fontSize: 14,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 21,
  },

  /* Shared layout bits */
  rowLeft: {
    flex: 1,
    minWidth: 0,
  },
  dueRowPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  formStack: {
    gap: 14,
  },
  changeBill: {
    marginTop: 10,
  },
  pesoPrefix: {
    fontSize: 14.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
    marginRight: 6,
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

export default function PaymentsStyleRoute() {
  return null;
}
