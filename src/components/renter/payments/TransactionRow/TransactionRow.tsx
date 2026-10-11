import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import type { PaymentTransaction } from '@/data/mock';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './TransactionRow.styles';

type Props = {
  transaction: PaymentTransaction;
  onPress?: () => void;
};

/** One settled payment in the history list, with an optional receipt link. */
export function TransactionRow({ transaction, onPress }: Props) {
  const content = (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.period}>{transaction.period}</Text>
        <Text style={styles.breakdown}>{transaction.breakdown}</Text>
        <Text style={styles.meta}>
          {transaction.timestampLabel} · {transaction.reference}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatPeso(transaction.amount)}</Text>
        <StatusBadge text={transaction.status} variant="success" dot />
        {onPress ? (
          <View style={styles.link}>
            <Text style={styles.linkText}>View receipt</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View receipt for ${transaction.period}`}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}
