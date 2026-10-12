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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthSession } from '@/services/auth';
import {
  approveTenancy,
  canViewProperty,
  createInquiry,
  moveInTenant,
  roomAvailability,
  updateTenancy,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { SelectField } from '@/components/renter/SelectField/SelectField';
import { FieldError } from '@/components/renter/FieldError/FieldError';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { toISODate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import { tenantFormStyles as st } from './TenantFormScreen.styles';

type Mode = 'Inquiry' | 'Active';

type FormErrors = {
  fullName?: string;
  email?: string;
  propertyId?: string;
  roomId?: string;
  monthlyRent?: string;
};

export default function TenantFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ tenantId?: string }>();
  const tenantId = Array.isArray(params.tenantId) ? params.tenantId[0] : params.tenantId;
  const isEdit = Boolean(tenantId);

  const ready = useLandlordDataReady();
  const data = useLandlordData();
  const existing = isEdit ? data.tenants.find((item) => item.id === tenantId) : undefined;
  const properties = data.properties.filter((p) => canViewProperty(p, landlordId));

  const [mode, setMode] = useState<Mode>('Inquiry');
  const [fullName, setFullName] = useState(() => existing?.fullName ?? '');
  const [email, setEmail] = useState(() => existing?.email ?? '');
  const [phone, setPhone] = useState(() => existing?.phone ?? '');
  const [propertyId, setPropertyId] = useState(
    () => existing?.propertyId ?? properties[0]?.id ?? ''
  );
  const [roomId, setRoomId] = useState(() => existing?.roomId ?? '');
  const [monthlyRent, setMonthlyRent] = useState(() =>
    existing?.monthlyRent ? String(existing.monthlyRent) : ''
  );
  const [leaseStart, setLeaseStart] = useState(() => existing?.leaseStart ?? '');
  const [leaseEnd, setLeaseEnd] = useState(() => existing?.leaseEnd ?? '');
  const [deposit, setDeposit] = useState(() =>
    existing?.deposit ? String(existing.deposit) : ''
  );
  const [notes, setNotes] = useState(() => existing?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const selectedProperty = properties.find((item) => item.id === propertyId);
  const roomOptions = (selectedProperty?.rooms ?? [])
    .filter((room) => {
      const claimed = data.tenants.filter(
        (tenant) =>
          tenant.roomId === room.id &&
          tenant.id !== tenantId &&
          (tenant.status === 'Active' || tenant.status === 'Reserved')
      ).length;
      return claimed < (room.maxCapacity ?? 1) && roomAvailability(room) !== 'Maintenance';
    })
    .map((room) => ({ label: `${room.label} · ₱${room.rent}`, value: room.id }));

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (email.trim() && !email.includes('@')) next.email = 'Enter a valid email address.';
    if (!isEdit && !propertyId) next.propertyId = 'Choose a property.';
    if (!isEdit && mode === 'Active' && !roomId) {
      next.roomId = 'Active tenants need an assigned room.';
    }
    if (!isEdit && mode === 'Active') {
      const rent = Number(monthlyRent);
      if (!monthlyRent.trim() || Number.isNaN(rent) || rent <= 0) {
        next.monthlyRent = 'Enter a monthly rent greater than ₱0.';
      }
    }
    return next;
  };

  const onSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      if (isEdit && existing) {
        await updateTenancy(
          existing.id,
          {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
            leaseStart: leaseStart.trim() || undefined,
            leaseEnd: leaseEnd.trim() || undefined,
            deposit: deposit ? Number(deposit) : undefined,
            notes,
          },
          landlordId
        );
        Alert.alert('Tenant updated', 'The tenancy record was saved.');
        router.back();
        return;
      }

      const room = selectedProperty?.rooms.find((item) => item.id === roomId);
      const today = toISODate(new Date());
      const inquiryId = await createInquiry(
        {
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          propertyId,
          roomId: roomId || undefined,
          monthlyRent: monthlyRent ? Number(monthlyRent) : room?.rent,
          notes: notes.trim() || undefined,
        },
        landlordId
      );

      if (mode === 'Active' && roomId) {
        await approveTenancy(
          inquiryId,
          {
            roomId,
            monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
            leaseStart: leaseStart.trim() || today,
            leaseEnd: leaseEnd.trim() || undefined,
            deposit: deposit ? Number(deposit) : undefined,
          },
          landlordId
        );
        await moveInTenant(
          inquiryId,
          {
            moveInAt: today,
            leaseStart: leaseStart.trim() || today,
            leaseEnd: leaseEnd.trim() || undefined,
            deposit: deposit ? Number(deposit) : undefined,
          },
          landlordId
        );
        Alert.alert(
          'Active tenant added',
          'The room is occupied and the first rent bill was generated.'
        );
      } else {
        Alert.alert(
          'Inquiry saved',
          'The renter was added as a prospective inquiry — no room was occupied and no tenancy was created.'
        );
      }
      router.back();
    } catch (error) {
      Alert.alert('Could not save', toErrorMessage(error));
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
                <Text style={st.headerTitle}>
                  {isEdit ? 'Edit Tenant' : 'Add Tenant or Inquiry'}
                </Text>
                <Text style={st.headerSubtitle}>
                  {isEdit ? 'UPDATE TENANCY INFORMATION' : 'PROSPECTIVE RENTERS & MOVE-INS'}
                </Text>
              </View>
            </View>

            {!ready ? (
              <View style={st.loadingBox}>
                <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
                <Text style={st.loadingText}>Loading…</Text>
              </View>
            ) : !isEdit && properties.length === 0 ? (
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>No properties yet</Text>
                <Text style={form.sectionHint}>
                  Add a property first — tenants and inquiries always belong to one.
                </Text>
              </View>
            ) : (
              <>
                {!isEdit ? (
                  <View style={form.sectionCard}>
                    <Text style={form.sectionTitle}>Record type</Text>
                    <View style={st.modeRow}>
                      {(['Inquiry', 'Active'] as Mode[]).map((option) => {
                        const isActive = mode === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setMode(option)}
                            style={[st.modeChip, !isActive && st.modeChipInactive]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            accessibilityLabel={`Record type: ${option}`}
                          >
                            <Text
                              style={[st.modeChipText, !isActive && st.modeChipTextInactive]}
                            >
                              {option === 'Inquiry' ? 'Inquiry / Prospect' : 'Active Tenant'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={form.sectionHint}>
                      {mode === 'Inquiry'
                        ? 'Inquiries never occupy a room or create a tenancy. Approve them later from their profile.'
                        : 'Only choose Active when the person is moving in now — the room is occupied and the first rent bill is generated.'}
                    </Text>
                  </View>
                ) : null}

                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Tenant information</Text>

                  <View style={form.formGroup}>
                    <Text style={form.fieldLabel}>Full name</Text>
                    <View style={[form.field, errors.fullName ? form.fieldError : null]}>
                      <Ionicons
                        name="person-outline"
                        size={17}
                        color={LANDLORD_THEME.textMuted}
                        style={form.fieldIcon}
                      />
                      <TextInput
                        style={form.input}
                        value={fullName}
                        onChangeText={(value) => {
                          setFullName(value);
                          if (errors.fullName)
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        placeholder="Juan Dela Cruz"
                        placeholderTextColor={LANDLORD_THEME.textMuted}
                        autoCapitalize="words"
                        accessibilityLabel="Tenant full name"
                      />
                    </View>
                    <FieldError error={errors.fullName} />
                  </View>

                  <View style={st.row}>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Phone (optional)</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="+63 9XX XXX XXXX"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="phone-pad"
                          accessibilityLabel="Tenant phone number"
                        />
                      </View>
                    </View>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Email (optional)</Text>
                      <View style={[form.field, errors.email ? form.fieldError : null]}>
                        <TextInput
                          style={form.input}
                          value={email}
                          onChangeText={(value) => {
                            setEmail(value);
                            if (errors.email)
                              setErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          placeholder="name@mail.ph"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          accessibilityLabel="Tenant email address"
                        />
                      </View>
                      <FieldError error={errors.email} />
                    </View>
                  </View>
                  <Text style={form.sectionHint}>
                    Only operational contact details are collected — nothing beyond what the
                    tenancy needs.
                  </Text>
                </View>

                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Property & room</Text>
                  <SelectField
                    label="Property"
                    value={propertyId}
                    options={properties.map((property) => ({
                      label: property.name,
                      value: property.id,
                    }))}
                    placeholder="Choose a property"
                    onSelect={(value) => {
                      setPropertyId(value);
                      setRoomId('');
                    }}
                    error={errors.propertyId}
                  />
                  <View style={{ height: 12 }} />
                  <SelectField
                    label={isEdit ? 'Room' : `Room${mode === 'Active' ? ' (required)' : ' (optional)'}`}
                    value={roomId}
                    options={roomOptions}
                    placeholder={
                      roomOptions.length === 0
                        ? 'No rooms with free capacity'
                        : 'Choose a room'
                    }
                    onSelect={setRoomId}
                    error={errors.roomId}
                  />
                  {!isEdit && mode === 'Inquiry' ? (
                    <Text style={form.sectionHint}>
                      An optional room note does not reserve or occupy it.
                    </Text>
                  ) : null}
                </View>

                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Tenancy terms</Text>
                  <View style={st.row}>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Monthly rent (₱)</Text>
                      <View style={[form.field, errors.monthlyRent ? form.fieldError : null]}>
                        <TextInput
                          style={form.input}
                          value={monthlyRent}
                          onChangeText={(value) => {
                            setMonthlyRent(value.replace(/[^0-9.]/g, ''));
                            if (errors.monthlyRent)
                              setErrors((prev) => ({ ...prev, monthlyRent: undefined }));
                          }}
                          placeholder="0"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="number-pad"
                          accessibilityLabel="Monthly rent in pesos"
                        />
                      </View>
                      <FieldError error={errors.monthlyRent} />
                    </View>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Deposit (₱)</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={deposit}
                          onChangeText={(value) => setDeposit(value.replace(/[^0-9.]/g, ''))}
                          placeholder="Optional"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          keyboardType="number-pad"
                          accessibilityLabel="Security deposit in pesos"
                        />
                      </View>
                    </View>
                  </View>
                  <View style={st.row}>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Lease start</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={leaseStart}
                          onChangeText={setLeaseStart}
                          placeholder="yyyy-mm-dd"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel="Lease start date"
                        />
                      </View>
                    </View>
                    <View style={[form.formGroup, st.rowItem]}>
                      <Text style={form.fieldLabel}>Expected end</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={leaseEnd}
                          onChangeText={setLeaseEnd}
                          placeholder="yyyy-mm-dd or blank"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel="Expected lease end date"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Notes</Text>
                  <View style={[form.field, form.fieldMultiline]}>
                    <TextInput
                      style={[form.input, form.inputMultiline]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="References, requests, move-in details…"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      multiline
                      textAlignVertical="top"
                      accessibilityLabel="Tenancy notes"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => void onSave()}
                  disabled={saving}
                  style={({ pressed }) => [
                    form.primaryButton,
                    pressed && form.primaryButtonPressed,
                    saving && form.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={isEdit ? 'Save tenant changes' : 'Save tenant record'}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={LANDLORD_THEME.onPrimary} />
                  ) : (
                    <>
                      <Ionicons
                        name={isEdit ? 'save-outline' : 'person-add-outline'}
                        size={18}
                        color={LANDLORD_THEME.onPrimary}
                      />
                      <Text style={form.primaryButtonText}>
                        {isEdit ? 'Save Changes' : mode === 'Active' ? 'Add Active Tenant' : 'Save Inquiry'}
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
