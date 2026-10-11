import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { RoomListingCard } from '@/components/renter/rooms/RoomListingCard/RoomListingCard';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { styles } from './RoomsScreen.styles';

/** Room discovery: every available room, highest match first. */
export default function RoomsScreen() {
  const router = useRouter();
  const favoriteIds = useFavoriteRoomIds();
  const rooms = [...renterMockRooms].sort((a, b) => b.matchPercent - a.matchPercent);

  return (
    <ScreenContainer>
      <PageHeader
        title="Explore rooms"
        subtitle="Matches closest to your checklist"
        onBack={() => router.back()}
      />

      <Text style={styles.summary}>
        {rooms.length} rooms available · closest matches first
      </Text>

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
