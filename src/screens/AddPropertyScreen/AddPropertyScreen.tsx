import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { useAuthSession } from '@/services/auth';
import {
  addRoom,
  canViewProperty,
  createProperty,
  publishValidationErrors,
  removeRoom,
  setListingStatus,
  updateProperty,
  updateRoom,
  useLandlordData,
  type LandlordRoom,
  type PublishField,
  type PropertyFormInput,
} from '@/services/landlordData';
import { DEFAULT_MAP_POINT, type GeoPoint } from '@/services/geocode';
import { landlordPropertyDetails, routes } from '@/routes';
import { toErrorMessage } from '@/utils/errors';
import { ListingStatusBadge } from '@/components/landlord/ListingStatusBadge';
import { AmenityPicker } from '@/components/landlord/property/AmenityPicker';
import { PropertyMapPicker } from '@/components/landlord/property/PropertyMapPicker';
import { PropertyPhotoGrid } from '@/components/landlord/property/PropertyPhotoGrid';
import { RoomManager } from '@/components/landlord/property/RoomManager';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { addPropertyStyles as st } from './AddPropertyScreen.styles';

type FormState = PropertyFormInput;

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
}: FieldProps) {
  return (
    <View style={form.formGroup}>
      <Text style={form.fieldLabel}>{label}</Text>
      <View
        style={[
          form.field,
          multiline && form.fieldMultiline,
          error ? form.fieldError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={LANDLORD_THEME.textMuted}
            style={form.fieldIcon}
          />
        ) : null}
        <TextInput
          style={[form.input, multiline && form.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={LANDLORD_THEME.textMuted}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          accessibilityLabel={label}
        />
      </View>
      {error ? <FieldErrorText text={error} /> : null}
    </View>
  );
}

function FieldErrorText({ text }: { text: string }) {
  return (
    <Text style={st.fieldErrorText} accessibilityRole="alert">
      {text}
    </Text>
  );
}

function blankForm(): FormState {
  return {
    name: '',
    description: '',
    address: '',
    region: '',
    city: '',
    barangay: '',
    latitude: DEFAULT_MAP_POINT.latitude,
    longitude: DEFAULT_MAP_POINT.longitude,
    mapLocationSet: false,
    photos: [],
    amenities: [],
    houseRules: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  };
}

export default function AddPropertyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const data = useLandlordData();
  const property = useMemo(
    () => (propertyId ? data.properties.find((item) => item.id === propertyId) : undefined),
    [data, propertyId]
  );
  const isAuthorized = property ? canViewProperty(property, landlordId) : true;
  const isEditing = Boolean(property);

  const [formState, setFormState] = useState<FormState>(() =>
    property
      ? {
          name: property.name,
          description: property.description,
          address: property.address,
          region: property.region,
          city: property.city,
          barangay: property.barangay,
          latitude: property.latitude,
          longitude: property.longitude,
          mapLocationSet: property.mapLocationSet,
          photos: [...property.photos],
          amenities: [...property.amenities],
          houseRules: property.houseRules,
          contactName: property.contactName,
          contactPhone: property.contactPhone,
          contactEmail: property.contactEmail,
        }
      : blankForm()
  );
  const [errors, setErrors] = useState<Partial<Record<PublishField, string>>>({});
  // New listings stage rooms locally; they are saved with the property.
  // Edit mode manages rooms directly against the store (tenant guards apply).
  const [localRooms, setLocalRooms] = useState<LandlordRoom[]>([]);

  const handleAddRoom = async (input: { label: string; rent: number; status?: 'Occupied' | 'Available' }) => {
    if (property) {
      await addRoom(property.id, { label: input.label, rent: input.rent, status: input.status }, landlordId);
      return;
    }
    setLocalRooms((prev) => [
      ...prev,
      {
        id: Crypto.randomUUID(),
        label: input.label.trim(),
        rent: input.rent,
        status: input.status ?? 'Available',
        availability: input.status === 'Occupied' ? 'Occupied' : 'Available',
        roomType: 'Private Room',
        maxCapacity: 1,
        description: '',
        furnishings: [],
        photos: [],
      },
    ]);
  };

  const handleUpdateRoom = async (
    roomId: string,
    patchInput: { label: string; rent: number; status?: 'Occupied' | 'Available' }
  ) => {
    if (property) {
      await updateRoom(property.id, roomId, patchInput, landlordId);
      return;
    }
    setLocalRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              label: patchInput.label.trim(),
              rent: patchInput.rent,
              status: patchInput.status ?? room.status,
            }
          : room
      )
    );
  };

  const handleRemoveRoom = async (room: LandlordRoom) => {
    if (property) {
      Alert.alert(
        'Remove room?',
        `${room.label} will be removed from this property. Rooms with tenants or billing history cannot be removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              void removeRoom(property.id, room.id, landlordId).catch((error: unknown) =>
                Alert.alert('Cannot remove room', toErrorMessage(error))
              );
            },
          },
        ]
      );
      return;
    }
    setLocalRooms((prev) => prev.filter((item) => item.id !== room.id));
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const patch = (next: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...next }));
    setErrors((prev) => {
      const cleared = { ...prev };
      for (const key of Object.keys(next) as (keyof FormState)[]) {
        cleared[key] = undefined;
      }
      return cleared;
    });
  };

  const onMapChange = (point: GeoPoint) => {
    patch({ latitude: point.latitude, longitude: point.longitude, mapLocationSet: true });
  };

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo access to add pictures of your property.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.7,
    });
    if (result.canceled) return;
    const uris = result.assets
      .map((asset) => asset.uri)
      .filter((uri): uri is string => Boolean(uri));
    if (uris.length === 0) return;
    setFormState((prev) => ({
      ...prev,
      photos: [...prev.photos, ...uris.filter((uri) => !prev.photos.includes(uri))],
    }));
    setErrors((prev) => (prev.photos ? { ...prev, photos: undefined } : prev));
  };

  const removePhoto = (uri: string) => {
    setFormState((prev) => ({
      ...prev,
      photos: prev.photos.filter((item) => item !== uri),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormState((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSaveDraft = async () => {
    if (!formState.name.trim()) {
      setErrors({ name: 'Property name is required.' });
      Alert.alert('Name required', 'Give this property a name before saving a draft.');
      return;
    }
    if (property) {
      await updateProperty(property.id, formState, landlordId);
      Alert.alert('Draft saved', 'Your changes have been saved.');
      router.back();
      return;
    }
    const id = await createProperty(formState, landlordId, 'Draft', localRooms);
    Alert.alert('Draft saved', 'You can finish and publish this listing anytime.');
    router.replace(landlordPropertyDetails(id));
  };

  const handlePublish = async () => {
    const validation = publishValidationErrors(formState);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      Alert.alert(
        'Almost there',
        'Complete the highlighted fields before publishing this listing.'
      );
      return;
    }
    if (property) {
      await updateProperty(property.id, formState, landlordId);
      await setListingStatus(property.id, 'Published', landlordId);
      Alert.alert('Listing published', `${formState.name} is now visible to renters.`);
      router.replace(landlordPropertyDetails(property.id));
      return;
    }
    const id = await createProperty(formState, landlordId, 'Published', localRooms);
    Alert.alert('Listing published', `${formState.name} is now visible to renters.`);
    router.replace(landlordPropertyDetails(id));
  };

  const handleSaveChanges = async () => {
    if (!property) return;
    if (!formState.name.trim()) {
      setErrors({ name: 'Property name is required.' });
      Alert.alert('Name required', 'Property name cannot be empty.');
      return;
    }
    await updateProperty(property.id, formState, landlordId);
    Alert.alert('Changes saved', 'Property information has been updated.');
    router.back();
  };

  const showPublishButton = !isEditing || property?.listingStatus === 'Draft';
  const showSaveDraft = !isEditing || property?.listingStatus === 'Draft';
  const showSaveChanges = isEditing && !showPublishButton;

  if (property && !isAuthorized) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={st.centered}>
          <Ionicons name="lock-closed-outline" size={28} color={LANDLORD_THEME.primaryDark} />
          <Text style={st.centeredTitle}>Not authorized</Text>
          <Text style={st.centeredBody}>
            This property belongs to another landlord, so it cannot be edited here.
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                <Text style={styles.brandTitle}>
                  {isEditing ? 'Edit Property' : 'Add Property'}
                </Text>
                <Text style={styles.brandSubtitle}>
                  {isEditing ? 'UPDATE LISTING INFORMATION' : 'CREATE A NEW LISTING'}
                </Text>
              </View>
            </View>

            {/* Basics */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Property Information</Text>
              <View style={st.sectionFields}>
                <Field
                  label="Property name"
                  value={formState.name}
                  onChangeText={(text) => setField('name', text)}
                  placeholder="e.g. Casa Dela Cruz Boarding House"
                  autoCapitalize="words"
                  icon="business-outline"
                  error={errors.name}
                />
                <Field
                  label="Description"
                  value={formState.description}
                  onChangeText={(text) => setField('description', text)}
                  placeholder="Describe the property, its rooms, and what makes it stand out."
                  multiline
                  error={errors.description}
                />
              </View>
            </View>

            {/* Rooms */}
            <RoomManager
              rooms={property ? property.rooms : localRooms}
              tenants={data.tenants}
              onAdd={handleAddRoom}
              onUpdate={handleUpdateRoom}
              onRemove={handleRemoveRoom}
              hint={
                property
                  ? 'Room changes are saved immediately.'
                  : 'Rooms are saved together with this listing when you save or publish.'
              }
              emptyMessage="No rooms yet. Tap Add Room to list your first room."
            />

            {/* Address */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Address</Text>
              <View style={st.sectionFields}>
                <Field
                  label="Full address"
                  value={formState.address}
                  onChangeText={(text) => setField('address', text)}
                  placeholder="Street, block, or landmark"
                  multiline
                  icon="location-outline"
                  error={errors.address}
                />
                <Field
                  label="Region"
                  value={formState.region}
                  onChangeText={(text) => setField('region', text)}
                  placeholder="e.g. Region IX (Zamboanga Peninsula)"
                  error={errors.region}
                />
                <Field
                  label="City or municipality"
                  value={formState.city}
                  onChangeText={(text) => setField('city', text)}
                  placeholder="e.g. Dapitan City"
                  error={errors.city}
                />
                <Field
                  label="Barangay"
                  value={formState.barangay}
                  onChangeText={(text) => setField('barangay', text)}
                  placeholder="e.g. Sta. Cruz"
                  error={errors.barangay}
                />
              </View>
            </View>

            {/* Map */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Map Location</Text>
              <PropertyMapPicker
                point={{ latitude: formState.latitude, longitude: formState.longitude }}
                onChange={onMapChange}
                error={errors.mapLocationSet}
              />
              <Text style={form.sectionHint}>
                Drag the pin to the exact property location. Latitude and longitude are saved
                from this pin.
              </Text>
            </View>

            {/* Photos */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Property Photos</Text>
              <PropertyPhotoGrid
                photos={formState.photos}
                onAdd={() => void pickPhotos()}
                onRemove={removePhoto}
                error={errors.photos}
              />
              <Text style={form.sectionHint}>
                The first photo is used as the cover image on your listings.
              </Text>
            </View>

            {/* Amenities */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Amenities</Text>
              <AmenityPicker selected={formState.amenities} onToggle={toggleAmenity} />
            </View>

            {/* House rules */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>House Rules</Text>
              <Field
                label="Rules for tenants"
                value={formState.houseRules}
                onChangeText={(text) => setField('houseRules', text)}
                placeholder="Quiet hours, guests, deposits, utilities…"
                multiline
              />
            </View>

            {/* Contact */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Contact Information</Text>
              <View style={st.sectionFields}>
                <Field
                  label="Contact name"
                  value={formState.contactName}
                  onChangeText={(text) => setField('contactName', text)}
                  placeholder="Person renters will speak with"
                  icon="person-outline"
                  error={errors.contactName}
                />
                <Field
                  label="Contact number"
                  value={formState.contactPhone}
                  onChangeText={(text) => setField('contactPhone', text)}
                  placeholder="+63 9XX XXX XXXX"
                  keyboardType="phone-pad"
                  icon="call-outline"
                  error={errors.contactPhone}
                />
                <Field
                  label="Contact email"
                  value={formState.contactEmail}
                  onChangeText={(text) => setField('contactEmail', text)}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  error={errors.contactEmail}
                />
              </View>
            </View>

            {/* Listing status */}
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Listing Status</Text>
              <View style={st.statusRow}>
                <ListingStatusBadge
                  status={
                    property && property.listingStatus !== 'Draft'
                      ? property.listingStatus
                      : 'Draft'
                  }
                />
                <Text style={st.statusText}>
                  {property && property.listingStatus === 'Published'
                    ? 'Saving keeps this listing published. Manage deactivate/archive in Listing Settings.'
                    : 'Save as a draft now, or publish when the essential details are complete.'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={st.actions}>
              {showSaveDraft ? (
                <Pressable
                  onPress={() => void handleSaveDraft()}
                  style={({ pressed }) => [form.secondaryButton, pressed && form.secondaryButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Save draft"
                >
                  <Ionicons name="save-outline" size={17} color={LANDLORD_THEME.primaryDark} />
                  <Text style={form.secondaryButtonText}>Save Draft</Text>
                </Pressable>
              ) : null}

              {showPublishButton ? (
                <Pressable
                  onPress={() => void handlePublish()}
                  style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Publish listing"
                >
                  <Ionicons name="megaphone-outline" size={17} color={LANDLORD_THEME.onPrimary} />
                  <Text style={form.primaryButtonText}>Publish Listing</Text>
                </Pressable>
              ) : null}

              {showSaveChanges ? (
                <Pressable
                  onPress={() => void handleSaveChanges()}
                  style={({ pressed }) => [form.primaryButton, pressed && form.primaryButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Save changes"
                >
                  <Ionicons name="checkmark" size={18} color={LANDLORD_THEME.onPrimary} />
                  <Text style={form.primaryButtonText}>Save Changes</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
