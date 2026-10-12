import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { RecommendCard } from '@/components/renter/rooms/RecommendCard/RecommendCard';
import type { RenterRoom, RoomCategory } from '@/data/types';
import { routes } from '@/routes';
import { colors } from '@/theme';
import { styles } from './RecommendationSection.styles';

type Props = {
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