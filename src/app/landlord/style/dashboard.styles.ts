import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

export const dashboardStyles = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  logoIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellButtonPressed: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: LANDLORD_THEME.primary,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: LANDLORD_THEME.onPrimary,
  },

  // Greeting
  greetingBlock: {
    marginBottom: 18,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
  },

  // Summary cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryCardPressed: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryIconInfo: {
    backgroundColor: '#E4F1F8',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },

  // Billing summary
  billingCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  billingCardPressed: {
    backgroundColor: '#FBF8F5',
  },
  billingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  billingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  billingLink: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  billingRows: {
    marginTop: 12,
    gap: 10,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  billingRowLabel: {
    flex: 1,
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
  },
  billingRowValue: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  billingRowValuePrimary: {
    color: LANDLORD_THEME.primaryDark,
  },
  billingRowValueAlert: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  billingNote: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
  },

  // Section headers
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },

  // Properties
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  propertyThumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  propertyThumbImage: {
    width: '100%',
    height: '100%',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  propertyLocation: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  propertyCounts: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
  },
  propertyCountsAccent: {
    color: LANDLORD_THEME.primaryDark,
  },

  // Recent activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconInfo: {
    backgroundColor: '#E4F1F8',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  activityDetail: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 3,
  },

  // Payments / balances rows
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  paymentMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  dueChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  dueChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  overdueChip: {
    backgroundColor: '#FDEEE6',
  },
  overdueChipText: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.4,
  },
  balanceMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  viewDetailsButtonPressed: {
    opacity: 0.75,
  },
  viewDetailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },

  // Quick actions
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  quickActionPressed: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.primary,
  },
  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    textAlign: 'center',
  },

  // Empty states
  emptyCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    paddingHorizontal: 20,
    paddingVertical: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LANDLORD_THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    marginTop: 16,
  },
  emptyButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  inlineEmpty: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // Rental requests
  requestCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 14,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  requestMeta: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  requestRent: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  requestAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  requestActionApprove: {
    backgroundColor: LANDLORD_THEME.primary,
  },
  requestActionApprovePressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  requestActionDecline: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  requestActionDeclinePressed: {
    backgroundColor: LANDLORD_THEME.border,
  },
  requestActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  requestActionTextDecline: {
    color: LANDLORD_THEME.primaryDark,
  },
  requestEmpty: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default function DashboardStyleRoute() {
  return null;
}
