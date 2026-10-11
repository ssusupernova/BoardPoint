import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  decorativeTopRight: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.decorativeCircle,
  },
  decorativeBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F5E6D3',
    opacity: 0.85,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flex: 1,
  },
  heading: {
    marginTop: spacing.xxl + 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 34,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actions: {
    marginTop: spacing.xl,
  },
  continueButton: {
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  continueButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
});
