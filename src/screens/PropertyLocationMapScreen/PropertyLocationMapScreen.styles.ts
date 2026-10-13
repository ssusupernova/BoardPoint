import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const propertyLocationMapStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F2F8FC',
    borderWidth: 1,
    borderColor: '#C9E1F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: LANDLORD_THEME.textSecondary,
  },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: LANDLORD_THEME.textSecondary,
  },

  hintCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  hintTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
    textAlign: 'center',
  },
  hintBody: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginTop: 4,
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    color: LANDLORD_THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  emptyButtonPressed: {
    backgroundColor: LANDLORD_THEME.primaryPressed,
  },
  emptyButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
});
