import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const tenantFormStyles = StyleSheet.create({
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
  },
  modeChipInactive: {
    backgroundColor: LANDLORD_THEME.surface,
    borderWidth: 1,
    borderColor: LANDLORD_THEME.border,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
  },
  modeChipTextInactive: {
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
