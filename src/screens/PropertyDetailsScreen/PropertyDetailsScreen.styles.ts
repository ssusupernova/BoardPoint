import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const propertyDetailsStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  headerCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.primary,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },

  // Hero
  hero: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  heroImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: LANDLORD_THEME.borderSubtle,
    marginBottom: 12,
  },
  heroPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroBody: {
    gap: 8,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroRate: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: LANDLORD_THEME.borderSubtle,
    borderRadius: 14,
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  statValueAccent: {
    color: LANDLORD_THEME.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },

  // Tabs
  tabsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  tabChipActive: {
    backgroundColor: LANDLORD_THEME.primary,
    borderColor: LANDLORD_THEME.primary,
  },
  tabChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  tabChipTextActive: {
    color: LANDLORD_THEME.onPrimary,
  },

  // Content
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: LANDLORD_THEME.textSecondary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: LANDLORD_THEME.badgePeachText,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  contactText: {
    flex: 1,
    fontSize: 13.5,
    color: LANDLORD_THEME.textPrimary,
  },

  // Rules
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  inlineActionPressed: {
    opacity: 0.75,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  rulesEditor: {
    gap: 12,
  },
  rulesInput: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    backgroundColor: LANDLORD_THEME.surface,
    padding: 14,
    fontSize: 14,
    lineHeight: 21,
    color: LANDLORD_THEME.textPrimary,
    textAlignVertical: 'top',
  },
  rulesButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  // Settings
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  checkText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
  },
  checkTextMissing: {
    color: LANDLORD_THEME.textSecondary,
    fontWeight: '500',
  },
  settingsActions: {
    gap: 10,
  },
  safetyNote: {
    fontSize: 12,
    lineHeight: 18,
    color: LANDLORD_THEME.textMuted,
    marginTop: 14,
    textAlign: 'center',
  },
  locationActions: {
    marginTop: 12,
  },

  // Centered (not found / not authorized)
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  centeredTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  centeredBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  manageRoomsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
  },
  manageRoomsLinkText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
});
