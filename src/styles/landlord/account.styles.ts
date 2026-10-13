import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

/** Shared styles for the landlord account, edit-profile, and settings screens. */
export const accountStyles = StyleSheet.create({
  /* Back-button header (shared by pushed settings screens) */
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

  /* Profile hero */
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: '100%',
    height: '100%',
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: LANDLORD_THEME.primary,
  },
  heroAvatarEditBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: LANDLORD_THEME.surface,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  heroEmail: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },

  /* Status pills */
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillVerified: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  pillVerifiedText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeBlueText,
  },
  pillPending: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  pillPendingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },
  pillUrgent: {
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
  },
  pillUrgentText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgeUrgentText,
  },
  pillNeutral: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  pillNeutralText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textSecondary,
  },
  pillCount: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  pillCountText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: LANDLORD_THEME.badgePeachText,
  },

  /* Detail rows (phone, status, joined) */
  detailCard: {
    marginTop: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12.5,
    color: LANDLORD_THEME.textMuted,
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  detailValueMuted: {
    color: LANDLORD_THEME.textMuted,
    fontWeight: '500',
  },
  verificationNote: {
    fontSize: 11.5,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
    marginTop: 10,
  },

  /* Banners */
  suspendedBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: LANDLORD_THEME.badgeUrgentBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3C9B6',
    padding: 14,
    marginTop: 14,
  },
  suspendedBannerText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.badgeUrgentText,
  },
  unsavedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3D9BC',
    padding: 14,
    marginTop: 14,
  },
  unsavedCardText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.badgePeachText,
  },
  unsavedCardButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: LANDLORD_THEME.primary,
  },
  unsavedCardButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },

  /* Form fields (edit profile / change password) */
  formGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  fieldFocused: {
    borderColor: LANDLORD_THEME.primary,
  },
  fieldError: {
    borderColor: '#B0433A',
  },
  fieldIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 24,
    fontSize: 14.5,
    color: LANDLORD_THEME.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#B0433A',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
  },
  helperTextStrong: {
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.primaryDark,
  },

  /* Buttons */
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  dangerTextButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: '#E5B7A6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
  },
  dangerTextButtonPressed: {
    backgroundColor: '#FBEEEA',
  },
  dangerTextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B0433A',
  },

  /* Photo editor */
  photoEditorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  photoAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
    overflow: 'hidden',
  },
  photoAvatarImage: {
    width: '100%',
    height: '100%',
  },
  photoAvatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: LANDLORD_THEME.primary,
  },
  photoActions: {
    flex: 1,
    gap: 8,
  },

  /* Info screens (privacy / terms / help) */
  infoCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginBottom: 6,
  },
  infoCardBody: {
    fontSize: 13,
    lineHeight: 20,
    color: LANDLORD_THEME.textSecondary,
  },
  infoFooter: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 14,
    marginTop: 4,
  },
  infoFooterText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
  },
});
