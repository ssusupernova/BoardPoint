import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import type { RentalRequest, RentalRequestStatus } from '@/data/renter';
import type { StatusVariant } from '@/utils/status';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { styles } from './RequestCard.styles';

type Props = {
  request: RentalRequest;
  onOpenRoom: () => void;
  /** Withdraw a pending request; confirmed registrations can't be withdrawn. */
  onCancel?: () => void;
};

const STATUS_VARIANT: Record<RentalRequestStatus, StatusVariant> = {
  Pending: 'info',
  Confirmed: 'success',
  Declined: 'neutral',
};

/** A single rental request / registration with its live status. */
export function RequestCard({ request, onOpenRoom, onCancel }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={1}>
            {request.roomTitle}
          </Text>
          <Text style={styles.property} numberOfLines={1}>
            {request.propertyName}
          </Text>
        </View>
        <StatusBadge
          text={request.status}
          variant={STATUS_VARIANT[request.status]}
          dot
        />
      </View>

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Ionicons name="cash-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaLabel}>Monthly rent</Text>
          <Text style={styles.metaValue}>{formatPeso(request.monthlyRent)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="paper-plane-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaLabel}>Requested</Text>
          <Text style={styles.metaValue}>{formatDisplayDate(request.submittedAt)}</Text>
        </View>
        {request.decidedAt ? (
          <View style={styles.metaRow}>
            <Ionicons name="checkmark-done-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.metaLabel}>
              {request.status === 'Confirmed' ? 'Confirmed' : 'Decided'}
            </Text>
            <Text style={styles.metaValue}>{formatDisplayDate(request.decidedAt)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <OutlineButton
          label="View room"
          icon="arrow-forward"
          onPress={onOpenRoom}
          accessibilityLabel={`View ${request.roomTitle}`}
        />
        {request.status === 'Pending' && onCancel ? (
          <OutlineButton
            label="Cancel request"
            icon="close-outline"
            onPress={onCancel}
            accessibilityLabel={`Cancel request for ${request.roomTitle}`}
          />
        ) : null}
      </View>
    </View>
  );
}
