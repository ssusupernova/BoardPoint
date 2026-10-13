import { Text, View } from 'react-native';
import { formatPeso } from '@/utils/currency';
import type { ExpenseAllocationRow } from '@/services/landlordData';
import { expenseStyles as exp } from '@/styles/landlord/expenses.styles';

type Props = {
  rows: ExpenseAllocationRow[];
  /** Total the shares must add up to. */
  total: number;
  /** Short explanation of the chosen allocation method. */
  hint?: string;
  /** Validation message (e.g. custom amounts that do not sum to the total). */
  mismatch?: string | null;
};

/** Tenant-by-tenant split preview with a rounding-safe total row. */
export function AllocationBreakdown({ rows, total, hint, mismatch }: Props) {
  const sum = rows.reduce((acc, row) => acc + row.amount, 0);
  const off = Math.abs(Math.round(sum * 100) / 100 - total) > 0.009;

  return (
    <View style={exp.allocCard}>
      <Text style={exp.allocHead}>How it splits</Text>
      {hint ? <Text style={exp.allocHint}>{hint}</Text> : null}

      <View style={exp.allocTableHead}>
        <Text style={exp.allocTableHeadText}>Tenant</Text>
        <Text style={exp.allocTableHeadText}>Share</Text>
      </View>

      {rows.map((row) => (
        <View key={row.tenantId} style={exp.allocRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={exp.allocTenant} numberOfLines={1}>
              {row.tenantName}
            </Text>
            {row.roomLabel ? (
              <Text style={exp.allocRoom} numberOfLines={1}>
                {row.roomLabel}
              </Text>
            ) : null}
          </View>
          <Text style={exp.allocAmount}>{formatPeso(row.amount)}</Text>
        </View>
      ))}

      <View style={exp.allocTotalRow}>
        <Text style={exp.allocTotalLabel}>Total</Text>
        <Text style={[exp.allocTotalValue, off && exp.allocTotalValueBad]}>
          {formatPeso(sum)}
        </Text>
      </View>

      {mismatch ? (
        <Text style={[exp.roundingNote, exp.roundingNoteBad]}>{mismatch}</Text>
      ) : (
        <Text style={exp.roundingNote}>
          Shares are rounded to the nearest centavo and adjusted so they always add
          up to {formatPeso(total)} — nobody pays or loses a stray peso.
        </Text>
      )}
    </View>
  );
}
