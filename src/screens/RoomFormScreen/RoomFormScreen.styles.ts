import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const roomFormStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: LANDLORD_THEME.textMuted,
    marginTop: 1,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: LANDLORD_THEME.textMuted,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
  },
  chipInactive: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  chipTextInactive: {
    color: LANDLORD_THEME.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  rowItem: {
    flex: 1,
  },
});
