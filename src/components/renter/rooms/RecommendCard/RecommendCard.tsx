import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
<<<<<<< HEAD
import type { RenterRoom } from '@/data/types';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './RecommendCard.styles';

type Props = {
  room: RenterRoom;
  onPress: () => void;
};

/** Compact horizontal card for the category carousels on Recommended Rooms. */
export function RecommendCard({ room, onPress }: Props) {
=======
import type { RecommendedRoom } from '@/services/recommendations';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { featuredGold, styles } from './RecommendCard.styles';

type Props = {
  room: RecommendedRoom;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

/**
 * Compact listing card used in the category carousels and the recommended
 * results grid. Promoted listings ("featured") get a gold outline and a SPECIAL
 * badge.
 */
export function RecommendCard({ room, isFavorite, onToggleFavorite, onPress }: Props) {
>>>>>>> momay
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
<<<<<<< HEAD
      accessibilityLabel={`Open room ${room.title}`}
      style={({ pressed }) => [
        styles.card,
        room.featured && styles.cardFeatured,
        pressed && styles.cardPressed,
      ]}
=======
      accessibilityLabel={`Open ${room.title}, ${room.matchPercent}% match`}
      style={({ pressed }) => [styles.card, room.featured && styles.cardFeatured, pressed && { opacity: 0.95 }]}
>>>>>>> momay
    >
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
<<<<<<< HEAD
            <Ionicons name="bed-outline" size={30} color={colors.primary} />
=======
            <Ionicons name="bed-outline" size={32} color={colors.primary} />
>>>>>>> momay
          </View>
        )}

        {room.featured ? (
<<<<<<< HEAD
          <View style={styles.special} accessibilityLabel="SPECIAL listing">
=======
          <View style={styles.special}>
            <Ionicons name="star" size={11} color={featuredGold} />
>>>>>>> momay
            <Text style={styles.specialText}>SPECIAL</Text>
          </View>
        ) : null}

<<<<<<< HEAD
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{room.category}</Text>
=======
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
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.primary} />
        </Pressable>

        <View style={styles.matchPill}>
          <Text style={styles.matchText}>{room.matchPercent}% match</Text>
>>>>>>> momay
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {room.title}
        </Text>
        <View style={styles.locationRow}>
<<<<<<< HEAD
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
=======
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
>>>>>>> momay
          <Text style={styles.location} numberOfLines={1}>
            {room.area}
          </Text>
        </View>
<<<<<<< HEAD
=======

        <View style={styles.highlights}>
          {room.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightChip}>
              <Ionicons name="checkmark-circle" size={12} color={colors.successText} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

>>>>>>> momay
        <View style={styles.rentRow}>
          <Text style={styles.rent}>{formatPeso(room.price)}</Text>
          <Text style={styles.perMonth}>/month</Text>
        </View>
      </View>
    </Pressable>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> momay
