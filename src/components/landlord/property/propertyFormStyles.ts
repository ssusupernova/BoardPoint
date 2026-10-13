import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

/** Shared field + section styles for the landlord property forms. */
export const propertyFormStyles = StyleSheet.create({
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
  fieldError: {
    borderColor: '#B0433A',
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    minHeight: 104,
  },
  fieldPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionCard: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
    marginTop: 10,
  },
  helperText: {
    fontSize: 12,
    color: LANDLORD_THEME.textMuted,
  },

  // Buttons
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
    height: 52,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButtonPressed: {
    backgroundColor: LANDLORD_THEME.surfacePressed,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.primaryDark,
  },
  dangerButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1.5,
    borderColor: '#B0433A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dangerButtonPressed: {
    backgroundColor: '#FBEEEA',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B0433A',
  },
});
