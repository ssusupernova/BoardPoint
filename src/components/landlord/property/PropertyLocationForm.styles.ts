import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

/** Light blue (#93C5E2) — map/property accents. */
const MAP_BLUE = LANDLORD_THEME.badgeBlueBg;

export const propertyLocationFormStyles = StyleSheet.create({
  container: {
    gap: 12,
  },
  mapWrap: {
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
  },
  previewCard: {
    backgroundColor: '#F7FBFE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9E1F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: LANDLORD_THEME.primaryDark,
  },
  previewUpdating: {
    fontSize: 11,
    fontStyle: 'italic',
    color: LANDLORD_THEME.textMuted,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: LANDLORD_THEME.textPrimary,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  coordsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipConfirmed: {
    backgroundColor: MAP_BLUE,
  },
  statusChipPending: {
    backgroundColor: LANDLORD_THEME.badgePeachBg,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusChipTextConfirmed: {
    color: LANDLORD_THEME.badgeBlueText,
  },
  statusChipTextPending: {
    color: LANDLORD_THEME.primaryDark,
  },
  previewNote: {
    fontSize: 11.5,
    lineHeight: 16,
    color: LANDLORD_THEME.textMuted,
  },
  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  confirmButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  confirmButtonDone: {
    backgroundColor: LANDLORD_THEME.primaryLight,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#B0433A',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: LANDLORD_THEME.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: LANDLORD_THEME.textSecondary,
  },
});
