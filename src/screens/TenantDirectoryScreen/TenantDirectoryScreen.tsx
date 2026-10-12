import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import {
  TENANT_STATUS_FILTERS,
  canViewProperty,
  toTenantViews,
  useLandlordData,
  useLandlordDataReady,
  type TenantStatusFilter,
  type TenantView,
} from '@/services/landlordData';
import {
  landlordTenantForm,
  landlordTenantProfile,
} from '@/routes';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { TenantStatusBadge } from '@/components/landlord/tenant/TenantStatusBadge';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { tenantDirectoryStyles as st } from './TenantDirectoryScreen.styles';

type BalanceFilter = 'all' | 'owed' | 'settled';

const BALANCE_FILTERS: { key: BalanceFilter; label: string }[] = [
  { key: 'all', label: 'Any balance' },
  { key: 'owed', label: 'With balance' },
  { key: 'settled', label: 'Settled' },
];

export default function TenantDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const presetPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const ready = useLandlordDataReady();
  const data = useLandlordData();

  const [query, setQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState(presetPropertyId ?? 'all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>('All');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');

  const properties = data.properties.filter((property) =>
    canViewProperty(property, landlordId)
  );
  const allTenants = toTenantViews(data).filter((tenant) =>
    properties.some((property) => property.id === tenant.propertyId)
  );

  const roomOptions = properties
    .filter((property) => propertyFilter === 'all' || property.id === propertyFilter)
    .flatMap((property) =>
      property.rooms.map((room) => ({
        id: room.id,
        label: `${property.name} · ${room.label}`,
      }))
    );

  const filtered = allTenants.filter((tenant) => {
    if (propertyFilter !== 'all' && tenant.propertyId !== propertyFilter) return false;
    if (roomFilter !== 'all' && tenant.roomId !== roomFilter) return false;
    if (statusFilter !== 'All' && tenant.status !== statusFilter) return false;
    if (balanceFilter === 'owed' && tenant.outstandingBalance <= 0) return false;
    if (balanceFilter === 'settled' && tenant.outstandingBalance > 0) return false;
    if (!query.trim()) return true;
    return tenant.fullName.toLowerCase().includes(query.trim().toLowerCase());
  });

  const activeCount = allTenants.filter((t) => t.status === 'Active').length;
  const reservedCount = allTenants.filter((t) => t.status === 'Reserved').length;
  const inquiryCount = allTenants.filter(
    (t) => t.status === 'Inquiry' || t.status === 'Requested'
  ).length;
  const outstandingTotal = allTenants
    .filter((t) => t.status === 'Active')
    .reduce((sum, t) => sum + t.outstandingBalance, 0);

  const renderCard = (tenant: TenantView) => {
    const roomText = tenant.roomLabel
      ? `${tenant.propertyName} · ${tenant.roomLabel}`
      : `${tenant.propertyName} · No room assigned`;
    return (
      <Pressable
        key={tenant.id}
        onPress={() => router.push(landlordTenantProfile(tenant.id))}
        style={({ pressed }) => [st.card, pressed && st.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${tenant.fullName}, ${tenant.status}, ${roomText}`}
      >
        {tenant.photoUri ? (
          <Image
            source={{ uri: tenant.photoUri }}
            style={st.avatar}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[st.avatar, st.avatarPlaceholder]}>
            <Text style={st.avatarInitials}>{tenant.initials}</Text>
          </View>
        )}
        <View style={st.cardBody}>
          <View style={st.cardTopRow}>
            <Text style={st.cardTitle} numberOfLines={1}>
              {tenant.fullName}
            </Text>
            <TenantStatusBadge status={tenant.status} />
          </View>
          <Text style={st.cardSubtitle} numberOfLines={1}>
            {roomText}
          </Text>
          <View style={st.cardMetaRow}>
            {tenant.monthlyRent > 0 ? (
              <Text style={st.cardRent}>{formatPeso(tenant.monthlyRent)}/mo</Text>
            ) : null}
            {tenant.status === 'Active' && tenant.nextDueDate ? (
              <View style={st.duePill}>
                <Ionicons name="calendar-outline" size={11} color={LANDLORD_THEME.badgeBlueText} />
                <Text style={st.duePillText}>Due {formatShortDate(tenant.nextDueDate)}</Text>
              </View>
            ) : null}
            {tenant.outstandingBalance > 0 ? (
              <View style={st.balancePill}>
                <Text style={st.balancePillText}>
                  {formatPeso(tenant.outstandingBalance)} due
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

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
          <View style={styles.headerRow}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="people" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={st.headerTextCol}>
              <Text style={styles.brandTitle}>Tenants</Text>
              <Text style={styles.brandSubtitle}>PROSPECTS, TENANTS & HISTORY</Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordTenantForm())}
              style={({ pressed }) => [st.headerAction, pressed && st.headerActionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Add tenant or inquiry"
            >
              <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
              <Text style={st.headerActionText}>Add</Text>
            </Pressable>
          </View>

          {!ready ? (
            <View style={st.loadingBox}>
              <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
              <Text style={st.loadingText}>Loading tenants…</Text>
            </View>
          ) : (
            <>
              {/* Stats */}
              <View style={st.statsRow}>
                <View style={st.statBox}>
                  <Text style={st.statValue}>{activeCount}</Text>
                  <Text style={st.statLabel}>Active</Text>
                </View>
                <View style={st.statBox}>
                  <Text style={st.statValue}>{reservedCount}</Text>
                  <Text style={st.statLabel}>Reserved</Text>
                </View>
                <View style={st.statBox}>
                  <Text style={st.statValue}>{inquiryCount}</Text>
                  <Text style={st.statLabel}>Prospects</Text>
                </View>
                <View style={st.statBox}>
                  <Text style={[st.statValue, outstandingTotal > 0 && st.statValueAlert]}>
                    {outstandingTotal > 0 ? formatPeso(outstandingTotal) : '—'}
                  </Text>
                  <Text style={st.statLabel}>Outstanding</Text>
                </View>
              </View>

              {/* Search */}
              <View style={st.searchBar}>
                <Ionicons name="search-outline" size={17} color={LANDLORD_THEME.textMuted} />
                <TextInput
                  style={st.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by tenant name"
                  placeholderTextColor={LANDLORD_THEME.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Search tenants by name"
                />
                {query.length > 0 ? (
                  <Pressable
                    onPress={() => setQuery('')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                  >
                    <Ionicons name="close-circle" size={17} color={LANDLORD_THEME.textMuted} />
                  </Pressable>
                ) : null}
              </View>

              {/* Filters */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {[{ id: 'all', name: 'All properties' }, ...properties.map((p) => ({ id: p.id, name: p.name }))].map(
                  (option) => {
                    const isActive = propertyFilter === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          setPropertyFilter(option.id);
                          setRoomFilter('all');
                        }}
                        style={[st.chip, !isActive && st.chipInactive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={`Property filter: ${option.name}`}
                      >
                        <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                          {option.name}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {[{ id: 'all', label: 'Any room' }, ...roomOptions.map((r) => ({ id: r.id, label: r.label }))].map(
                  (option) => {
                    const isActive = roomFilter === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => setRoomFilter(option.id)}
                        style={[st.chip, !isActive && st.chipInactive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={`Room filter: ${option.label}`}
                      >
                        <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {TENANT_STATUS_FILTERS.map((option) => {
                  const isActive = statusFilter === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setStatusFilter(option)}
                      style={[st.chip, !isActive && st.chipInactive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Status filter: ${option}`}
                    >
                      <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {BALANCE_FILTERS.map((option) => {
                  const isActive = balanceFilter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setBalanceFilter(option.key)}
                      style={[st.chip, !isActive && st.chipInactive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Balance filter: ${option.label}`}
                    >
                      <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* List */}
              {filtered.length === 0 ? (
                <View style={st.emptyCard}>
                  <Ionicons name="people-outline" size={26} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.emptyTitle}>
                    {allTenants.length === 0 ? 'No tenants yet' : 'No matching tenants'}
                  </Text>
                  <Text style={st.emptyBody}>
                    {allTenants.length === 0
                      ? 'Log a renter inquiry or add a tenant to start tracking tenancies.'
                      : 'Try different filters or clear the search.'}
                  </Text>
                  {allTenants.length === 0 ? (
                    <Pressable
                      onPress={() => router.push(landlordTenantForm())}
                      style={({ pressed }) => [st.emptyButton, pressed && st.emptyButtonPressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Add your first tenant"
                    >
                      <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
                      <Text style={st.emptyButtonText}>Add Tenant</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                filtered.map(renderCard)
              )}
            </>
          )}
        </View>
      </ScrollView>
      <LandlordBottomBar active="leases" />
    </View>
  );
}
