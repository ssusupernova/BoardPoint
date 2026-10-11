import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { RoomListingCard } from '@/components/renter/rooms/RoomListingCard/RoomListingCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { colors } from '@/theme';
import { styles } from './SavedScreen.styles';

export default function SavedScreen() {
  const router = useRouter();
  const favoriteIds = useFavoriteRoomIds();
  const rooms = renterMockRooms.filter((room) => favoriteIds.includes(room.id));

  return (
    <RenterScreen
      active="saved"
      title="Favorite rooms"
      subtitle="A little shortlist for your next chapter."
    >
      <View style={styles.headerRow}>
        <Text style={styles.count}>
          {rooms.length} saved {rooms.length === 1 ? 'room' : 'rooms'}
        </Text>
        <View style={styles.sort} accessibilityRole="text">
          <Text style={styles.sortText}>Recently saved</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </View>
      </View>

      {rooms.length ? (
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
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No saved rooms yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any room to build your shortlist.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Still looking?</Text>
        <Text style={styles.footerText}>
          Discover more rooms that fit your budget and must-haves.
        </Text>
        <View style={styles.footerAction}>
          <PrimaryButton
            label="Explore rooms"
            icon="search"
            onPress={() => router.push(routes.renterRooms)}
            accessibilityLabel="Explore rooms"
          />
        </View>
      </View>
    </RenterScreen>
  );
}
