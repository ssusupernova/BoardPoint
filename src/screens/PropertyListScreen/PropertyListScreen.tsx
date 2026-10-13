import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import {
  canViewProperty,
  toPropertyViews,
  useLandlordData,
  type ListingStatus,
  type PropertyView,
} from '@/services/landlordData';
import { landlordPropertyDetails, landlordPropertyForm, routes } from '@/routes';
import { ListingStatusBadge } from '@/components/landlord/ListingStatusBadge';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { propertyListStyles as st } from './PropertyListScreen.styles';

type StatusFilter = 'all' | ListingStatus;
type AvailabilityFilter = 'all' | 'vacant' | 'occupied';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Published', label: 'Published' },
  { key: 'Draft', label: 'Draft' },
  { key: 'Inactive', label: 'Inactive' },
  { key: 'Archived', label: 'Archived' },
];

const AVAILABILITY_FILTERS: { key: AvailabilityFilter; label: string }[] = [
  { key: 'all', label: 'Any availability' },
  { key: 'vacant', label: 'With vacancy' },
  { key: 'occupied', label: 'Fully occupied' },
];

export default function PropertyListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const data = useLandlordData();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');

  const properties = useMemo(
    () => toPropertyViews(data).filter((property) => canViewProperty(property, landlordId)),
    [data, landlordId]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: properties.length };
    for (const property of properties) {
      counts[property.listingStatus] = (counts[property.listingStatus] ?? 0) + 1;
    }
    return counts;
  }, [properties]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((property) => {
      if (statusFilter !== 'all' && property.listingStatus !== statusFilter) return false;
      if (availabilityFilter === 'vacant' && property.availableRooms === 0) return false;
      if (availabilityFilter === 'occupied' && property.availableRooms > 0) return false;
      if (!q) return true;
      return [property.name, property.address, property.city, property.barangay]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });
  }, [properties, query, statusFilter, availabilityFilter]);

  const occupied = properties.reduce((sum, p) => sum + p.occupiedRooms, 0);
  const available = properties.reduce((sum, p) => sum + p.availableRooms, 0);
  const totalRooms = properties.reduce((sum, p) => sum + p.totalRooms, 0);

  const renderCard = (property: PropertyView) => {
    const cover = property.photos[0] ?? property.imageUri;
    return (
      <View key={property.id} style={st.card}>
        <Pressable
          onPress={() => router.push(landlordPropertyDetails(property.id))}
          accessibilityRole="button"
          accessibilityLabel={`${property.name}, ${property.listingStatus}, ${property.totalRooms} rooms, ${property.availableRooms} available`}
        >
          <View style={st.coverWrap}>
            {cover ? (
              <Image source={{ uri: cover }} style={st.cover} contentFit="cover" transition={180} />
            ) : (
              <View style={st.coverPlaceholder}>
                <Ionicons name="business-outline" size={30} color={LANDLORD_THEME.primaryDark} />
              </View>
            )}
            <View style={st.coverStatus}>
              <ListingStatusBadge status={property.listingStatus} />
            </View>
          </View>

          <Text style={st.cardName} numberOfLines={1}>
            {property.name}
          </Text>

          <View style={st.addressRow}>
            <Ionicons name="location-outline" size={13} color={LANDLORD_THEME.textMuted} />
            <Text style={st.addressText} numberOfLines={2}>
              {property.address}
            </Text>
          </View>

          <View style={st.countsRow}>
            <View style={[st.countPill, st.countPillPeach]}>
              <Ionicons name="grid-outline" size={11} color={LANDLORD_THEME.badgePeachText} />
              <Text style={[st.countPillText, st.countPillTextPeach]}>
                {property.totalRooms} rooms
              </Text>
            </View>
            <View style={st.countPill}>
              <Ionicons name="people-outline" size={11} color={LANDLORD_THEME.textSecondary} />
              <Text style={st.countPillText}>{property.occupiedRooms} occupied</Text>
            </View>
            <View style={[st.countPill, st.countPillBlue]}>
              <Ionicons name="key-outline" size={11} color={LANDLORD_THEME.badgeBlueText} />
              <Text style={[st.countPillText, st.countPillTextBlue]}>
                {property.availableRooms} available
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={st.actionsRow}>
          <Pressable
            onPress={() => router.push(landlordPropertyForm(property.id))}
            style={({ pressed }) => [st.actionButton, pressed && st.actionButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${property.name}`}
          >
            <Ionicons name="create-outline" size={14} color={LANDLORD_THEME.primaryDark} />
            <Text style={st.actionButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(landlordPropertyDetails(property.id))}
            style={({ pressed }) => [
              st.actionButton,
              st.actionButtonPrimary,
              pressed && st.actionButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`View details of ${property.name}`}
          >
            <Text style={[st.actionButtonText, st.actionButtonTextPrimary]}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color={LANDLORD_THEME.onPrimary} />
          </Pressable>
        </View>
      </View>
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
              <Ionicons name="business" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={st.headerTextCol}>
              <Text style={styles.brandTitle}>My Properties</Text>
              <Text style={styles.brandSubtitle}>OWNED & MANAGED LISTINGS</Text>
            </View>
            <Pressable
              onPress={() => router.push(routes.landlordAddProperty)}
              style={({ pressed }) => [st.headerAction, pressed && st.headerActionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Add property"
            >
              <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
              <Text style={st.headerActionText}>Add</Text>
            </Pressable>
          </View>

          {/* Portfolio Stats */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>
              {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              {totalRooms === 0
                ? 'Add rooms to a property to start tracking occupancy.'
                : `${occupied} of ${totalRooms} rooms occupied. ${available} rooms currently available for lease.`}
            </Text>
            <View style={st.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>{occupied} Occupied</Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>{available} Available</Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View style={st.searchBar}>
            <Ionicons name="search-outline" size={17} color={LANDLORD_THEME.textMuted} />
            <TextInput
              style={st.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, address, or barangay"
              placeholderTextColor={LANDLORD_THEME.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search properties"
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

          {/* Status filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.chipsRow}
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setStatusFilter(filter.key)}
                  style={[st.chip, !isActive && st.chipInactive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Filter by ${filter.label}`}
                >
                  <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                    {filter.label} ({statusCounts[filter.key] ?? 0})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Availability filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[st.chipsRow, st.chipsRowSpaced]}
          >
            {AVAILABILITY_FILTERS.map((filter) => {
              const isActive = availabilityFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setAvailabilityFilter(filter.key)}
                  style={[st.chip, !isActive && st.chipInactive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Availability: ${filter.label}`}
                >
                  <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Cards */}
          <View style={st.listContainer}>
            {filtered.length === 0 ? (
              <View style={st.emptyCard}>
                <Ionicons name="search-outline" size={24} color={LANDLORD_THEME.primaryDark} />
                <Text style={st.emptyTitle}>
                  {properties.length === 0 ? 'No properties yet' : 'No matching properties'}
                </Text>
                <Text style={st.emptyBody}>
                  {properties.length === 0
                    ? 'Add your first boarding house to start tracking rooms, tenants, and occupancy.'
                    : 'Try a different search term or clear the filters.'}
                </Text>
                {properties.length === 0 ? (
                  <Pressable
                    onPress={() => router.push(routes.landlordAddProperty)}
                    style={({ pressed }) => [st.emptyButton, pressed && st.emptyButtonPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Add your first property"
                  >
                    <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
                    <Text style={st.emptyButtonText}>Add Property</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              filtered.map(renderCard)
            )}
          </View>
        </View>
      </ScrollView>

      <LandlordBottomBar active="properties" />
    </View>
  );
}
