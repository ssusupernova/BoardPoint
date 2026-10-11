import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import type { RenterRoom } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './RoomListingCard.styles';

type Props = {
  room: RenterRoom;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewRoom: () => void;
};

/** Large listing card used on the favorites shortlist and room discovery. */
export function RoomListingCard({ room, isFavorite, onToggleFavorite, onViewRoom }: Props) {
  const details = [room.roomLabel, room.privacy, room.occupancy].filter(Boolean).join(' · ');
  const amenities = room.amenities?.join(' · ') ?? '';
  const distance =
    room.distanceFromLabel != null
      ? `${room.distanceKm} km from ${room.distanceFromLabel}`
      : `${room.distanceKm} km away`;

  return (
    <View style={styles.card}>
      <View style={styles.media}>
        {room.imageUri ? (
          <Image
            source={{ uri: room.imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder} accessibilityLabel="Room photo placeholder">
            <Ionicons name="bed-outline" size={38} color={colors.primary} />
          </View>
        )}

        {room.availabilityLabel ? (
          <View style={styles.availability}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={styles.availabilityText}>{room.availabilityLabel}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onToggleFavorite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          accessibilityLabel={
            isFavorite ? `Remove ${room.title} from saved rooms` : `Save ${room.title}`
          }
          style={({ pressed }) => [styles.favorite, pressed && styles.favoritePressed]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {room.title}
        </Text>
        {details ? <Text style={styles.details}>{details}</Text> : null}

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {room.area}
          </Text>
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

        {amenities ? <Text style={styles.amenities}>{amenities}</Text> : null}

        <View style={styles.distanceRow}>
          <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.distance}>{distance}</Text>
        </View>

        <View style={styles.action}>
          <OutlineButton
            label="View room"
            icon="arrow-forward"
            onPress={onViewRoom}
            accessibilityLabel={`View room ${room.title}`}
          />
        </View>
      </View>
    </View>
  );
}
