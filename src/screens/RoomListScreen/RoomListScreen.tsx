import { useMemo, useState } from 'react';
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
  canViewProperty,
  roomAvailability,
  useLandlordData,
  useLandlordDataReady,
  type LandlordRoom,
  type RoomAvailability,
  type RoomType,
} from '@/services/landlordData';
import { landlordRoomDetails, landlordRoomForm } from '@/routes';
import { formatPeso } from '@/utils/currency';
import { RoomAvailabilityBadge } from '@/components/landlord/property/RoomAvailabilityBadge';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { roomListStyles as st } from './RoomListScreen.styles';

type PriceFilter = 'all' | 'low' | 'mid' | 'high';

const TYPE_FILTERS: { key: 'all' | RoomType; label: string }[] = [
  { key: 'all', label: 'All types' },
  { key: 'Private Room', label: 'Private' },
  { key: 'Shared Room', label: 'Shared' },
  { key: 'Bed Space', label: 'Bed Space' },
];

const PRICE_FILTERS: { key: PriceFilter; label: string }[] = [
  { key: 'all', label: 'Any price' },
  { key: 'low', label: '≤ ₱2,000' },
  { key: 'mid', label: '₱2,001–3,000' },
  { key: 'high', label: '₱3,001+' },
];

const AVAILABILITY_FILTERS: { key: 'all' | RoomAvailability; label: string }[] = [
  { key: 'all', label: 'Any status' },
  { key: 'Available', label: 'Available' },
  { key: 'Occupied', label: 'Occupied' },
  { key: 'Reserved', label: 'Reserved' },
  { key: 'Maintenance', label: 'Maintenance' },
];

function matchesPrice(rent: number, filter: PriceFilter): boolean {
  if (filter === 'low') return rent <= 2000;
  if (filter === 'mid') return rent >= 2001 && rent <= 3000;
  if (filter === 'high') return rent >= 3001;
  return true;
}

export default function RoomListScreen() {
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
  const [propertyFilter, setPropertyFilter] = useState<string>(presetPropertyId ?? 'all');
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | RoomAvailability>('all');

  const properties = useMemo(
    () =>
      toOwnedProperties(data, landlordId),
    [data, landlordId]
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties
      .filter((property) => propertyFilter === 'all' || property.id === propertyFilter)
      .map((property) => ({
        property,
        rooms: property.rooms.filter((room) => {
          const availability = roomAvailability(room);
          if (typeFilter !== 'all' && room.roomType !== typeFilter) return false;
          if (!matchesPrice(room.rent, priceFilter)) return false;
          if (availabilityFilter !== 'all' && availability !== availabilityFilter)
            return false;
          if (!q) return true;
          return [room.label, property.name, room.roomType, room.description]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(q));
        }),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [properties, propertyFilter, typeFilter, priceFilter, availabilityFilter, query]);

  const totalRooms = filteredGroups.reduce((sum, group) => sum + group.rooms.length, 0);

  const renderRoomCard = (room: LandlordRoom, propertyName: string) => {
    const availability = roomAvailability(room);
    const occupants =
      data.tenants.filter((t) => t.roomId === room.id && t.status === 'Active').length;
    const cover = room.photos[0];
    return (
      <Pressable
        key={room.id}
        onPress={() => router.push(landlordRoomDetails(room.id))}
        style={({ pressed }) => [st.card, pressed && st.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${room.label}, ${propertyName}, ${room.roomType}, ${formatPeso(room.rent)} per month, ${availability}, ${occupants} of ${room.maxCapacity} occupants`}
      >
        {cover ? (
          <Image source={{ uri: cover }} style={st.cardThumb} contentFit="cover" transition={150} />
        ) : (
          <View style={[st.cardThumb, st.cardThumbPlaceholder]}>
            <Ionicons name="bed-outline" size={24} color={LANDLORD_THEME.primaryDark} />
          </View>
        )}
        <View style={st.cardBody}>
          <View style={st.cardTopRow}>
            <Text style={st.cardTitle} numberOfLines={1}>
              {room.label}
            </Text>
            <RoomAvailabilityBadge availability={availability} />
          </View>
          <Text style={st.cardSubtitle} numberOfLines={1}>
            {propertyName} · {room.roomType}
          </Text>
          <View style={st.cardMetaRow}>
            <Text style={st.cardRent}>{formatPeso(room.rent)}/mo</Text>
            <View style={st.occupancyPill}>
              <Ionicons name="people-outline" size={11} color={LANDLORD_THEME.badgeBlueText} />
              <Text style={st.occupancyPillText}>
                {occupants} of {room.maxCapacity} occupants
              </Text>
            </View>
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
              <Ionicons name="bed" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={st.headerTextCol}>
              <Text style={styles.brandTitle}>Room Management</Text>
              <Text style={styles.brandSubtitle}>ALL ROOMS BY PROPERTY</Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordRoomForm(undefined, presetPropertyId))}
              style={({ pressed }) => [st.headerAction, pressed && st.headerActionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Add room"
            >
              <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
              <Text style={st.headerActionText}>Add</Text>
            </Pressable>
          </View>

          {!ready ? (
            <View style={st.loadingBox}>
              <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
              <Text style={st.loadingText}>Loading rooms…</Text>
            </View>
          ) : (
            <>
              {/* Search */}
              <View style={st.searchBar}>
                <Ionicons name="search-outline" size={17} color={LANDLORD_THEME.textMuted} />
                <TextInput
                  style={st.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search rooms or properties"
                  placeholderTextColor={LANDLORD_THEME.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Search rooms"
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
                        onPress={() => setPropertyFilter(option.id)}
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
                {TYPE_FILTERS.map((option) => {
                  const isActive = typeFilter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setTypeFilter(option.key)}
                      style={[st.chip, !isActive && st.chipInactive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Type filter: ${option.label}`}
                    >
                      <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {PRICE_FILTERS.map((option) => {
                  const isActive = priceFilter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setPriceFilter(option.key)}
                      style={[st.chip, !isActive && st.chipInactive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Price filter: ${option.label}`}
                    >
                      <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                {AVAILABILITY_FILTERS.map((option) => {
                  const isActive = availabilityFilter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setAvailabilityFilter(option.key)}
                      style={[st.chip, !isActive && st.chipInactive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Availability filter: ${option.label}`}
                    >
                      <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Grouped rooms */}
              {totalRooms === 0 ? (
                <View style={st.emptyCard}>
                  <Ionicons name="bed-outline" size={26} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.emptyTitle}>
                    {properties.reduce((sum, p) => sum + p.rooms.length, 0) === 0
                      ? 'No rooms yet'
                      : 'No matching rooms'}
                  </Text>
                  <Text style={st.emptyBody}>
                    {properties.reduce((sum, p) => sum + p.rooms.length, 0) === 0
                      ? 'Add your first room to start tracking occupancy, rates, and capacity.'
                      : 'Try different filters or clear the search.'}
                  </Text>
                  {properties.reduce((sum, p) => sum + p.rooms.length, 0) === 0 ? (
                    <Pressable
                      onPress={() => router.push(landlordRoomForm(undefined, presetPropertyId))}
                      style={({ pressed }) => [st.emptyButton, pressed && st.emptyButtonPressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Add your first room"
                    >
                      <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
                      <Text style={st.emptyButtonText}>Add Room</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                filteredGroups.map((group) => (
                  <View key={group.property.id} style={st.group}>
                    <View style={st.groupHeader}>
                      <View style={st.groupHeaderCopy}>
                        <Text style={st.groupTitle} numberOfLines={1}>
                          {group.property.name}
                        </Text>
                        <Text style={st.groupSubtitle} numberOfLines={1}>
                          {group.property.address}
                        </Text>
                      </View>
                      <View style={st.groupCount}>
                        <Text style={st.groupCountText}>{group.rooms.length}</Text>
                      </View>
                    </View>
                    {group.rooms.map((room) => renderRoomCard(room, group.property.name))}
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <LandlordBottomBar active="properties" />
    </View>
  );
}

function toOwnedProperties(
  data: ReturnType<typeof useLandlordData>,
  landlordId?: string
) {
  return data.properties.filter((property) => canViewProperty(property, landlordId));
}
