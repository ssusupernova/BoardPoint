import { StyleSheet, Text, View } from 'react-native';
import type { RoomAvailability } from '@/services/landlordData';

type Props = {
  availability: RoomAvailability;
};

const META: Record<RoomAvailability, { bg: string; text: string }> = {
  Available: { bg: '#E8F0E4', text: '#647C59' },
  Occupied: { bg: '#FDECD8', text: '#8E5526' },
  Reserved: { bg: '#93C5E2', text: '#164A66' },
  Maintenance: { bg: '#F0EBE4', text: '#8A7D73' },
};

/** Pill showing a room's availability (Available, Occupied, Reserved, Maintenance). */
export function RoomAvailabilityBadge({ availability }: Props) {
  const meta = META[availability] ?? META.Available;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]} accessibilityRole="text">
      <Text style={[styles.text, { color: meta.text }]}>{availability}</Text>
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
