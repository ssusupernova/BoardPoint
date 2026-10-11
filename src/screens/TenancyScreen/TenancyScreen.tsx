import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { renterTenancy } from '@/data/mock';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import { statusVariant } from '@/utils/status';
import { styles } from './TenancyScreen.styles';

export default function TenancyScreen() {
  const router = useRouter();
  const tenancy = renterTenancy;

  const rows = [
    { label: 'Property', value: tenancy.propertyName },
    { label: 'Unit', value: tenancy.unitLabel },
    { label: 'Address', value: tenancy.address },
    { label: 'Monthly rent', value: `${formatPeso(tenancy.monthlyRent)} / month` },
    { label: 'Lease started', value: formatDisplayDate(tenancy.leaseStartedAt) },
    { label: 'Lease ends', value: formatDisplayDate(tenancy.leaseEndsAt) },
  ];

  return (
    <ScreenContainer>
      <PageHeader
        title="Tenancy"
        subtitle="Your current rental agreement"
        onBack={() => router.back()}
      />

      <View style={styles.card}>
        <View style={styles.headRow}>
          <Text style={styles.property} numberOfLines={1}>
            {tenancy.propertyName}
          </Text>
          <StatusBadge
            text={tenancy.status}
            variant={statusVariant(tenancy.status)}
            dot
          />
        </View>

        {rows.map((row, index) => (
          <View key={row.label}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
