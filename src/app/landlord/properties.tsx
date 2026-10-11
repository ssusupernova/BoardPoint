import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  toPropertyViews,
  useLandlordData,
} from '@/services/landlordData';
import { routes } from '@/routes';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import { styles, propertyStyles, LANDLORD_THEME } from './style';

type FilterMode = 'all' | 'vacant' | 'occupied';

export default function LandlordPropertiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const data = useLandlordData();

  const properties = useMemo(() => toPropertyViews(data), [data]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [expandedId, setExpandedId] = useState<string | null>(
    propertyId ?? properties[0]?.id ?? null
  );

  const filteredProperties = properties.filter((p) => {
    if (filter === 'vacant') return p.availableRooms > 0;
    if (filter === 'occupied') return p.availableRooms === 0;
    return true;
  });

  const occupied = properties.reduce((sum, p) => sum + p.occupiedRooms, 0);
  const available = properties.reduce((sum, p) => sum + p.availableRooms, 0);
  const totalRooms = properties.reduce((sum, p) => sum + p.totalRooms, 0);
  const vacantCount = properties.filter((p) => p.availableRooms > 0).length;

  const tenantName = (tenantId?: string) =>
    data.tenants.find((t) => t.id === tenantId)?.fullName;

  const rateLabel = (min: number, max: number) =>
    min === max
      ? `${formatPeso(min)}/mo`
      : `${formatPeso(min)}–${formatPeso(max)}/mo`;

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
              <Ionicons name="business" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={propertyStyles.headerTextColFlex}>
              <Text style={styles.brandTitle}>Your Properties</Text>
              <Text style={styles.brandSubtitle}>PORTFOLIO OVERVIEW & UNITS</Text>
            </View>
            <Pressable
              onPress={() => router.push(routes.landlordListSpace)}
              style={({ pressed }) => [
                propertyStyles.headerAction,
                pressed && propertyStyles.headerActionPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="List new space"
            >
              <Ionicons name="add" size={16} color={LANDLORD_THEME.primaryDark} />
              <Text style={propertyStyles.headerActionText}>Add</Text>
            </Pressable>
          </View>

          {/* Portfolio Stats Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>
              {properties.length} Active {properties.length === 1 ? 'Property' : 'Properties'}
            </Text>
            <Text style={styles.greetingSubtitle}>
              {totalRooms === 0
                ? 'Add rooms to this portfolio to start tracking occupancy.'
                : `${occupied} of ${totalRooms} rooms occupied. ${available} rooms currently available for lease.`}
            </Text>
            <View style={propertyStyles.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>{occupied} Occupied</Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>{available} Available</Text>
              </View>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={propertyStyles.filtersRow}>
            <Pressable
              onPress={() => setFilter('all')}
              style={[
                propertyStyles.filterChip,
                filter !== 'all' && propertyStyles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  propertyStyles.filterChipText,
                  filter !== 'all' && propertyStyles.filterChipTextInactive,
                ]}
              >
                All ({properties.length})
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('vacant')}
              style={[
                propertyStyles.filterChip,
                filter !== 'vacant' && propertyStyles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  propertyStyles.filterChipText,
                  filter !== 'vacant' && propertyStyles.filterChipTextInactive,
                ]}
              >
                With Vacancy ({vacantCount})
              </Text>
            </Pressable>
          </View>

          {/* Properties List */}
          <View style={propertyStyles.listContainer}>
            {filteredProperties.length === 0 ? (
              <Text style={propertyStyles.emptyList}>
                No properties match this filter yet.
              </Text>
            ) : null}

            {filteredProperties.map((prop) => {
              const isExpanded = expandedId === prop.id;
              return (
                <View key={prop.id} style={styles.cardItem}>
                  <Pressable
                    onPress={() => setExpandedId(isExpanded ? null : prop.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${prop.name}, click to toggle rooms`}
                  >
                    <View style={styles.cardItemTopRow}>
                      <Text style={styles.itemTitle}>{prop.name}</Text>
                      <View style={styles.itemBadgePeach}>
                        <Text style={styles.itemBadgePeachText}>
                          {prop.totalRooms} rooms
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.itemSubtext}>
                      {prop.address} · {prop.occupiedRooms} occupied ·{' '}
                      {prop.availableRooms} available
                    </Text>
                    <View style={styles.propertyDueRow}>
                      <Text style={styles.dueLabel}>
                        Rate: {rateLabel(prop.minRent, prop.maxRent)}
                      </Text>
                      <View style={propertyStyles.dueContainer}>
                        <Text style={styles.dueDateValue}>
                          {prop.nextDueDate
                            ? `Due: ${formatShortDate(prop.nextDueDate)}`
                            : 'No due date'}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={LANDLORD_THEME.textMuted}
                        />
                      </View>
                    </View>
                  </Pressable>

                  {/* Expanded Rooms List */}
                  {isExpanded && (
                    <View style={propertyStyles.roomsSection}>
                      <Text style={propertyStyles.roomsSectionTitle}>
                        ROOM STATUS
                      </Text>
                      {prop.rooms.map((room) => {
                        const name = tenantName(room.tenantId);
                        const bill = data.bills.find(
                          (b) => b.roomId === room.id && !b.paidAt
                        );
                        return (
                          <View key={room.id} style={propertyStyles.roomRow}>
                            <View>
                              <Text style={propertyStyles.roomNumber}>
                                {room.label}
                              </Text>
                              {name ? (
                                <Text style={propertyStyles.roomTenant}>
                                  Tenant: {name}
                                </Text>
                              ) : (
                                <Text style={propertyStyles.roomAvailableText}>
                                  Ready to rent · {formatPeso(room.rent)}/mo
                                </Text>
                              )}
                            </View>
                            <View
                              style={
                                room.status === 'Available'
                                  ? styles.itemBadgeBlue
                                  : bill
                                    ? styles.itemBadgeUrgent
                                    : styles.itemBadgePeach
                              }
                            >
                              <Text
                                style={
                                  room.status === 'Available'
                                    ? styles.itemBadgeBlueText
                                    : bill
                                      ? styles.itemBadgeUrgentText
                                      : styles.itemBadgePeachText
                                }
                              >
                                {room.status === 'Available'
                                  ? 'Available'
                                  : bill
                                    ? 'Rent Due'
                                    : 'Paid'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="properties" />
    </View>
  );
}
