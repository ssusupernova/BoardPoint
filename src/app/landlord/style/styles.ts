import { StyleSheet } from 'react-native';

export const LANDLORD_THEME = {
  background: '#FAF6F0',
  surface: '#FFFDFA',
  border: '#EFE7DE',
  borderSubtle: '#F4EFEA',
  primary: '#BF7E4A',
  primaryLight: '#D9A877',
  primaryPressed: '#A96A3D',
  /** Darker caramel for small primary-coloured text (keeps contrast AA). */
  primaryDark: '#8E5526',
  onPrimary: '#FFFFFF',
  textPrimary: '#4A3425',
  textSecondary: '#6B5E55',
  textMuted: '#9E948C',
  badgePeachBg: '#FDECD8',
  badgePeachText: '#8E5526',
  badgeBlueBg: '#93C5E2',
  badgeBlueText: '#164A66',
  badgeUrgentBg: '#FDEEE6',
  badgeUrgentText: '#CE5726',
  tabBarBg: '#FFFDFA',
  tabBarBorder: '#EFEAE3',
  tabInactive: '#8A7D73',
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LANDLORD_THEME.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  // Brand Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  logoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: LANDLORD_THEME.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // Greeting Card
  greetingCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  greetingTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 6,
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LANDLORD_THEME.textSecondary,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  metricValuePrimary: {
    color: LANDLORD_THEME.primary,
  },
  metricSub: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 3,
  },

  // Soft highlight pills
  pillPeach: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillPeachText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  pillBlue: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillBlueText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeBlueText,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },

  // General Card Item
  cardItem: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardItemPressed: {
    backgroundColor: '#FBF8F5',
  },
  cardItemHighlighted: {
    borderColor: LANDLORD_THEME.primary,
    borderWidth: 1.5,
  },
  cardItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  itemBadgePeach: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  itemBadgePeachText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgePeachText,
  },
  itemBadgeBlue: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  itemBadgeBlueText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeBlueText,
  },
  itemBadgeUrgent: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  itemBadgeUrgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  itemSubtext: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 4,
  },
  propertyDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dueLabel: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
  },
  dueDateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  itemTimestamp: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
    marginTop: 6,
  },

  // Bottom Navigation Bar
  bottomBar: {
    backgroundColor: LANDLORD_THEME.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: LANDLORD_THEME.tabBarBorder,
    flexDirection: 'row',
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircleIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LANDLORD_THEME.primary,
  },
  inactiveCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.tabInactive,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: LANDLORD_THEME.tabInactive,
    marginTop: 4,
  },
  tabLabelActive: {
    color: LANDLORD_THEME.primaryDark,
    fontWeight: '700',
  },
});

export default function LandlordStyleRoute() {
  return null;
}
