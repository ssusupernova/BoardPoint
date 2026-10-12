import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open room ${room.title}`}
      style={({ pressed }) => [
        styles.card,
        room.featured && styles.cardFeatured,
        pressed && styles.cardPressed,
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
          <View style={styles.placeholder} accessibilityLabel="Room photo placeholder">
            <Ionicons name="bed-outline" size={30} color={colors.primary} />
          </View>
        )}

        {room.featured ? (
          <View style={styles.special} accessibilityLabel="SPECIAL listing">
            <Text style={styles.specialText}>SPECIAL</Text>
          </View>
        ) : null}

        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{room.category}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {room.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {room.area}
          </Text>
        </View>
        <View style={styles.rentRow}>
          <Text style={styles.rent}>{formatPeso(room.price)}</Text>
          <Text style={styles.perMonth}>/month</Text>
        </View>
      </View>
    </Pressable>
  );
}