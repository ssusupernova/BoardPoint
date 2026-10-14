
import type { RecommendedRoom } from '@/services/recommendations';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { featuredGold, styles } from './RecommendCard.styles';

type Props = {
  room: RecommendedRoom;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
};

/**
 * Compact listing card used in category carousels and recommended results.
 * Featured listings get a gold outline and a SPECIAL badge.
 */
export function RecommendCard({
  room,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        room.featured && styles.cardFeatured,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${room.title}, ${room.matchPercent}% match`}
        style={({ pressed }) => [
          pressed && { opacity: 0.95 },
        ]}
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
            <View
              style={styles.placeholder}
              accessibilityLabel="Room photo placeholder"
            >
              <Ionicons
                name="bed-outline"
                size={32}
                color={colors.primary}
              />
            </View>
          )}

          {room.featured ? (
            <View style={styles.special}>
              <Ionicons
                name="star"
                size={11}
                color={featuredGold}
              />
              <Text style={styles.specialText}>SPECIAL</Text>
            </View>
          ) : null}

          <View pointerEvents="none" style={styles.matchPill}>
            <Text style={styles.matchText}>
              {room.matchPercent}% match
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {room.title}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.location} numberOfLines={1}>
              {room.area}
            </Text>
          </View>

          <View style={styles.highlights}>
            {room.highlights.map((highlight) => (
              <View key={highlight} style={styles.highlightChip}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={colors.successText}
                />
                <Text style={styles.highlightText}>
                  {highlight}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.rentRow}>
            <Text style={styles.rent}>
              {formatPeso(room.price)}
            </Text>
            <Text style={styles.perMonth}>/month</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onToggleFavorite}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        accessibilityLabel={
          isFavorite
            ? `Remove ${room.title} from saved rooms`
            : `Save ${room.title}`
        }
        style={({ pressed }) => [
          styles.favorite,
          pressed && styles.favoritePressed,
        ]}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}
