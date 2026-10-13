import { Text, View } from 'react-native';
import type { PaymentStatus } from '@/services/landlordData';
import { paymentStyles as pay } from '@/styles/landlord/payments.styles';

type Props = {
  status: PaymentStatus;
};

const PILL: Record<PaymentStatus, object> = {
  Unpaid: pay.statusUnpaid,
  'Partially Paid': pay.statusPartial,
  Paid: pay.statusPaid,
  Overdue: pay.statusOverdue,
};

const TEXT: Record<PaymentStatus, object> = {
  Unpaid: pay.statusUnpaidText,
  'Partially Paid': pay.statusPartialText,
  Paid: pay.statusPaidText,
  Overdue: pay.statusOverdueText,
};

/** Badge for the balance-derived payment status (never edited manually). */
export function PaymentStatusBadge({ status }: Props) {
  return (
    <View style={[pay.statusPill, PILL[status]]}>
      <Text style={[pay.statusPillText, TEXT[status]]}>{status}</Text>
    </View>
  );
}
