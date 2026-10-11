import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/mock';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './RoomDetailScreen.styles';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const favoriteIds = useFavoriteRoomIds();
  const room = renterMockRooms.find((item) => item.id === id);

  if (!room) {
    return (
      <ScreenContainer>
        <PageHeader title="Room details" onBack={() => router.back()} />
        <Text style={styles.missing}>This room is no longer available.</Text>
      </ScreenContainer>
    );
  }

  const isFavorite = favoriteIds.includes(room.id);
  const details = [room.roomLabel, room.privacy, room.occupancy].filter(Boolean).join(' · ');
  const distance =
    room.distanceFromLabel != null
      ? `${room.distanceKm} km from ${room.distanceFromLabel}`
      : `${room.distanceKm} km away`;

  return (
    <ScreenContainer>
      <PageHeader title="Room details" onBack={() => router.back()} />

      <View style={styles.media}>
        {room.imageUri ? (
          <Image source={{ uri: room.imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="bed-outline" size={46} color={colors.primary} />
          </View>
        )}

        {room.availabilityLabel ? (
          <View style={styles.availability}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={styles.availabilityText}>{room.availabilityLabel}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void toggleFavoriteRoom(room.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          accessibilityLabel={isFavorite ? 'Remove from saved rooms' : 'Save this room'}
          style={({ pressed }) => [styles.favorite, pressed && styles.favoritePressed]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.head}>
        <Text style={styles.title}>{room.title}</Text>
        {details ? <Text style={styles.details}>{details}</Text> : null}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.location}>{room.area}</Text>
        </View>
      </View>

      <View style={styles.rentRow}>
        <Text style={styles.rent}>{formatPeso(room.price)}</Text>
        <Text style={styles.perMonth}>/month</Text>
      </View>

      {room.featureBadges?.length ? (
        <View style={styles.badges}>
          {room.featureBadges.map((badge) => (
            <StatusBadge key={badge} text={badge} variant="neutral" />
          ))}
        </View>
      ) : null}

      {room.amenities?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What&apos;s included</Text>
          {room.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.metaRow}>
          <Ionicons name="navigate-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{distance}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="sparkles-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{room.matchPercent}% match with your checklist</Text>
        </View>
      </View>

      <View style={styles.action}>
        <PrimaryButton
          label={isFavorite ? 'Saved to favorites' : 'Save this room'}
          icon="heart"
          onPress={() => void toggleFavoriteRoom(room.id)}
          accessibilityLabel={isFavorite ? 'Remove from saved rooms' : 'Save this room'}
        />
      </View>

      <Text style={styles.note}>
        Contact the landlord to schedule a viewing once you&apos;re ready.
      </Text>
    </ScreenContainer>
  );
}
