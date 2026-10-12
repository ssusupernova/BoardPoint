import { StyleSheet, Text, View } from 'react-native';
import type { TenantStatus } from '@/services/landlordData';

type Props = {
  status: TenantStatus;
};

const META: Record<TenantStatus, { bg: string; text: string }> = {
  Inquiry: { bg: '#F0EBE4', text: '#6B5E55' },
  Requested: { bg: '#FDECD8', text: '#8E5526' },
  Reserved: { bg: '#93C5E2', text: '#164A66' },
  Active: { bg: '#E8F0E4', text: '#647C59' },
  Declined: { bg: '#F0EBE4', text: '#8A7D73' },
  Former: { bg: '#F4EFEA', text: '#8A7D73' },
};

/** Pill showing where a person sits in the tenancy lifecycle. */
export function TenantStatusBadge({ status }: Props) {
  const meta = META[status] ?? META.Inquiry;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]} accessibilityRole="text">
      <Text style={[styles.text, { color: meta.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
