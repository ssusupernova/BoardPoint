import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const propertyPreviewCardStyles = StyleSheet.create({
  card: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  addressText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: LANDLORD_THEME.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillBlue: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  pillPeach: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: LANDLORD_THEME.badgeBlueText,
  },
  pillTextPeach: {
    color: LANDLORD_THEME.badgePeachText,
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rentText: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.primaryDark,
  },
  rentCaption: {
    fontSize: 11.5,
    color: LANDLORD_THEME.textMuted,
  },
  viewButton: {
    marginTop: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
});
