import { StyleSheet } from 'react-native';
import { LANDLORD_THEME } from './styles';

export const profileStyles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LANDLORD_THEME.badgePeachBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: LANDLORD_THEME.primary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: LANDLORD_THEME.primary,
  },
  heroCopy: {
    flex: 1,
  },
  heroEmail: {
    fontSize: 13,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LANDLORD_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBlue: {
    backgroundColor: '#4A6FA5',
  },
  menuIconBrown: {
    backgroundColor: '#8B6A56',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: LANDLORD_THEME.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: LANDLORD_THEME.borderSubtle,
    marginVertical: 4,
  },
  signOutContainer: {
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: LANDLORD_THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8D5C8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  signOutButtonPressed: {
    backgroundColor: '#FCEFE9',
  },
  signOutDisabled: {
    opacity: 0.5,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: LANDLORD_THEME.primary,
  },
});

export default function ProfileStyleRoute() {
  return null;
}
