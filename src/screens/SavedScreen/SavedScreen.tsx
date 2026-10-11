import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { renterMockRooms } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './SavedScreen.styles';

export default function SavedScreen() {
  const rooms = renterMockRooms.slice(0, 3);

  return (
    <RenterScreen active="saved">
      <PageHeader title="Saved rooms" subtitle="Rooms you bookmarked" />

      <View style={styles.list}>
        {rooms.map((room) => (
          <View key={room.id} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name="bed-outline" size={22} color={colors.primary} />
            </View>

            <View style={styles.copy}>
              <Text style={styles.title} numberOfLines={1}>
                {room.title}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {room.area} · {room.distanceKm} km away
              </Text>
              <Text style={styles.price}>{formatPeso(room.price)}/mo</Text>
            </View>

            <View style={styles.matchPill}>
              <Text style={styles.matchText}>{room.matchPercent}% match</Text>
            </View>
          </View>
        ))}
      </View>
    </RenterScreen>
  );
}
