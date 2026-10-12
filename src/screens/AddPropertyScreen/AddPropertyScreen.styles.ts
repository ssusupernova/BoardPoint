import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const addPropertyStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
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
  sectionFields: {
    gap: 14,
  },
  fieldErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0433A',
  },
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
  actions: {
    gap: 10,
    marginTop: 4,
  },
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
});
