import { StyleSheet } from 'react-native';
import { landlordColors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: landlordColors.background,
  },
  flex: {
    flex: 1,
  },
  decorativeShape: {
    position: 'absolute',
    top: -132,
    right: -112,
    width: 264,
    height: 264,
    borderRadius: 132,
    backgroundColor: landlordColors.decorativeShape,
    pointerEvents: 'none',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  heading: {
    marginTop: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
    color: landlordColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: landlordColors.textSecondary,
  },
  form: {
    marginTop: 36,
    gap: spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: landlordColors.textPrimary,
    letterSpacing: 0.2,
  },
  group: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: landlordColors.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: landlordColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: landlordColors.border,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: landlordColors.textPrimary,
    paddingVertical: 0,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
