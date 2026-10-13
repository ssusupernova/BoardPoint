import { useState } from 'react';
import {
  ActivityIndicator,
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
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import {
  ROOM_AVAILABILITIES,
  ROOM_FURNISHINGS,
  ROOM_TYPES,
  addRoom,
  activeOccupantsOf,
  canViewProperty,
  roomAvailability,
  updateRoom,
  useLandlordData,
  useLandlordDataReady,
  type RoomAvailability,
  type RoomType,
} from '@/services/landlordData';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { AmenityPicker } from '@/components/landlord/property/AmenityPicker';
import { PropertyPhotoGrid } from '@/components/landlord/property/PropertyPhotoGrid';
import { SelectField } from '@/components/renter/SelectField/SelectField';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { toErrorMessage } from '@/utils/errors';
import { roomFormStyles as st } from './RoomFormScreen.styles';

type FormErrors = {
  label?: string;
  rent?: string;
  maxCapacity?: string;
  availability?: string;
  photos?: string;
};

export default function RoomFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ roomId?: string; propertyId?: string }>();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const presetPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;

  const ready = useLandlordDataReady();
  const data = useLandlordData();

  const properties = data.properties.filter((property) =>
    canViewProperty(property, landlordId)
  );
  const existing = (() => {
    if (!roomId) return null;
    for (const property of data.properties) {
      const room = property.rooms.find((item) => item.id === roomId);
      if (room) return { room, property };
    }
    return null;
  })();

  const [propertyId, setPropertyId] = useState(
    () => existing?.property.id ?? presetPropertyId ?? properties[0]?.id ?? ''
  );
  const [label, setLabel] = useState(() => existing?.room.label ?? '');
  const [roomType, setRoomType] = useState<RoomType>(
    () => existing?.room.roomType ?? 'Private Room'
  );
  const [rent, setRent] = useState(() =>
    existing ? String(existing.room.rent) : ''
  );
  const [maxCapacity, setMaxCapacity] = useState(() =>
    existing ? String(existing.room.maxCapacity ?? 1) : '1'
  );
  const [description, setDescription] = useState(
    () => existing?.room.description ?? ''
  );
  const [furnishings, setFurnishings] = useState<string[]>(
    () => existing?.room.furnishings ?? []
  );
  const [photos, setPhotos] = useState<string[]>(() => existing?.room.photos ?? []);
  const [availability, setAvailability] = useState<RoomAvailability>(
    () => (existing ? roomAvailability(existing.room) : 'Available')
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const occupants = existing ? activeOccupantsOf(data, existing.room.id).length : 0;
  const availabilityLocked = occupants > 0 && occupants >= Number(maxCapacity || 1);

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add pictures of the room.');
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
    setPhotos((prev) => [...prev, ...uris.filter((uri) => !prev.includes(uri))]);
    setErrors((prev) => (prev.photos ? { ...prev, photos: undefined } : prev));
  };

  const toggleFurnishing = (item: string) => {
    setFurnishings((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!label.trim()) next.label = 'Room name is required.';
    const rentValue = Number(rent);
    if (!rent.trim() || Number.isNaN(rentValue) || rentValue <= 0) {
      next.rent = 'Enter a monthly rent greater than ₱0.';
    }
    const capacityValue = Number(maxCapacity);
    if (
      !maxCapacity.trim() ||
      Number.isNaN(capacityValue) ||
      !Number.isInteger(capacityValue) ||
      capacityValue < 1
    ) {
      next.maxCapacity = 'Capacity must be a whole number of at least 1.';
    } else if (capacityValue < occupants) {
      next.maxCapacity = `Cannot be lower than the ${occupants} active occupant(s).`;
    }
    if (availability === 'Available' && occupants > 0 && capacityValue >= occupants) {
      next.availability =
        'Fully occupied rooms with active tenants cannot be marked Available.';
    }
    return next;
  };

  const onSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const targetPropertyId = existing?.property.id ?? propertyId;
    if (!targetPropertyId) {
      setErrors({ availability: 'Choose a property for this room.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: label.trim(),
        rent: Number(rent),
        availability,
        roomType,
        maxCapacity: Number(maxCapacity),
        description: description.trim(),
        furnishings,
        photos,
      };
      if (existing) {
        await updateRoom(targetPropertyId, existing.room.id, payload, landlordId);
      } else {
        await addRoom(targetPropertyId, payload, landlordId);
      }
      router.back();
    } catch (error) {
      Alert.alert('Could not save room', toErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                <Text style={st.headerTitle}>{existing ? 'Edit Room' : 'Add Room'}</Text>
                <Text style={st.headerSubtitle}>
                  {existing ? existing.property.name : 'NEW ROOM DETAILS'}
                </Text>
              </View>
            </View>

            {!ready ? (
              <View style={st.loadingBox}>
                <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
                <Text style={st.loadingText}>Loading…</Text>
              </View>
            ) : !existing && properties.length === 0 ? (
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>No properties yet</Text>
                <Text style={form.sectionHint}>
                  Add a property first — rooms always belong to a property.
                </Text>
              </View>
            ) : (
              <>
                {/* Property */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Property</Text>
                  <SelectField
                    label="Belongs to property"
                    value={existing?.property.id ?? propertyId}
                    options={properties.map((property) => ({
                      label: property.name,
                      value: property.id,
                    }))}
                    placeholder="Choose a property"
                    onSelect={setPropertyId}
                  />
                  {existing ? (
                    <Text style={form.sectionHint}>
                      An existing room stays with its property so tenant and billing
                      records remain linked.
                    </Text>
                  ) : null}
                </View>

                {/* Basics */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Room details</Text>

                  <View style={form.formGroup}>
                    <Text style={form.fieldLabel}>Room name</Text>
                    <View style={[form.field, errors.label ? form.fieldError : null]}>
                      <Ionicons
                        name="pricetag-outline"
                        size={17}
                        color={LANDLORD_THEME.textMuted}
                        style={form.fieldIcon}
                      />
                      <TextInput
                        style={form.input}
                        value={label}
                        onChangeText={(value) => {
                          setLabel(value);
                          if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
                        }}
                        placeholder="e.g. Room 1, Master Bed"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        autoCapitalize="words"
                        autoCorrect={false}
                        accessibilityLabel="Room name"
                      />
                    </View>
                    <FieldError error={errors.label} />
                  </View>

                  <View style={form.formGroup}>
                    <Text style={form.fieldLabel}>Room type</Text>
                    <View style={st.chipsWrap}>
                      {ROOM_TYPES.map((type) => {
                        const isActive = roomType === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setRoomType(type as RoomType)}
                            style={[st.chip, !isActive && st.chipInactive]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            accessibilityLabel={`Room type: ${type}`}
                          >
                            <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                              {type}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View style={st.row}>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Monthly rent (₱)</Text>
                      <View style={[form.field, errors.rent ? form.fieldError : null]}>
                        <TextInput
                          style={form.input}
                          value={rent}
                          onChangeText={(value) => {
                            setRent(value.replace(/[^0-9.]/g, ''));
                            if (errors.rent) setErrors((prev) => ({ ...prev, rent: undefined }));
                          }}
                          placeholder="0"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="decimal-pad"
                          accessibilityLabel="Monthly rent in pesos"
                        />
                      </View>
                      <FieldError error={errors.rent} />
                    </View>

                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Max capacity</Text>
                      <View style={[form.field, errors.maxCapacity ? form.fieldError : null]}>
                        <Ionicons
                          name="people-outline"
                          size={17}
                          color={LANDLORD_THEME.textMuted}
                          style={form.fieldIcon}
                        />
                        <TextInput
                          style={form.input}
                          value={maxCapacity}
                          onChangeText={(value) => {
                            setMaxCapacity(value.replace(/[^0-9]/g, ''));
                            if (errors.maxCapacity)
                              setErrors((prev) => ({ ...prev, maxCapacity: undefined }));
                          }}
                          placeholder="1"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="number-pad"
                          accessibilityLabel="Maximum occupants"
                        />
                      </View>
                      <FieldError error={errors.maxCapacity} />
                    </View>
                  </View>
                  {existing && occupants > 0 ? (
                    <Text style={form.sectionHint}>
                      {occupants} active occupant(s) in this room. Capacity can not drop
                      below that, and a fully occupied room can not be marked Available.
                    </Text>
                  ) : null}
                </View>

                {/* Availability */}
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
                            setAvailability(option as RoomAvailability);
                            setErrors((prev) => ({ ...prev, availability: undefined }));
                          }}
                          disabled={disabled}
                          style={[
                            st.chip,
                            !isActive && st.chipInactive,
                            disabled && st.chipDisabled,
                          ]}
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
                      This room is fully occupied by active tenants. Resolve the tenancy
                      before marking it Available.
                    </Text>
                  ) : null}
                  <FieldError error={errors.availability} />
                </View>

                {/* Description */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Description</Text>
                  <View style={[form.field, form.fieldMultiline]}>
                    <TextInput
                      style={[form.input, form.inputMultiline]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Size, view, notes for prospective tenants…"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      multiline
                      textAlignVertical="top"
                      accessibilityLabel="Room description"
                    />
                  </View>
                </View>

                {/* Furnishings */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Furnishings</Text>
                  <AmenityPicker
                    selected={furnishings}
                    onToggle={toggleFurnishing}
                    options={ROOM_FURNISHINGS}
                  />
                </View>

                {/* Photos */}
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Photos</Text>
                  <PropertyPhotoGrid
                    photos={photos}
                    onAdd={() => void pickPhotos()}
                    onRemove={(uri) => setPhotos((prev) => prev.filter((item) => item !== uri))}
                    error={errors.photos}
                  />
                </View>

                {/* Save */}
                <Pressable
                  onPress={() => void onSave()}
                  disabled={saving}
                  style={({ pressed }) => [
                    form.primaryButton,
                    pressed && form.primaryButtonPressed,
                    saving && form.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={existing ? 'Save room changes' : 'Add room'}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                  ) : (
                    <>
                      <Ionicons
                        name={existing ? 'save-outline' : 'add'}
                        size={18}
                        color={LANDLORD_THEME.onPrimary}
                      />
                      <Text style={form.primaryButtonText}>
                        {existing ? 'Save Changes' : 'Add Room'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
