import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { FilterChip } from '@/components/landlord/payment/FilterChip';
import { PaymentStatusBadge } from '@/components/landlord/payment/PaymentStatusBadge';
import { landlordPaymentDetails } from '@/routes';
import {
  toPaymentRecords,
  useLandlordData,
  type PaymentStatusFilter,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billStyles } from '../../styles/landlord/bills.styles';
import { paymentStyles as pay } from '../../styles/landlord/payments.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

const STATUS_FILTERS: PaymentStatusFilter[] = [
  'All',
  'Unpaid',
  'Partially Paid',
  'Paid',
  'Overdue',
];

export default function PaymentRecordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useLandlordData();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatusFilter>('All');
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const rows = useMemo(
    () => toPaymentRecords(data, { propertyId, status, query: search }),
    [data, propertyId, status, search]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={billStyles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                billStyles.headerBackBtn,
                pressed && billStyles.headerBackBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={LANDLORD_THEME.textPrimary} />
            </Pressable>

            <View style={billStyles.headerTextCol}>
              <Text style={styles.brandTitle}>Payment Records</Text>
              <Text style={styles.brandSubtitle}>SEARCH, FILTER & DETAILS</Text>
            </View>
          </View>

          {/* Search */}
          <View style={pay.searchRow}>
            <Ionicons name="search" size={16} color={LANDLORD_THEME.textMuted} />
            <TextInput
              style={pay.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search tenant, room, or reference"
              placeholderTextColor={LANDLORD_THEME.textMuted}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search payment records"
            />
            {search.length > 0 ? (
              <Pressable
                onPress={() => setSearch('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={16} color={LANDLORD_THEME.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* Status filter */}
          <Text style={pay.selectorLabel}>STATUS</Text>
          <View style={pay.chipsRow}>
            {STATUS_FILTERS.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={status === option}
                onPress={() => setStatus(option)}
              />
            ))}
          </View>

          {/* Property filter */}
          <Text style={pay.selectorLabel}>PROPERTY</Text>
          <View style={pay.chipsRow}>
            <FilterChip label="All" active={propertyId === null} onPress={() => setPropertyId(null)} />
            {data.properties.map((property) => (
              <FilterChip
                key={property.id}
                label={property.name}
                active={propertyId === property.id}
                onPress={() => setPropertyId(property.id)}
              />
            ))}
          </View>

          <Text style={pay.countLine}>
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </Text>

          {/* Records */}
          <View style={billStyles.listContainer}>
            {rows.length === 0 ? (
              <Text style={billStyles.emptyList}>
                {search.trim()
                  ? `No records match “${search.trim()}”.`
                  : 'No payment records yet. Record a payment from the billing overview.'}
              </Text>
            ) : (
              rows.map((row) => (
                <Pressable
                  key={row.billId}
                  onPress={() => router.push(landlordPaymentDetails(row.billId))}
                  style={({ pressed }) => [pay.recordCard, pressed && pay.recordCardPressed]}
                  accessibilityRole="button"
                >
                  <View style={pay.recordTop}>
                    <View style={pay.rowLeft}>
                      <Text style={pay.recordName} numberOfLines={1}>
                        {row.tenantName}
                      </Text>
                      <Text style={pay.recordWhere} numberOfLines={1}>
                        {row.propertyName} · {row.roomLabel}
                      </Text>
                      <Text style={pay.recordPeriod} numberOfLines={1}>
                        {row.period} · Due {formatShortDate(row.dueDate)}
                      </Text>
                    </View>
                    <PaymentStatusBadge status={row.status} />
                  </View>

                  <View style={pay.moneyRow}>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>DUE</Text>
                      <Text style={pay.moneyValue}>{formatPeso(row.amountDue)}</Text>
                    </View>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>PAID</Text>
                      <Text style={[pay.moneyValue, pay.moneyValuePaid]}>
                        {formatPeso(row.amountPaid)}
                      </Text>
                    </View>
                    <View style={pay.moneyCol}>
                      <Text style={pay.moneyLabel}>BALANCE</Text>
                      <Text
                        style={[
                          pay.moneyValue,
                          row.status === 'Overdue'
                            ? pay.moneyValueDanger
                            : row.remaining > 0
                              ? pay.moneyValueBalance
                              : undefined,
                        ]}
                      >
                        {formatPeso(row.remaining)}
                      </Text>
                    </View>
                  </View>

                  <Text style={pay.latestLine}>
                    {row.paymentCount > 0
                      ? `Last payment: ${formatShortDate(row.paymentDate)} · ${row.method}${
                          row.reference ? ` · Ref ${row.reference}` : ''
                        } (${row.paymentCount} ${row.paymentCount === 1 ? 'entry' : 'entries'})`
                      : 'No payments recorded yet.'}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <LandlordBottomBar active="overview" />
    </View>
  );
}
