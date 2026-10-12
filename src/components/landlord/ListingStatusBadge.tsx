import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ListingStatus } from '@/services/landlordData';

type Props = {
  status: ListingStatus;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const STATUS_META: Record<ListingStatus, { bg: string; text: string; icon: IconName }> = {
  Published: { bg: '#E8F0E4', text: '#647C59', icon: 'checkmark-circle' },
  Draft: { bg: '#FDECD8', text: '#8E5526', icon: 'create-outline' },
  Inactive: { bg: '#F0EBE4', text: '#8A7D73', icon: 'pause-circle-outline' },
  Archived: { bg: '#E6F0FA', text: '#4A6F94', icon: 'archive-outline' },
};

/** Pill showing a listing's lifecycle status (Draft, Published, Inactive, Archived). */
export function ListingStatusBadge({ status }: Props) {
  const meta = STATUS_META[status] ?? STATUS_META.Draft;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]} accessibilityRole="text">
      <Ionicons name={meta.icon} size={12} color={meta.text} />
      <Text style={[styles.text, { color: meta.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
