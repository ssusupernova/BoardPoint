import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const addressSearchFieldStyles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LANDLORD_THEME.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 14,
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    // Light-blue map accent so the field reads as part of the location form.
    borderColor: '#C9E1F0',
  },
  fieldError: {
    borderColor: '#B0433A',
  },
  input: {
    flex: 1,
    minHeight: 24,
    fontSize: 14.5,
    color: LANDLORD_THEME.textPrimary,
    paddingVertical: 0,
  },
  suggestions: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9E1F0',
    backgroundColor: LANDLORD_THEME.surface,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LANDLORD_THEME.borderSubtle,
  },
  suggestionPressed: {
    backgroundColor: LANDLORD_THEME.badgeBlueBg,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18,
    color: LANDLORD_THEME.textPrimary,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    color: LANDLORD_THEME.textMuted,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#B0433A',
  },
});
