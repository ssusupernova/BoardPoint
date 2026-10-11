import { Text, View } from 'react-native';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import type { PaymentRecord } from '@/data/mock';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { styles } from './PaymentHistoryRow.styles';

type Props = {
  record: PaymentRecord;
};

/** One settled payment in a history list. */
export function PaymentHistoryRow({ record }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.period}>{record.period}</Text>
        <Text style={styles.meta}>
          {record.method} · {formatDisplayDate(record.paidAt)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatPeso(record.amount)}</Text>
        <StatusBadge text={record.status} variant="success" dot />
      </View>
    </View>
  );
}
