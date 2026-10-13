import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

/** Shared styles for the landlord Notifications Center and preferences. */
export const notificationStyles = StyleSheet.create({
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  unreadBadge: {
    minWidth: 24,
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 7,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },
  headerActionBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBtnPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  headerActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primary,
  },

  /* All / Unread filter */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  filterChipActive: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.badgePeachBg,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  filterChipTextActive: {
    color: LANDLORD_THEME.badgePeachText,
  },

  /* Needs attention reminders */
  attentionCard: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
    borderWidth: 1,
    borderColor: '#F6D9C8',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
  },
  attentionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F6D9C8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  attentionRowLast: {
    marginBottom: 0,
  },
  attentionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgeUrgentText,
  },
  attentionBody: {
    flex: 1,
  },
  attentionRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  attentionRowMeta: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  attentionAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },

  /* Group labels */
  groupLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },

  /* Notification cards */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  cardPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  cardUnread: {
    borderColor: LANDLORD_THEME.primaryLight,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUrgent: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    lineHeight: 19,
  },
  cardTitleUnread: {
    fontWeight: '800',
  },
  cardDetail: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  cardTime: {
    fontSize: 11,
    color: LANDLORD_THEME.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  cardChevron: {
    alignSelf: 'center',
  },

  /* Empty state */
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  /* Preferences screen */
  prefIntroCard: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  prefIntroText: {
    fontSize: 12.5,
    color: LANDLORD_THEME.badgePeachText,
    lineHeight: 18,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  prefIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  prefDesc: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  prefFooterCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    gap: 8,
  },
  prefFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  prefFooterText: {
    flex: 1,
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    lineHeight: 17,
  },

  /* Loading */
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
  },
});

export default function NotificationsStyleRoute() {
  return null;
}
