import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const tenantDetailsStyles = StyleSheet.create({
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

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 14,
    marginBottom: 12,
  },
  identityAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  identityAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  identityCopy: {
    flex: 1,
    gap: 6,
  },
  identityBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  renewalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  renewalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  identityBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  identityBalanceSettled: {
    fontSize: 13,
    fontWeight: '600',
    color: LANDLORD_THEME.textMuted,
  },

  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LANDLORD_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionButtonGhost: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  actionButtonDanger: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.badgeUrgentText,
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  actionButtonTextGhost: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  actionButtonTextGhostSecondary: {
    color: LANDLORD_THEME.textSecondary,
  },
  actionButtonTextDanger: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  historyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  historyNoteText: {
    flex: 1,
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
  },

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

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
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
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  chipTextInactive: {
    color: LANDLORD_THEME.textMuted,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  formRowItem: {
    flex: 1,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revealText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  bodyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.textMuted,
  },
  bodyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: LANDLORD_THEME.borderSubtle,
    marginVertical: 10,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  assignmentLabel: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
    fontWeight: '600',
  },
  assignmentValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignmentValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  assignmentValueMuted: {
    fontSize: 13.5,
    fontWeight: '600',
    color: LANDLORD_THEME.textMuted,
  },
  assignmentLink: {
    color: LANDLORD_THEME.primaryDark,
  },

  balanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  balanceValueOwed: {
    color: LANDLORD_THEME.badgeUrgentText,
  },
  mutedText: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
  },
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
    gap: 3,
  },
  billPeriod: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  billMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
  },
  billBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 2,
  },
  billBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  billRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  billAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  billAmountPaid: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
  },
  markPaid: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  markPaidText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },

  messageBubble: {
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    maxWidth: '88%',
  },
  messageIn: {
    alignSelf: 'flex-start',
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  messageOut: {
    alignSelf: 'flex-end',
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  messageMeta: {
    fontSize: 10.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
    marginBottom: 2,
  },
  messageBody: {
    fontSize: 13,
    color: LANDLORD_THEME.textPrimary,
    lineHeight: 18,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: LANDLORD_THEME.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: LANDLORD_THEME.textPrimary,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.borderSubtle,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LANDLORD_THEME.primary,
    marginTop: 5,
  },
  timelineCopy: {
    flex: 1,
    gap: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  timelineDetail: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
  },
  timelineAt: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
});
