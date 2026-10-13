import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const roomManagerStyles = StyleSheet.create({
  roomsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  addButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },

  roomForm: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FAF7F3',
    borderWidth: 1,
    borderColor: LANDLORD_THEME.borderSubtle,
    marginBottom: 12,
  },
  pesoPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    marginRight: 6,
  },
  occupancyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  occupancyChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  occupancyChipSelected: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    borderColor: LANDLORD_THEME.primary,
  },
  occupancyChipLocked: {
    opacity: 0.55,
  },
  occupancyChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },
  occupancyChipTextSelected: {
    color: LANDLORD_THEME.badgePeachText,
  },
  occupancyLockedHint: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
  },
  roomFormError: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0433A',
  },
  roomFormButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  formButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formButtonPrimary: {
    backgroundColor: LANDLORD_THEME.primary,
  },
  formButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  formButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  formButtonSecondary: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.border,
  },
  formButtonSecondaryPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  formButtonSecondaryText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
  },

  emptyText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: LANDLORD_THEME.textSecondary,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
    marginTop: 10,
  },

  roomRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAF7F3',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  roomRowActive: {
    borderColor: LANDLORD_THEME.primary,
  },
  roomMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomInfo: {
    flex: 1,
    paddingRight: 8,
  },
  roomLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  roomMeta: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  roomRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roomActions: {
    flexDirection: 'row',
    gap: 4,
  },
  roomIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIconButtonPressed: {
    opacity: 0.7,
  },
  roomBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roomBadgeAvailable: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  roomBadgeOccupied: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  roomBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roomBadgeTextAvailable: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  roomBadgeTextOccupied: {
    color: LANDLORD_THEME.badgePeachText,
  },
});
