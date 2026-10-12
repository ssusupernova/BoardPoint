import { useMemo, useState } from 'react';
import {
  Alert,
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
import * as ImagePicker from 'expo-image-picker';
import { useAuthSession } from '@/services/auth';
import {
  addPropertyPhoto,
  addRoom,
  canViewProperty,
  publishValidationErrors,
  removePropertyPhoto,
  removeRoom,
  setListingStatus,
  toPropertyViews,
  updateProperty,
  updateRoom,
  useLandlordData,
  type LandlordRoom,
  type ListingStatus,
  type PublishField,
} from '@/services/landlordData';
import { DEFAULT_MAP_POINT, type GeoPoint } from '@/services/geocode';
import { landlordPropertyForm, landlordRoomList, routes } from '@/routes';
import { formatPeso } from '@/utils/currency';
import { toErrorMessage } from '@/utils/errors';
import { ListingStatusBadge } from '@/components/landlord/ListingStatusBadge';
import { AmenityPicker } from '@/components/landlord/property/AmenityPicker';
import { PropertyMapPicker } from '@/components/landlord/property/PropertyMapPicker';
import { PropertyPhotoGrid } from '@/components/landlord/property/PropertyPhotoGrid';
import { RoomManager } from '@/components/landlord/property/RoomManager';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { propertyDetailsStyles as st } from './PropertyDetailsScreen.styles';

const TABS = ['Overview', 'Rooms', 'Photos', 'Location', 'Rules', 'Settings'] as const;
type Tab = (typeof TABS)[number];

const CHECKLIST: { key: PublishField; label: string }[] = [
  { key: 'name', label: 'Property name' },
  { key: 'description', label: 'Description' },
  { key: 'address', label: 'Full address' },
  { key: 'region', label: 'Region' },
  { key: 'city', label: 'City or municipality' },
  { key: 'barangay', label: 'Barangay' },
  { key: 'mapLocationSet', label: 'Map location pinned' },
  { key: 'photos', label: 'At least one photo' },
  { key: 'contactName', label: 'Contact name' },
  { key: 'contactPhone', label: 'Contact number' },
  { key: 'contactEmail', label: 'Contact email' },
];

const STATUS_COPY: Record<ListingStatus, string> = {
  Published: 'This listing is visible to renters searching on BoardPoint.',
  Draft: 'Only you can see this listing. Publish it once the essentials are complete.',
  Inactive: 'This listing is hidden from renters. Tenants and billing stay active.',
  Archived: 'This listing is archived. Tenant records and financial history are preserved.',
};

export default function PropertyDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const data = useLandlordData();
  const property = useMemo(() => {
    if (!propertyId) return undefined;
    return toPropertyViews(data).find((item) => item.id === propertyId);
  }, [data, propertyId]);
  const isAuthorized = property ? canViewProperty(property, landlordId) : true;

  const [tab, setTab] = useState<Tab>('Overview');
  const [mapPoint, setMapPoint] = useState<GeoPoint>(() =>
    property
      ? { latitude: property.latitude, longitude: property.longitude }
      : DEFAULT_MAP_POINT
  );
  const [rulesDraft, setRulesDraft] = useState(property?.houseRules ?? '');
  const [editingRules, setEditingRules] = useState(false);

  const handleRemoveRoom = (room: LandlordRoom) => {
    if (!property) return;
    Alert.alert(
      'Remove room?',
      `${room.label} will be removed from this property. Rooms with tenants or billing history cannot be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void removeRoom(property.id, room.id, landlordId)
              .then(() => Alert.alert('Room removed', `${room.label} was removed.`))
              .catch((error: unknown) =>
                Alert.alert('Cannot remove room', toErrorMessage(error))
              );
          },
        },
      ]
    );
  };

  const toggleAmenity = async (amenity: string) => {
    if (!property) return;
    const amenities = property.amenities.includes(amenity)
      ? property.amenities.filter((item) => item !== amenity)
      : [...property.amenities, amenity];
    await updateProperty(property.id, { amenities }, landlordId);
  };

  const pickPhotos = async () => {
    if (!property) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add property photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.7,
    });
    if (result.canceled) return;
    for (const asset of result.assets) {
      if (asset.uri) await addPropertyPhoto(property.id, asset.uri, landlordId);
    }
  };

  const removePhoto = async (uri: string) => {
    if (!property) return;
    await removePropertyPhoto(property.id, uri, landlordId);
  };

  const saveLocation = async () => {
    if (!property) return;
    await updateProperty(
      property.id,
      {
        latitude: mapPoint.latitude,
        longitude: mapPoint.longitude,
        mapLocationSet: true,
      },
      landlordId
    );
    Alert.alert('Location saved', 'The map pin has been updated for this property.');
  };

  const saveRules = async () => {
    if (!property) return;
    await updateProperty(property.id, { houseRules: rulesDraft }, landlordId);
    setEditingRules(false);
    Alert.alert('House rules saved');
  };

  const handlePublish = async () => {
    if (!property) return;
    const errors = publishValidationErrors(property);
    const missing = CHECKLIST.filter((item) => errors[item.key]).map((item) => item.label);
    if (missing.length > 0) {
      Alert.alert(
        'Not ready to publish',
        `Complete these first:\n${missing.map((label) => `• ${label}`).join('\n')}`
      );
      return;
    }
    await setListingStatus(property.id, 'Published', landlordId);
    Alert.alert('Listing published', `${property.name} is now visible to renters.`);
  };

  const handleDeactivate = () => {
    if (!property) return;
    Alert.alert(
      'Deactivate listing?',
      `${property.name} will be hidden from renters. Tenants, rooms, and billing records stay exactly as they are.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          onPress: () => {
            void setListingStatus(property.id, 'Inactive', landlordId).then(() =>
              Alert.alert('Listing deactivated', 'You can republish it anytime.')
            );
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    if (!property) return;
    Alert.alert(
      'Archive property?',
      `Archiving hides ${property.name} from active listings. Tenant records and financial history are kept — nothing is deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            void setListingStatus(property.id, 'Archived', landlordId).then(() =>
              Alert.alert(
                'Property archived',
                'You can restore it to a draft from Listing Settings.'
              )
            );
          },
        },
      ]
    );
  };

  const handleRestoreDraft = () => {
    if (!property) return;
    Alert.alert('Restore to draft?', `${property.name} will move back to Draft status.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: () => {
          void setListingStatus(property.id, 'Draft', landlordId);
        },
      },
    ]);
  };

  if (!property || !isAuthorized) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={st.centered}>
          <Ionicons
            name={property ? 'lock-closed-outline' : 'business-outline'}
            size={28}
            color={LANDLORD_THEME.primaryDark}
          />
          <Text style={st.centeredTitle}>
            {property ? 'Not authorized' : 'Property not found'}
          </Text>
          <Text style={st.centeredBody}>
            {property
              ? 'This property belongs to another landlord.'
              : 'This listing is no longer available.'}
          </Text>
          <Pressable
            onPress={() => router.replace(routes.landlordProperties)}
            style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Back to my properties"
          >
            <Text style={form.primaryButtonText}>Back to My Properties</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const cover = property.photos[0] ?? property.imageUri;
  const validation = publishValidationErrors(property);
  const isComplete = Object.keys(validation).length === 0;
  const rateLabel =
    property.minRent === property.maxRent
      ? `${formatPeso(property.minRent)}/mo`
      : `${formatPeso(property.minRent)}–${formatPeso(property.maxRent)}/mo`;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={st.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [st.backButton, pressed && st.backButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color={LANDLORD_THEME.textPrimary} />
            </Pressable>
            <View style={st.headerCopy}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                {property.name}
              </Text>
              <Text style={styles.brandSubtitle}>PROPERTY DETAILS</Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordPropertyForm(property.id))}
              style={({ pressed }) => [st.editButton, pressed && st.editButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit property information"
            >
              <Ionicons name="create-outline" size={16} color={LANDLORD_THEME.primaryDark} />
              <Text style={st.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={st.hero}>
            {cover ? (
              <Image source={{ uri: cover }} style={st.heroImage} contentFit="cover" transition={180} />
            ) : (
              <View style={st.heroPlaceholder}>
                <Ionicons name="business-outline" size={34} color={LANDLORD_THEME.primaryDark} />
              </View>
            )}
            <View style={st.heroBody}>
              <View style={st.heroStatusRow}>
                <ListingStatusBadge status={property.listingStatus} />
                <Text style={st.heroRate}>{rateLabel}</Text>
              </View>
              <View style={st.addressRow}>
                <Ionicons name="location-outline" size={14} color={LANDLORD_THEME.textMuted} />
                <Text style={st.addressText}>{property.address}</Text>
              </View>
              <View style={st.statsRow}>
                <View style={st.statBox}>
                  <Text style={st.statValue}>{property.totalRooms}</Text>
                  <Text style={st.statLabel}>Rooms</Text>
                </View>
                <View style={st.statBox}>
                  <Text style={st.statValue}>{property.occupiedRooms}</Text>
                  <Text style={st.statLabel}>Occupied</Text>
                </View>
                <View style={st.statBox}>
                  <Text style={[st.statValue, st.statValueAccent]}>
                    {property.availableRooms}
                  </Text>
                  <Text style={st.statLabel}>Available</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={st.tabsRow}
          >
            {TABS.map((item) => {
              const isActive = tab === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setTab(item)}
                  style={[st.tabChip, isActive && st.tabChipActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={item}
                >
                  <Text style={[st.tabChipText, isActive && st.tabChipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Overview */}
          {tab === 'Overview' ? (
            <View>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>About this property</Text>
                <Text style={st.bodyText}>
                  {property.description || 'No description added yet.'}
                </Text>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Location summary</Text>
                <Text style={st.bodyText}>
                  {[property.barangay, property.city, property.region]
                    .filter(Boolean)
                    .join(', ') || 'Address incomplete'}
                </Text>
                <Text style={form.sectionHint}>
                  {property.mapLocationSet
                    ? `Pinned at ${property.latitude.toFixed(5)}, ${property.longitude.toFixed(5)}`
                    : 'Map location has not been pinned yet.'}
                </Text>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Amenities</Text>
                {property.amenities.length > 0 ? (
                  <View style={st.tagWrap}>
                    {property.amenities.map((amenity) => (
                      <View key={amenity} style={st.tag}>
                        <Text style={st.tagText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={st.bodyText}>No amenities selected yet.</Text>
                )}
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Contact</Text>
                <View style={st.contactRow}>
                  <Ionicons name="person-outline" size={15} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.contactText}>
                    {property.contactName || 'No contact name'}
                  </Text>
                </View>
                <View style={st.contactRow}>
                  <Ionicons name="call-outline" size={15} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.contactText}>
                    {property.contactPhone || 'No contact number'}
                  </Text>
                </View>
                <View style={st.contactRow}>
                  <Ionicons name="mail-outline" size={15} color={LANDLORD_THEME.primaryDark} />
                  <Text style={st.contactText}>
                    {property.contactEmail || 'No contact email'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Rooms */}
          {tab === 'Rooms' ? (
            <View>
              <Pressable
                onPress={() => router.push(landlordRoomList(property.id))}
                style={({ pressed }) => [st.manageRoomsLink, pressed && { opacity: 0.75 }]}
                accessibilityRole="button"
                accessibilityLabel="Open room management for this property"
              >
                <Ionicons name="bed-outline" size={16} color={LANDLORD_THEME.primaryDark} />
                <Text style={st.manageRoomsLinkText}>Open Room Management</Text>
                <Ionicons name="chevron-forward" size={16} color={LANDLORD_THEME.primaryDark} />
              </Pressable>
              <RoomManager
                rooms={property.rooms}
                tenants={data.tenants}
                onAdd={(input) => addRoom(property.id, input, landlordId)}
                onUpdate={(roomId, patch) => updateRoom(property.id, roomId, patch, landlordId)}
                onRemove={handleRemoveRoom}
              />
            </View>
          ) : null}

          {/* Photos & Amenities */}
          {tab === 'Photos' ? (
            <View>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Photos</Text>
                <PropertyPhotoGrid
                  photos={property.photos}
                  onAdd={() => void pickPhotos()}
                  onRemove={(uri) => void removePhoto(uri)}
                />
                <Text style={form.sectionHint}>
                  The first photo is the cover image renters see first.
                </Text>
              </View>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Amenities</Text>
                <AmenityPicker
                  selected={property.amenities}
                  onToggle={(amenity) => void toggleAmenity(amenity)}
                />
              </View>
            </View>
          ) : null}

          {/* Location */}
          {tab === 'Location' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Map location</Text>
              <PropertyMapPicker point={mapPoint} onChange={setMapPoint} />
              <View style={st.locationActions}>
                <Pressable
                  onPress={() => void saveLocation()}
                  style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Save map location"
                >
                  <Ionicons name="location" size={16} color={LANDLORD_THEME.onPrimary} />
                  <Text style={form.primaryButtonText}>Save Location</Text>
                </Pressable>
              </View>
              <Text style={form.sectionHint}>
                Saved coordinates: {property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}
                {property.mapLocationSet ? '' : ' (not pinned yet)'}
              </Text>
            </View>
          ) : null}

          {/* House Rules */}
          {tab === 'Rules' ? (
            <View style={form.sectionCard}>
              <View style={st.rulesHeader}>
                <Text style={form.sectionTitle}>House rules</Text>
                {!editingRules ? (
                  <Pressable
                    onPress={() => {
                      setRulesDraft(property.houseRules);
                      setEditingRules(true);
                    }}
                    style={({ pressed }) => [st.inlineAction, pressed && st.inlineActionPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Edit house rules"
                  >
                    <Ionicons name="create-outline" size={14} color={LANDLORD_THEME.primaryDark} />
                    <Text style={st.inlineActionText}>Edit</Text>
                  </Pressable>
                ) : null}
              </View>

              {editingRules ? (
                <View style={st.rulesEditor}>
                  <TextInput
                    style={st.rulesInput}
                    value={rulesDraft}
                    onChangeText={setRulesDraft}
                    placeholder="Write the rules tenants must follow…"
                    placeholderTextColor={LANDLORD_THEME.textMuted}
                    multiline
                    accessibilityLabel="House rules"
                  />
                  <View style={st.rulesButtons}>
                    <Pressable
                      onPress={() => setEditingRules(false)}
                      style={({ pressed }) => [form.secondaryButton, pressed && form.secondaryButtonPressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel editing rules"
                    >
                      <Text style={form.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void saveRules()}
                      style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
                      accessibilityRole="button"
                      accessibilityLabel="Save house rules"
                    >
                      <Text style={form.primaryButtonText}>Save Rules</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text style={st.bodyText}>
                  {property.houseRules || 'No house rules added yet.'}
                </Text>
              )}
            </View>
          ) : null}

          {/* Listing Settings */}
          {tab === 'Settings' ? (
            <View>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Listing status</Text>
                <View style={st.statusRow}>
                  <ListingStatusBadge status={property.listingStatus} />
                  <Text style={st.statusText}>{STATUS_COPY[property.listingStatus]}</Text>
                </View>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Publishing checklist</Text>
                {CHECKLIST.map((item) => {
                  const done = !validation[item.key];
                  return (
                    <View key={item.key} style={st.checkRow}>
                      <Ionicons
                        name={done ? 'checkmark-circle' : 'ellipse-outline'}
                        size={17}
                        color={done ? '#647C59' : LANDLORD_THEME.textMuted}
                      />
                      <Text style={[st.checkText, !done && st.checkTextMissing]}>
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
                <Text style={form.sectionHint}>
                  {isComplete
                    ? 'All essential fields are complete.'
                    : 'Essential fields must be complete before publishing.'}
                </Text>
              </View>

              <View style={st.settingsActions}>
                {property.listingStatus !== 'Published' && property.listingStatus !== 'Archived' ? (
                  <Pressable
                    onPress={() => void handlePublish()}
                    style={({ pressed }) => [
                      form.primaryButton,
                      !isComplete && form.primaryButtonDisabled,
                      pressed && form.primaryButtonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Publish listing"
                    accessibilityState={{ disabled: !isComplete }}
                  >
                    <Ionicons name="megaphone-outline" size={17} color={LANDLORD_THEME.onPrimary} />
                    <Text style={form.primaryButtonText}>Publish Listing</Text>
                  </Pressable>
                ) : null}

                {property.listingStatus === 'Published' ? (
                  <Pressable
                    onPress={handleDeactivate}
                    style={({ pressed }) => [form.secondaryButton, pressed && form.secondaryButtonPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Deactivate listing"
                  >
                    <Ionicons name="pause-circle-outline" size={17} color={LANDLORD_THEME.primaryDark} />
                    <Text style={form.secondaryButtonText}>Deactivate Listing</Text>
                  </Pressable>
                ) : null}

                {property.listingStatus !== 'Archived' ? (
                  <Pressable
                    onPress={handleArchive}
                    style={({ pressed }) => [form.dangerButton, pressed && form.dangerButtonPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Archive property"
                  >
                    <Ionicons name="archive-outline" size={17} color="#B0433A" />
                    <Text style={form.dangerButtonText}>Archive Property</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleRestoreDraft}
                    style={({ pressed }) => [form.secondaryButton, pressed && form.secondaryButtonPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Restore to draft"
                  >
                    <Ionicons name="refresh-outline" size={17} color={LANDLORD_THEME.primaryDark} />
                    <Text style={form.secondaryButtonText}>Restore to Draft</Text>
                  </Pressable>
                )}
              </View>

              <Text style={st.safetyNote}>
                BoardPoint never hard-deletes a property. Archiving and deactivation keep every
                tenant record and payment in your financial history.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
