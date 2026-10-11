import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { OutlineButton } from '@/components/common/OutlineButton/OutlineButton';
import type { Tenancy } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { statusVariant } from '@/utils/status';
import { styles } from './PropertyCard.styles';

type Props = {
  tenancy: Tenancy;
  /** Optional photo; a token-based placeholder renders when omitted. */
  imageUri?: string;
  onViewTenancy: () => void;
};

/** "Your Home" card: the renter's current unit with its photo and status. */
export function PropertyCard({ tenancy, imageUri, onViewTenancy }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.media}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.placeholder} accessibilityLabel="Property photo placeholder">
            <Ionicons name="bed-outline" size={40} color={colors.primary} />
            <Text style={styles.placeholderText}>No photo yet</Text>
          </View>
        )}
        <View style={styles.badgeWrap}>
          <StatusBadge text={tenancy.status} variant={statusVariant(tenancy.status)} dot />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.property} numberOfLines={1}>
          {tenancy.propertyName}
        </Text>
        <Text style={styles.unit} numberOfLines={1}>
          {tenancy.unitLabel}
        </Text>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.address} numberOfLines={2}>
            {tenancy.address}
          </Text>
        </View>

        <View style={styles.rentRow}>
          <Text style={styles.rent}>{formatPeso(tenancy.monthlyRent)}</Text>
          <Text style={styles.perMonth}>/month</Text>
        </View>

        <OutlineButton
          label="View tenancy"
          icon="document-text-outline"
          onPress={onViewTenancy}
          accessibilityLabel="View tenancy details"
        />
      </View>
    </View>
  );
}
