<<<<<<< HEAD
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { RecommendCard } from '@/components/renter/rooms/RecommendCard/RecommendCard';
import type { RenterRoom, RoomCategory } from '@/data/types';
import { routes } from '@/routes';
=======
import { FlatList, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RecommendCard } from '@/components/renter/rooms/RecommendCard/RecommendCard';
import type { RecommendedRoom } from '@/services/recommendations';
>>>>>>> momay
import { colors } from '@/theme';
import { styles } from './RecommendationSection.styles';

type Props = {
<<<<<<< HEAD
  category: RoomCategory;
  roomIds: string[];
  roomsById: (id: string) => RenterRoom | undefined;
};

/**
 * One category carousel: dark pill label on the left, right-aligned "See all"
 * that deep-links into room discovery filtered by the category.
 */
export function RecommendationSection({ category, roomIds, roomsById }: Props) {
  const router = useRouter();

  const seeAll = () => {
    router.push({ pathname: '/renter/rooms', params: { category } });
  };

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <Text style={styles.categoryLabel}>{category}</Text>
        <Pressable
          onPress={seeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`See all ${category} rooms`}
          style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={262}
        decelerationRate="fast"
        contentContainerStyle={styles.carousel}
      >
        {roomIds.map((id) => {
          const room = roomsById(id);
          if (!room) return null;
          return (
            <RecommendCard
              key={id}
              room={room}
              onPress={() => router.push(routes.renterRoom(room.id))}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
=======
  title: string;
  subtitle?: string;
  rooms: RecommendedRoom[];
  favoriteIds: string[];
  onToggleFavorite: (roomId: string) => void;
  onOpenRoom: (room: RecommendedRoom) => void;
  /** Renders the trailing "See all" action when provided. */
  onSeeAll?: () => void;
};

/**
 * One category carousel on the Recommended Rooms page: a titled, horizontally
 * scrolling row of `RecommendCard`s with an optional "See all" action.
 */
export function RecommendationSection({
  title,
  subtitle,
  rooms,
  favoriteIds,
  onToggleFavorite,
  onOpenRoom,
  onSeeAll,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onSeeAll ? (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(room) => room.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RecommendCard
            room={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
            onPress={() => onOpenRoom(item)}
          />
        )}
      />
    </View>
  );
}
>>>>>>> momay
