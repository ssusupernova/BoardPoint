import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { landlordTenantForm, landlordTenantProfile } from '@/routes';
import {
  toTenantViews,
  useLandlordData,
  type TenantView,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANDLORD_THEME, leaseStyles, styles } from '../../styles/landlord';

type LeaseFilter = 'All' | 'Renewal' | 'Active';

export default function LandlordLeasesScreen() {
  const insets = useSafeAreaInsets();
  const { tenantId } = useLocalSearchParams<{ tenantId?: string }>();
  const router = useRouter();
  const data = useLandlordData();

  const tenants = useMemo(() => toTenantViews(data), [data]);
  const [filter, setFilter] = useState<LeaseFilter>('All');

  const filtered = tenants.filter((item) => {
    if (filter === 'All') return true;
    return item.leaseStatus === filter;
  });

  const renewals = tenants.filter((t) => t.leaseStatus === 'Renewal');
  const renewalNames = renewals.slice(0, 2).map((t) => t.fullName).join(' and ');

  const handleReminder = (tenant: TenantView) => {
    Alert.alert(
      'Send Lease Reminder',
      `Send a renewal notification to ${tenant.fullName} (${tenant.propertyName} · ${tenant.roomLabel})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reminder',
          onPress: () => {
            Alert.alert(
              'Sent',
              `Renewal reminder successfully queued for ${tenant.fullName}.`
            );
          },
        },
      ]
    );
  };

  const leaseNote = (tenant: TenantView) => {
    if (!tenant.leaseEnd) return 'No lease dates on record';
    return tenant.leaseStatus === 'Renewal'
      ? `Renewal due ${formatDisplayDate(tenant.leaseEnd)}`
      : `Lease ends ${formatDisplayDate(tenant.leaseEnd)}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="document-text" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.brandTitle}>Leases & Contracts</Text>
              <Text style={styles.brandSubtitle}>TENANCY AGREEMENTS & RENEWALS</Text>
            </View>
          </View>

          {/* Overview Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>
              {renewals.length} {renewals.length === 1 ? 'Renewal' : 'Renewals'} Pending
            </Text>
            <Text style={styles.greetingSubtitle}>
              {tenants.length === 0
                ? 'Tenants and their lease terms appear here once you add them to a room.'
                : renewals.length > 0
                  ? `Lease agreements for ${renewalNames}${renewals.length > 2 ? ` and ${renewals.length - 2} more` : ''} expire within the next 60 days.`
                  : 'Every recorded lease term is current — nothing expires in the next 60 days.'}
            </Text>
            <View style={leaseStyles.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>
                  {renewals.length} Expiring Soon
                </Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>{tenants.length} Active Leases</Text>
              </View>
            </View>
          </View>

          {/* Add New Tenant */}
          <View style={leaseStyles.addCard}>
            <View style={leaseStyles.addIconWrap}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={LANDLORD_THEME.onPrimary}
              />
            </View>
            <View style={leaseStyles.addCardBody}>
              <Text style={leaseStyles.addCardTitle}>Add New Tenant</Text>
              <Text style={leaseStyles.addCardText}>
                Start an inquiry, reserve a room, or add a tenant directly to
                a room.
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordTenantForm())}
              accessibilityRole="button"
              accessibilityLabel="Add new tenant"
              style={({ pressed }) => [
                leaseStyles.addButton,
                pressed && leaseStyles.addButtonPressed,
              ]}
            >
              <Text style={leaseStyles.addButtonText}>Add Tenant</Text>
            </Pressable>
          </View>

          {/* Filters */}
          <View style={leaseStyles.filtersRow}>
            {(['All', 'Renewal', 'Active'] as LeaseFilter[]).map((f) => {
              const isSelected = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    leaseStyles.filterChip,
                    !isSelected && leaseStyles.filterChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      leaseStyles.filterChipText,
                      !isSelected && leaseStyles.filterChipTextInactive,
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Leases List */}
          <View style={leaseStyles.listContainer}>
            {filtered.length === 0 ? (
              <Text style={leaseStyles.emptyList}>No lease records in this view.</Text>
            ) : null}

            {filtered.map((lease) => (
              <Pressable
                key={lease.id}
                onPress={() => router.push(landlordTenantProfile(lease.id))}
                accessibilityRole="button"
                accessibilityLabel={`Open tenant profile for ${lease.fullName}`}
                style={({ pressed }) => [
                  styles.cardItem,
                  lease.id === tenantId && styles.cardItemHighlighted,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.cardItemTopRow}>
                  <Text style={styles.itemTitle}>{lease.fullName}</Text>
                  <View
                    style={
                      lease.leaseStatus === 'Renewal'
                        ? styles.itemBadgePeach
                        : styles.itemBadgeBlue
                    }
                  >
                    <Text
                      style={
                        lease.leaseStatus === 'Renewal'
                          ? styles.itemBadgePeachText
                          : styles.itemBadgeBlueText
                      }
                    >
                      {lease.leaseStatus}
                    </Text>
                  </View>
                </View>

                <Text style={leaseStyles.propertyRoomTitle}>
                  {lease.propertyName} · {lease.roomLabel}
                </Text>
                <Text style={styles.itemSubtext}>
                  {lease.leaseStart && lease.leaseEnd
                    ? `Term: ${formatDisplayDate(lease.leaseStart)} – ${formatDisplayDate(lease.leaseEnd)}`
                    : 'Term: not recorded'}
                </Text>
                <Text style={styles.itemSubtext}>
                  Rent: {formatPeso(lease.monthlyRent)}/month
                </Text>

                <View style={leaseStyles.leaseFooter}>
                  <Text style={styles.itemTimestamp}>{leaseNote(lease)}</Text>
                  {lease.leaseStatus === 'Renewal' && (
                    <Pressable
                      onPress={() => handleReminder(lease)}
                      style={({ pressed }) => [
                        leaseStyles.actionButton,
                        pressed && leaseStyles.actionButtonPressed,
                      ]}
                    >
                      <Text style={leaseStyles.actionButtonText}>Remind</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="leases" />
    </View>
  );
}
