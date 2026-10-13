import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from '@/styles/landlord/styles';

export const propertyMarkersMapStyles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C9E1F0',
    overflow: 'hidden',
    backgroundColor: '#E8F1F8',
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: 256,
    height: 256,
  },

  // Native marker content
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHalo: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(191, 126, 74, 0.20)',
  },

  // Web marker
  markerButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerName: {
    position: 'absolute',
    top: -20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: LANDLORD_THEME.primary,
    maxWidth: 160,
  },
  markerNameText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: LANDLORD_THEME.onPrimary,
    textAlign: 'center',
  },

  attribution: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    fontSize: 10,
    color: LANDLORD_THEME.textSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});
