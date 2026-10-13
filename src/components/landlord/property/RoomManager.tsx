import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatPeso } from '@/utils/currency';
import { toErrorMessage } from '@/utils/errors';
import type { LandlordRoom, LandlordTenant, RoomFormInput } from '@/services/landlordData';
import { LANDLORD_THEME } from '@/styles/landlord/styles';
import { propertyFormStyles as form } from './propertyFormStyles';
import { roomManagerStyles as st } from './RoomManager.styles';

type Props = {
  rooms: LandlordRoom[];
  tenants?: LandlordTenant[];
  onAdd: (input: RoomFormInput) => void | Promise<void>;
  onUpdate: (roomId: string, patch: RoomFormInput) => void | Promise<void>;
  /** Callers own the confirmation dialog and error handling for removal. */
  onRemove: (room: LandlordRoom) => void | Promise<void>;
  hint?: string;
  emptyMessage?: string;
};

/**
 * Add / edit / remove rooms from a "+" button and inline form.
 * Used by the property details Rooms tab and the Add/Edit Property form.
 */
export function RoomManager({
  rooms,
  tenants = [],
  onAdd,
  onUpdate,
  onRemove,
  hint,
  emptyMessage = 'No rooms yet. Tap Add Room to create the first one.',
}: Props) {
  const [formState, setFormState] = useState<{
    mode: 'idle' | 'add' | 'edit';
    roomId?: string;
    label: string;
    rent: string;
    status: 'Occupied' | 'Available';
    error?: string;
  }>({ mode: 'idle', label: '', rent: '', status: 'Available' });

  const openAdd = () => setFormState({ mode: 'add', label: '', rent: '', status: 'Available' });

  const openEdit = (room: LandlordRoom) => {
    setFormState({
      mode: 'edit',
      roomId: room.id,
      label: room.label,
      rent: String(room.rent),
      status: room.status,
    });
  };

  const cancel = () => setFormState({ mode: 'idle', label: '', rent: '', status: 'Available' });

  /** Occupancy toggles are locked when the room is tied to a tenant record. */
  const occupancyLocked =
    formState.mode === 'edit' &&
    rooms.find((room) => room.id === formState.roomId)?.tenantId != null;

  const save = async () => {
    if (formState.mode === 'idle') return;
    const label = formState.label.trim();
    const rent = Number(formState.rent.replace(/[^0-9]/g, ''));
    if (!label) {
      setFormState((prev) => ({ ...prev, error: 'Room name is required.' }));
      return;
    }
    if (!Number.isFinite(rent) || rent <= 0) {
      setFormState((prev) => ({ ...prev, error: 'Enter a valid monthly rent.' }));
      return;
    }
    try {
      if (formState.mode === 'add') {
        await onAdd({ label, rent, status: formState.status });
      } else if (formState.roomId) {
        await onUpdate(formState.roomId, {
          label,
          rent,
          status: occupancyLocked ? undefined : formState.status,
        });
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: toErrorMessage(error),
      }));
      return;
    }
    cancel();
  };

  return (
    <View style={form.sectionCard}>
      <View style={st.roomsHeader}>
        <Text style={form.sectionTitle}>Rooms</Text>
        {formState.mode === 'idle' ? (
          <Pressable
            onPress={openAdd}
            style={({ pressed }) => [st.addButton, pressed && st.addButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Add room"
          >
            <Ionicons name="add" size={16} color={LANDLORD_THEME.onPrimary} />
            <Text style={st.addButtonText}>Add Room</Text>
          </Pressable>
        ) : null}
      </View>

      {formState.mode !== 'idle' ? (
        <View style={st.roomForm}>
          <Text style={form.fieldLabel}>
            {formState.mode === 'add' ? 'New room' : 'Edit room'}
          </Text>
          <View style={[form.field, formState.error ? form.fieldError : null]}>
            <Ionicons
              name="bed-outline"
              size={17}
              color={LANDLORD_THEME.textMuted}
              style={form.fieldIcon}
            />
            <TextInput
              style={form.input}
              value={formState.label}
              onChangeText={(text) =>
                setFormState((prev) => ({ ...prev, label: text, error: undefined }))
              }
              placeholder="e.g. Room 1"
              placeholderTextColor={LANDLORD_THEME.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Room name"
            />
          </View>
          <View style={[form.field, formState.error ? form.fieldError : null]}>
            <Text style={st.pesoPrefix}>₱</Text>
            <TextInput
              style={form.input}
              value={formState.rent}
              onChangeText={(text) =>
                setFormState((prev) => ({
                  ...prev,
                  rent: text.replace(/[^0-9]/g, ''),
                  error: undefined,
                }))
              }
              placeholder="Monthly rent"
              placeholderTextColor={LANDLORD_THEME.textMuted}
              keyboardType="number-pad"
              accessibilityLabel="Monthly rent"
            />
          </View>
          <View style={form.formGroup}>
            <Text style={form.fieldLabel}>Occupancy</Text>
            <View style={st.occupancyRow}>
              {(['Available', 'Occupied'] as const).map((value) => {
                const isSelected = formState.status === value;
                return (
                  <Pressable
                    key={value}
                    disabled={occupancyLocked}
                    onPress={() =>
                      setFormState((prev) => ({ ...prev, status: value, error: undefined }))
                    }
                    style={[
                      st.occupancyChip,
                      isSelected && st.occupancyChipSelected,
                      occupancyLocked && st.occupancyChipLocked,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: occupancyLocked }}
                    accessibilityLabel={`Occupancy: ${value}`}
                  >
                    <Text
                      style={[st.occupancyChipText, isSelected && st.occupancyChipTextSelected]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {occupancyLocked ? (
              <Text style={st.occupancyLockedHint}>
                Occupancy follows the linked tenant record and cannot be changed here.
              </Text>
            ) : null}
          </View>
          {formState.error ? (
            <Text style={st.roomFormError} accessibilityRole="alert">
              {formState.error}
            </Text>
          ) : null}
          <View style={st.roomFormButtons}>
            <Pressable
              onPress={cancel}
              style={({ pressed }) => [
                st.formButton,
                st.formButtonSecondary,
                pressed && st.formButtonSecondaryPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={st.formButtonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void save()}
              style={({ pressed }) => [
                st.formButton,
                st.formButtonPrimary,
                pressed && st.formButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={formState.mode === 'add' ? 'Add room' : 'Save room'}
            >
              <Text style={st.formButtonText}>
                {formState.mode === 'add' ? 'Add Room' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {rooms.length === 0 && formState.mode === 'idle' ? (
        <Text style={st.emptyText}>{emptyMessage}</Text>
      ) : (
        rooms.map((room) => {
          const tenant = tenants.find((item) => item.id === room.tenantId);
          const isEditingThis = formState.mode === 'edit' && formState.roomId === room.id;
          return (
            <View key={room.id} style={[st.roomRow, isEditingThis && st.roomRowActive]}>
              <View style={st.roomMainRow}>
                <View style={st.roomInfo}>
                  <Text style={st.roomLabel}>{room.label}</Text>
                  <Text style={st.roomMeta}>
                    {tenant
                      ? `Tenant: ${tenant.fullName}`
                      : room.status === 'Occupied'
                        ? `Occupied · listed ${formatPeso(room.rent)}/mo`
                        : `Ready to rent · ${formatPeso(room.rent)}/mo`}
                  </Text>
                  {tenant ? (
                    <Text style={st.roomMeta}>Listed rate: {formatPeso(room.rent)}/mo</Text>
                  ) : null}
                </View>
                <View style={st.roomRight}>
                  <View
                    style={[
                      st.roomBadge,
                      room.status === 'Available' ? st.roomBadgeAvailable : st.roomBadgeOccupied,
                    ]}
                  >
                    <Text
                      style={[
                        st.roomBadgeText,
                        room.status === 'Available'
                          ? st.roomBadgeTextAvailable
                          : st.roomBadgeTextOccupied,
                      ]}
                    >
                      {room.status}
                    </Text>
                  </View>
                  <View style={st.roomActions}>
                    <Pressable
                      onPress={() => openEdit(room)}
                      style={({ pressed }) => [
                        st.roomIconButton,
                        pressed && st.roomIconButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${room.label}`}
                    >
                      <Ionicons
                        name="create-outline"
                        size={15}
                        color={LANDLORD_THEME.primaryDark}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => void Promise.resolve(onRemove(room))}
                      style={({ pressed }) => [
                        st.roomIconButton,
                        pressed && st.roomIconButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${room.label}`}
                    >
                      <Ionicons name="trash-outline" size={15} color="#B0433A" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}

      {hint ? <Text style={st.hint}>{hint}</Text> : null}
    </View>
  );
}
