<<<<<<< HEAD
import { Text, View } from 'react-native';
=======
import { Pressable, ScrollView, Text, View } from 'react-native';
>>>>>>> momay
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { RoomListingCard } from '@/components/renter/rooms/RoomListingCard/RoomListingCard';
<<<<<<< HEAD
import { renterMockRooms } from '@/data/mock';
import type { RoomCategory } from '@/data/types';
=======
import { ROOM_CATEGORY_ORDER, renterMockRooms, type RoomCategory } from '@/data/mock';
>>>>>>> momay
import { routes } from '@/routes';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { styles } from './RoomsScreen.styles';

function isCategory(value: unknown): value is RoomCategory {
  return typeof value === 'string' && (ROOM_CATEGORY_ORDER as string[]).includes(value);
}

/** Room discovery: every available room, highest match first, optionally
 *  filtered to one marketplace category via `?category=`. */
export default function RoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const favoriteIds = useFavoriteRoomIds();
<<<<<<< HEAD

  const category = params.category as RoomCategory | undefined;
  const categoryRooms = category
    ? renterMockRooms.filter((room) => room.category === category)
    : [];
  const rooms = (category ? categoryRooms : [...renterMockRooms]).sort(
    (a, b) => b.matchPercent - a.matchPercent
  );
=======
  const { category } = useLocalSearchParams<{ category?: string }>();
  const activeCategory = isCategory(category) ? category : null;

  const rooms = [...renterMockRooms]
    .filter((room) => !activeCategory || room.category === activeCategory)
    .sort((a, b) => b.matchPercent - a.matchPercent);
>>>>>>> momay

  return (
    <ScreenContainer>
      <PageHeader
<<<<<<< HEAD
        title={category ? `${category} rooms` : 'Explore rooms'}
=======
        title={activeCategory ?? 'Explore rooms'}
>>>>>>> momay
        subtitle="Matches closest to your checklist"
        onBack={() => router.back()}
      />

<<<<<<< HEAD
      {category ? (
        <Text style={styles.summary}>
          {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available in {category}
        </Text>
      ) : (
        <Text style={styles.summary}>
          {rooms.length} rooms available · closest matches first
        </Text>
      )}
=======
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => router.replace(routes.renterRooms)}
          accessibilityRole="button"
          accessibilityState={{ selected: activeCategory === null }}
          accessibilityLabel="Show all rooms"
          style={[styles.chip, activeCategory === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, activeCategory === null && styles.chipTextActive]}>
            All
          </Text>
        </Pressable>
        {ROOM_CATEGORY_ORDER.map((option) => {
          const active = option === activeCategory;
          return (
            <Pressable
              key={option}
              onPress={() => router.replace(routes.renterRoomsByCategory(option))}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Show ${option} rooms`}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.summary}>
        {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available · closest matches first
      </Text>
>>>>>>> momay

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