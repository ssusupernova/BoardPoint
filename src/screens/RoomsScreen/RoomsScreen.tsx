import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { RoomListingCard } from '@/components/renter/rooms/RoomListingCard/RoomListingCard';
import { renterMockRooms } from '@/data/mock';
import type { RoomCategory } from '@/data/types';
import { routes } from '@/routes';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { styles } from './RoomsScreen.styles';

/** Room discovery: every available room, highest match first. */
export default function RoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const favoriteIds = useFavoriteRoomIds();

  const category = params.category as RoomCategory | undefined;
  const categoryRooms = category
    ? renterMockRooms.filter((room) => room.category === category)
    : [];
  const rooms = (category ? categoryRooms : [...renterMockRooms]).sort(
    (a, b) => b.matchPercent - a.matchPercent
  );

  return (
    <ScreenContainer>
      <PageHeader
        title={category ? `${category} rooms` : 'Explore rooms'}
        subtitle="Matches closest to your checklist"
        onBack={() => router.back()}
      />

      {category ? (
        <Text style={styles.summary}>
          {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available in {category}
        </Text>
      ) : (
        <Text style={styles.summary}>
          {rooms.length} rooms available · closest matches first
        </Text>
      )}

      <View style={styles.list}>
        {rooms.map((room) => (
          <RoomListingCard
            key={room.id}
            room={room}
            isFavorite={favoriteIds.includes(room.id)}
            onToggleFavorite={() => void toggleFavoriteRoom(room.id)}
            onViewRoom={() => router.push(routes.renterRoom(room.id))}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}