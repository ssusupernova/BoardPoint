import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import type { PaymentOverview } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { statusVariant } from '@/utils/status';
import { styles } from './PaymentOverviewCard.styles';

type Props = {
  overview: PaymentOverview;
  onViewBills: () => void;
};

/** Summarises the current billing period with a shortcut into bills. */
export function PaymentOverviewCard({ overview, onViewBills }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Ionicons name="wallet-outline" size={18} color={colors.primary} />
        </View>
        <Text style={styles.label}>Amount due</Text>
        <StatusBadge text={overview.status} variant={statusVariant(overview.status)} dot />
      </View>

      <Text style={styles.amount}>{formatPeso(overview.amountDue)}</Text>
      <Text style={styles.meta}>
        For {overview.period} · Due {formatDisplayDate(overview.dueDate)}
      </Text>

      <View style={styles.action}>
        <PrimaryButton
          label="View bills & pay"
          onPress={onViewBills}
          accessibilityLabel="View bills and pay"
        />
      </View>
    </View>
  );
}
