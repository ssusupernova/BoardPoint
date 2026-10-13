import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import {
  ROOM_AVAILABILITIES,
  billStatus,
  canViewProperty,
  roomAvailability,
  updateRoom,
  useLandlordData,
  useLandlordDataReady,
  type RoomAvailability,
} from '@/services/landlordData';
import { landlordPropertyDetails, landlordRoomForm } from '@/routes';
import { formatPeso } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import { RoomAvailabilityBadge } from '@/components/landlord/property/RoomAvailabilityBadge';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { roomDetailsStyles as st } from './RoomDetailsScreen.styles';

type Tab = 'Overview' | 'Tenancy' | 'History';

const TABS: { key: Tab; label: string }[] = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Tenancy', label: 'Tenancy' },
  { key: 'History', label: 'History' },
];

const BILL_BADGE: Record<string, { bg: string; text: string }> = {
  Paid: { bg: '#E8F0E4', text: '#647C59' },
  Due: { bg: '#FDECD8', text: '#8E5526' },
  Overdue: { bg: '#FDEEE6', text: '#CE5726' },
  Upcoming: { bg: '#93C5E2', text: '#164A66' },
};

export default function RoomDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ roomId?: string }>();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

  const ready = useLandlordDataReady();
  const data = useLandlordData();
  const [tab, setTab] = useState<Tab>('Overview');

  const found = (() => {
    if (!roomId) return null;
    for (const property of data.properties) {
      if (!canViewProperty(property, landlordId)) continue;
      const room = property.rooms.find((item) => item.id === roomId);
      if (room) return { room, property };
    }
    return null;
  })();

  const occupants = found ? data.tenants.filter((t) => t.roomId === found.room.id) : [];
  const activeOccupants = occupants.filter((t) => t.status === 'Active');
  const roomBills = (
    found
      ? data.bills
          .filter((bill) => bill.roomId === found.room.id)
          .map((bill) => ({ bill, status: billStatus(bill) }))
      : []
  ).sort((a, b) => b.bill.dueDate.localeCompare(a.bill.dueDate));

  const [availDraft, setAvailDraft] = useState<RoomAvailability | null>(null);
  const availability = found ? availDraft ?? roomAvailability(found.room) : 'Available';
  const availabilityLocked =
    found != null &&
    activeOccupants.length > 0 &&
    activeOccupants.length >= (found.room.maxCapacity ?? 1);

  const [savingAvailability, setSavingAvailability] = useState(false);

  const saveAvailability = async () => {
    if (!found) return;
    setSavingAvailability(true);
    try {
      await updateRoom(found.property.id, found.room.id, { availability }, landlordId);
      setAvailDraft(null);
    } catch (error) {
      Alert.alert('Could not update availability', toErrorMessage(error));
    } finally {
      setSavingAvailability(false);
    }
  };

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={st.centerFill}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={st.loadingText}>Loading room…</Text>
        </View>
      </View>
    );
  }

  if (!found) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          <View style={st.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [st.backButton, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <Text style={st.headerTitle}>Room</Text>
          </View>
          <View style={st.centerFill}>
            <Ionicons name="alert-circle-outline" size={30} color={LANDLORD_THEME.textMuted} />
            <Text style={st.notFoundTitle}>Room not found</Text>
            <Text style={st.notFoundBody}>
              It may have been removed, or you do not have access to it.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const { room, property } = found;
  const cover = room.photos[0];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={st.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [st.backButton, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={st.headerCopy}>
              <Text style={st.headerTitle} numberOfLines={1}>
                {room.label}
              </Text>
              <Text style={st.headerSubtitle} numberOfLines={1}>
                {property.name}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordRoomForm(room.id))}
              style={({ pressed }) => [st.editButton, pressed && st.editButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit room"
            >
              <Ionicons name="create-outline" size={15} color={LANDLORD_THEME.onPrimary} />
              <Text style={st.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={st.hero}>
            {cover ? (
              <Image source={{ uri: cover }} style={st.heroImage} contentFit="cover" transition={150} />
            ) : (
              <View style={st.heroPlaceholder}>
                <Ionicons name="bed-outline" size={34} color={LANDLORD_THEME.primaryDark} />
              </View>
            )}
            <View style={st.heroBody}>
              <View style={st.heroBadges}>
                <RoomAvailabilityBadge availability={availability} />
                <View style={st.typeBadge}>
                  <Text style={st.typeBadgeText}>{room.roomType}</Text>
                </View>
              </View>
              <Text style={st.heroRent}>{formatPeso(room.rent)}<Text style={st.heroRentUnit}>/month</Text></Text>
              <View style={st.heroOccupancy}>
                <Ionicons name="people-outline" size={13} color={LANDLORD_THEME.badgeBlueText} />
                <Text style={st.heroOccupancyText}>
                  {activeOccupants.length} of {room.maxCapacity ?? 1} occupants
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={st.tabs}>
            {TABS.map((item) => {
              const isActive = tab === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setTab(item.key)}
                  style={[st.tab, isActive && st.tabActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Tab: ${item.label}`}
                >
                  <Text style={[st.tabText, isActive && st.tabTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'Overview' ? (
            <>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>About this room</Text>
                {room.description ? (
                  <Text style={st.bodyText}>{room.description}</Text>
                ) : (
                  <Text style={st.mutedText}>No description added yet.</Text>
                )}
                {room.furnishings.length > 0 ? (
                  <View style={st.tagsWrap}>
                    {room.furnishings.map((item) => (
                      <View key={item} style={st.tag}>
                        <Text style={st.tagText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Capacity</Text>
                <View style={st.capacityRow}>
                  <View style={st.capacityItem}>
                    <Text style={st.capacityValue}>{room.maxCapacity ?? 1}</Text>
                    <Text style={st.capacityLabel}>Max capacity</Text>
                  </View>
                  <View style={st.capacityDivider} />
                  <View style={st.capacityItem}>
                    <Text style={st.capacityValue}>{activeOccupants.length}</Text>
                    <Text style={st.capacityLabel}>Active occupants</Text>
                  </View>
                  <View style={st.capacityDivider} />
                  <View style={st.capacityItem}>
                    <Text style={st.capacityValue}>
                      {Math.max(0, (room.maxCapacity ?? 1) - activeOccupants.length)}
                    </Text>
                    <Text style={st.capacityLabel}>Slots free</Text>
                  </View>
                </View>
                <Text style={form.sectionHint}>
                  A room can never have fewer slots than its active occupants, and a fully
                  occupied room can not be marked Available.
                </Text>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Availability</Text>
                <View style={st.chipsWrap}>
                  {ROOM_AVAILABILITIES.map((option) => {
                    const isActive = availability === option;
                    const disabled = option === 'Available' && availabilityLocked;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          if (disabled) return;
                          setAvailDraft(option as RoomAvailability);
                        }}
                        disabled={disabled}
                        style={[st.chip, !isActive && st.chipInactive, disabled && st.chipDisabled]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive, disabled }}
                        accessibilityLabel={`Availability: ${option}`}
                      >
                        <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {availabilityLocked ? (
                  <Text style={form.sectionHint}>
                    Fully occupied by active tenants — resolve the tenancy before marking
                    Available.
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => void saveAvailability()}
                  disabled={savingAvailability || availDraft == null}
                  style={({ pressed }) => [
                    form.primaryButton,
                    { marginTop: 12 },
                    pressed && form.primaryButtonPressed,
                    (savingAvailability || availDraft == null) && form.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Save availability"
                >
                  {savingAvailability ? (
                    <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color={LANDLORD_THEME.onPrimary} />
                      <Text style={form.primaryButtonText}>Save Availability</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push(landlordPropertyDetails(property.id))}
                style={({ pressed }) => [form.sectionCard, st.propertyCard, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={`Open property ${property.name}`}
              >
                <View style={st.propertyIcon}>
                  <Ionicons name="home-outline" size={18} color={LANDLORD_THEME.primaryDark} />
                </View>
                <View style={st.propertyCopy}>
                  <Text style={st.propertyName}>{property.name}</Text>
                  <Text style={st.propertyAddress} numberOfLines={2}>
                    {property.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={LANDLORD_THEME.textMuted} />
              </Pressable>
            </>
          ) : null}

          {tab === 'Tenancy' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Tenancy records</Text>
              {occupants.length === 0 ? (
                <View style={st.emptyBox}>
                  <Ionicons name="person-outline" size={26} color={LANDLORD_THEME.textMuted} />
                  <Text style={st.emptyTitle}>No tenancy records</Text>
                  <Text style={st.emptyBody}>
                    No tenant has ever been assigned to this room.
                  </Text>
                </View>
              ) : (
                [...occupants]
                  .sort((a, b) => (a.status === 'Active' ? -1 : 1) - (b.status === 'Active' ? -1 : 1))
                  .map((tenant) => (
                    <View key={tenant.id} style={st.tenantCard}>
                      <View style={st.tenantAvatar}>
                        <Text style={st.tenantInitials}>
                          {tenant.fullName
                            .split(' ')
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join('')}
                        </Text>
                      </View>
                      <View style={st.tenantCopy}>
                        <Text style={st.tenantName}>{tenant.fullName}</Text>
                        <Text style={st.tenantMeta}>
                          {formatPeso(tenant.monthlyRent)}/mo
                          {tenant.leaseStart || tenant.leaseEnd
                            ? ` · ${tenant.leaseStart ? formatShortDate(tenant.leaseStart) : '—'} – ${
                                tenant.leaseEnd ? formatShortDate(tenant.leaseEnd) : 'Open'
                              }`
                            : ''}
                        </Text>
                      </View>
                      <View
                        style={[
                          st.statusPill,
                          {
                            backgroundColor:
                              tenant.status === 'Active'
                                ? LANDLORD_THEME.badgeBlueBg
                                : LANDLORD_THEME.badgePeachBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            st.statusPillText,
                            {
                              color:
                                tenant.status === 'Active'
                                  ? LANDLORD_THEME.badgeBlueText
                                  : LANDLORD_THEME.badgePeachText,
                            },
                          ]}
                        >
                          {tenant.status}
                        </Text>
                      </View>
                    </View>
                  ))
              )}
            </View>
          ) : null}

          {tab === 'History' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Rental history</Text>
              {roomBills.length === 0 ? (
                <View style={st.emptyBox}>
                  <Ionicons name="receipt-outline" size={26} color={LANDLORD_THEME.textMuted} />
                  <Text style={st.emptyTitle}>No rental history</Text>
                  <Text style={st.emptyBody}>
                    Bills for this room will appear here once they are generated.
                  </Text>
                </View>
              ) : (
                roomBills.map(({ bill, status }) => {
                  const tenant = data.tenants.find((item) => item.id === bill.tenantId);
                  const badge = BILL_BADGE[status] ?? BILL_BADGE.Due;
                  return (
                    <View key={bill.id} style={st.billCard}>
                      <View style={st.billCopy}>
                        <Text style={st.billPeriod}>{bill.period}</Text>
                        <Text style={st.billMeta}>
                          {tenant?.fullName ?? 'Tenant'} · Due {formatShortDate(bill.dueDate)}
                        </Text>
                      </View>
                      <View style={st.billRight}>
                        <Text style={st.billAmount}>{formatPeso(bill.amount)}</Text>
                        <View style={[st.statusPill, { backgroundColor: badge.bg }]}>
                          <Text style={[st.statusPillText, { color: badge.text }]}>{status}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
