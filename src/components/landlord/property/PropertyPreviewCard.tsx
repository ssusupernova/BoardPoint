import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { PropertyView } from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { LANDLORD_THEME } from '@/styles/landlord/styles';
import { ListingStatusBadge } from '@/components/landlord/ListingStatusBadge';
import { propertyPreviewCardStyles as styles } from './PropertyPreviewCard.styles';

type Props = {
  property: PropertyView;
  onView: () => void;
};

/** Compact summary shown when a property marker is selected on the map. */
export function PropertyPreviewCard({ property, onView }: Props) {
  const hasRooms = property.minRent > 0;
  const rateLabel = !hasRooms
    ? 'No rooms listed yet'
    : property.minRent === property.maxRent
      ? `${formatPeso(property.minRent)}/mo`
      : `${formatPeso(property.minRent)}–${formatPeso(property.maxRent)}/mo`;

  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={2}>
        {property.name}
      </Text>

      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={14} color={LANDLORD_THEME.textMuted} />
        <Text style={styles.addressText} numberOfLines={2}>
          {property.address || 'Address not set'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <ListingStatusBadge status={property.listingStatus} />
        <View style={[styles.pill, styles.pillBlue]}>
          <Ionicons name="key-outline" size={11} color={LANDLORD_THEME.badgeBlueText} />
          <Text style={styles.pillText}>
            {property.availableRooms} available
          </Text>
        </View>
        <View style={[styles.pill, styles.pillPeach]}>
          <Ionicons name="bed-outline" size={11} color={LANDLORD_THEME.badgePeachText} />
          <Text style={[styles.pillText, styles.pillTextPeach]}>
            {property.totalRooms} rooms
          </Text>
        </View>
      </View>

      <View style={styles.rentRow}>
        <Ionicons name="cash-outline" size={14} color={LANDLORD_THEME.primaryDark} />
        <Text style={styles.rentText}>{rateLabel}</Text>
        {hasRooms ? <Text style={styles.rentCaption}>per month</Text> : null}
      </View>

      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.viewButton, pressed && styles.viewButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`View property ${property.name}`}
      >
        <Text style={styles.viewButtonText}>View Property</Text>
        <Ionicons name="chevron-forward" size={15} color={LANDLORD_THEME.onPrimary} />
      </Pressable>
    </View>
  );
}
