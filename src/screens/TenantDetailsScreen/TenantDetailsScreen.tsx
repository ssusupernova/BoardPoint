import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuthSession } from '@/services/auth';
import {
  addRentBill,
  addSharedExpenseBill,
  approveTenancy,
  billStatus,
  canViewProperty,
  cancelReservation,
  declineTenancy,
  markBillPaid,
  moveInTenant,
  recordMoveOut,
  roomAvailability,
  sendTenantMessage,
  tenantActivitiesOf,
  toTenantViews,
  useLandlordData,
  useLandlordDataReady,
} from '@/services/landlordData';
import {
  landlordPropertyDetails,
  landlordRoomDetails,
  landlordTenantForm,
} from '@/routes';
import { TenantStatusBadge } from '@/components/landlord/tenant/TenantStatusBadge';
import { propertyFormStyles as form } from '@/components/landlord/property/propertyFormStyles';
import { formatPeso } from '@/utils/currency';
import { formatDisplayDate, formatShortDate, toISODate } from '@/utils/date';
import { toErrorMessage } from '@/utils/errors';
import { LANDLORD_THEME, styles } from '@/styles/landlord/styles';
import { tenantDetailsStyles as st } from './TenantDetailsScreen.styles';

type Tab = 'Profile' | 'Billing' | 'Messages' | 'History';

const TABS: { key: Tab; label: string }[] = [
  { key: 'Profile', label: 'Profile' },
  { key: 'Billing', label: 'Billing' },
  { key: 'Messages', label: 'Messages' },
  { key: 'History', label: 'History' },
];

const BILL_BADGE: Record<string, { bg: string; text: string }> = {
  Paid: { bg: '#E8F0E4', text: '#647C59' },
  Due: { bg: '#FDECD8', text: '#8E5526' },
  Overdue: { bg: '#FDEEE6', text: '#CE5726' },
  Upcoming: { bg: '#93C5E2', text: '#164A66' },
};

function maskPhone(phone?: string): string | null {
  if (!phone) return null;
  return phone.replace(/\d(?=\d{2})/g, '•');
}

function maskEmail(email?: string): string | null {
  if (!email) return null;
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}•••@${domain}`;
}

export default function TenantDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const landlordId = session?.user?.id;
  const params = useLocalSearchParams<{ tenantId?: string }>();
  const tenantId = Array.isArray(params.tenantId) ? params.tenantId[0] : params.tenantId;

  const ready = useLandlordDataReady();
  const data = useLandlordData();

  const [tab, setTab] = useState<Tab>('Profile');
  const [showContact, setShowContact] = useState(false);
  const [action, setAction] = useState<
    'approve' | 'movein' | 'moveout' | 'rentbill' | 'expense' | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');

  const [approveRoomId, setApproveRoomId] = useState<string | null>(null);
  const [approveRent, setApproveRent] = useState('');
  const [approveDeposit, setApproveDeposit] = useState('');
  const [approveStart, setApproveStart] = useState('');
  const [approveEnd, setApproveEnd] = useState('');
  const [moveInAt, setMoveInAt] = useState(() => toISODate(new Date()));
  const [moveInEnd, setMoveInEnd] = useState('');
  const [moveOutAt, setMoveOutAt] = useState(() => toISODate(new Date()));
  const [moveOutReason, setMoveOutReason] = useState('');
  const [billDue, setBillDue] = useState(() => toISODate(new Date()));
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseDue, setExpenseDue] = useState(() => toISODate(new Date()));

  const tenant = toTenantViews(data).find((item) => item.id === tenantId);
  const property = data.properties.find((item) => item.id === tenant?.propertyId);
  const authorized = property != null && canViewProperty(property, landlordId);

  if (!ready) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={st.centerFill}>
          <ActivityIndicator size="large" color={LANDLORD_THEME.primary} />
          <Text style={st.loadingText}>Loading tenant…</Text>
        </View>
      </View>
    );
  }

  if (!tenant || !property || !authorized) {
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
            <Text style={st.headerTitle}>Tenant</Text>
          </View>
          <View style={st.centerFill}>
            <Ionicons name="person-remove-outline" size={30} color={LANDLORD_THEME.textMuted} />
            <Text style={st.notFoundTitle}>Tenant not available</Text>
            <Text style={st.notFoundBody}>
              This record may belong to another landlord, or it no longer exists.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const room = property.rooms.find((item) => item.id === tenant.roomId);
  const tenantBills = data.bills
    .filter((bill) => bill.tenantId === tenant.id)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const unpaidBills = tenantBills.filter((bill) => !bill.paidAt);
  const paidBills = tenantBills.filter((bill) => bill.paidAt);
  const messages = tenant.messages ?? [];
  const activities = tenantActivitiesOf(data, tenant.id);
  const maskedPhone = maskPhone(tenant.phone);
  const maskedEmail = maskEmail(tenant.email);

  const assignableRooms = property.rooms.filter((item) => {
    const claimed = data.tenants.filter(
      (t) =>
        t.roomId === item.id &&
        t.id !== tenant.id &&
        (t.status === 'Active' || t.status === 'Reserved')
    ).length;
    return claimed < (item.maxCapacity ?? 1) && roomAvailability(item) !== 'Maintenance';
  });

  const run = async (work: () => Promise<void>, successTitle: string, successBody: string) => {
    setBusy(true);
    try {
      await work();
      setAction(null);
      Alert.alert(successTitle, successBody);
    } catch (error) {
      Alert.alert('Action failed', toErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const onApprove = () =>
    run(
      async () => {
        if (!approveRoomId) throw new Error('Choose a room to reserve.');
        await approveTenancy(
          tenant.id,
          {
            roomId: approveRoomId,
            monthlyRent: approveRent ? Number(approveRent) : undefined,
            deposit: approveDeposit ? Number(approveDeposit) : undefined,
            leaseStart: approveStart.trim() || undefined,
            leaseEnd: approveEnd.trim() || undefined,
          },
          landlordId
        );
        setApproveRoomId(null);
        setApproveRent('');
        setApproveDeposit('');
        setApproveStart('');
        setApproveEnd('');
      },
      'Room reserved',
      `${tenant.fullName} is now a reserved occupant. Record move-in when they arrive — an inquiry alone never creates an active tenancy.`
    );

  const onDecline = () => {
    Alert.alert(
      'Decline tenancy request',
      `Decline ${tenant.fullName}'s ${
        tenant.status === 'Reserved' ? 'reservation' : 'inquiry or request'
      }? The record and any billing history are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () =>
            void run(
              () => declineTenancy(tenant.id, landlordId),
              'Request declined',
              `${tenant.fullName} was declined. Their record stays in the directory for your history.`
            ),
        },
      ]
    );
  };

  const onRelease = () => {
    Alert.alert(
      'Release reserved room',
      `Release the room held for ${tenant.fullName}? They return to the request queue and the room becomes available again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          onPress: () =>
            void run(
              () => cancelReservation(tenant.id, landlordId),
              'Reservation released',
              'The room is available again and the request stays on record.'
            ),
        },
      ]
    );
  };

  const onMoveIn = () =>
    run(
      () =>
        moveInTenant(
          tenant.id,
          { moveInAt: moveInAt.trim() || undefined, leaseEnd: moveInEnd.trim() || undefined },
          landlordId
        ),
      'Move-in recorded',
      `${tenant.fullName} is now an Active tenant. The first rent bill was added to their billing history.`
    );

  const onMoveOut = () => {
    Alert.alert(
      'End tenancy',
      `Record move-out for ${tenant.fullName}? This ends the active tenancy. All payment and billing history is preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Tenancy',
          style: 'destructive',
          onPress: () =>
            void run(
              () =>
                recordMoveOut(
                  tenant.id,
                  {
                    moveOutAt: moveOutAt.trim() || undefined,
                    reason: moveOutReason.trim() || undefined,
                  },
                  landlordId
                ),
              'Tenancy ended',
              `${tenant.fullName} is now a Former tenant. Their records remain available for your history.`
            ),
        },
      ]
    );
  };

  const onAddRentBill = () =>
    run(
      () => addRentBill(tenant.id, billDue.trim() || toISODate(new Date()), landlordId),
      'Rent bill added',
      `A ${formatPeso(tenant.monthlyRent)} rent bill was added to ${tenant.fullName}'s billing history.`
    );

  const onAddExpense = () =>
    run(
      async () => {
        const amount = Number(expenseAmount);
        if (!expenseAmount.trim() || Number.isNaN(amount) || amount <= 0) {
          throw new Error('Enter an amount greater than ₱0.');
        }
        if (!expenseNote.trim()) throw new Error('Describe what the shared expense covers.');
        await addSharedExpenseBill(
          tenant.id,
          {
            amount,
            dueDate: expenseDue.trim() || toISODate(new Date()),
            note: expenseNote.trim(),
          },
          landlordId
        );
        setExpenseAmount('');
        setExpenseNote('');
      },
      'Shared expense recorded',
      'The itemised expense now appears in this tenant’s billing history.'
    );

  const onSend = () =>
    run(
      async () => {
        if (!messageDraft.trim()) throw new Error('Type a message first.');
        await sendTenantMessage(tenant.id, messageDraft, landlordId);
        setMessageDraft('');
      },
      'Message sent',
      'Your reply was added to the tenancy conversation.'
    );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
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
              <Text style={st.headerTitle} numberOfLines={1}>
                {tenant.fullName}
              </Text>
              <Text style={st.headerSubtitle} numberOfLines={1}>
                {room ? `${property.name} · ${room.label}` : property.name}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(landlordTenantForm(tenant.id))}
              style={({ pressed }) => [st.editButton, pressed && st.editButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit tenant information"
            >
              <Ionicons name="create-outline" size={15} color={LANDLORD_THEME.onPrimary} />
              <Text style={st.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          {/* Identity card */}
          <View style={st.identity}>
            {tenant.photoUri ? (
              <Image
                source={{ uri: tenant.photoUri }}
                style={st.identityAvatar}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={[st.identityAvatar, st.identityAvatarPlaceholder]}>
                <Text style={st.identityInitials}>{tenant.initials}</Text>
              </View>
            )}
            <View style={st.identityCopy}>
              <View style={st.identityBadges}>
                <TenantStatusBadge status={tenant.status} />
                {tenant.leaseStatus === 'Renewal' ? (
                  <View style={st.renewalBadge}>
                    <Text style={st.renewalBadgeText}>Renewal due</Text>
                  </View>
                ) : null}
              </View>
              {tenant.outstandingBalance > 0 ? (
                <Text style={st.identityBalance}>
                  {formatPeso(tenant.outstandingBalance)} outstanding
                </Text>
              ) : (
                <Text style={st.identityBalanceSettled}>Account settled</Text>
              )}
            </View>
          </View>

          {/* Lifecycle actions */}
          <View style={st.actionsRow}>
            {tenant.status === 'Inquiry' || tenant.status === 'Requested' ? (
              <>
                <Pressable
                  onPress={() => setAction(action === 'approve' ? null : 'approve')}
                  disabled={busy}
                  style={({ pressed }) => [st.actionButton, pressed && st.actionButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Approve and reserve a room"
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={LANDLORD_THEME.onPrimary} />
                  <Text style={st.actionButtonText}>Approve</Text>
                </Pressable>
                <Pressable
                  onPress={onDecline}
                  disabled={busy}
                  style={({ pressed }) => [st.actionButton, st.actionButtonGhost, pressed && st.actionButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Decline tenancy request"
                >
                  <Ionicons name="close-circle-outline" size={16} color={LANDLORD_THEME.badgeUrgentText} />
                  <Text style={[st.actionButtonText, st.actionButtonTextGhost]}>Decline</Text>
                </Pressable>
              </>
            ) : null}

            {tenant.status === 'Reserved' ? (
              <>
                <Pressable
                  onPress={() => setAction(action === 'movein' ? null : 'movein')}
                  disabled={busy}
                  style={({ pressed }) => [st.actionButton, pressed && st.actionButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Record move-in"
                >
                  <Ionicons name="log-in-outline" size={16} color={LANDLORD_THEME.onPrimary} />
                  <Text style={st.actionButtonText}>Record Move-In</Text>
                </Pressable>
                <Pressable
                  onPress={onRelease}
                  disabled={busy}
                  style={({ pressed }) => [st.actionButton, st.actionButtonGhost, pressed && st.actionButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Release reserved room"
                >
                  <Ionicons name="refresh-outline" size={16} color={LANDLORD_THEME.textSecondary} />
                  <Text style={[st.actionButtonText, st.actionButtonTextGhostSecondary]}>Release</Text>
                </Pressable>
              </>
            ) : null}

            {tenant.status === 'Active' ? (
              <>
                <Pressable
                  onPress={() => setAction(action === 'moveout' ? null : 'moveout')}
                  disabled={busy}
                  style={({ pressed }) => [st.actionButton, st.actionButtonDanger, pressed && st.actionButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Record move-out"
                >
                  <Ionicons name="log-out-outline" size={16} color={LANDLORD_THEME.badgeUrgentText} />
                  <Text style={[st.actionButtonText, st.actionButtonTextDanger]}>Record Move-Out</Text>
                </Pressable>
              </>
            ) : null}

            {tenant.status === 'Former' || tenant.status === 'Declined' ? (
              <View style={st.historyNote}>
                <Ionicons name="archive-outline" size={14} color={LANDLORD_THEME.textMuted} />
                <Text style={st.historyNoteText}>
                  Record kept for history — payments and billing remain intact.
                </Text>
              </View>
            ) : null}
          </View>

          {/* Inline action forms */}
          {action === 'approve' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Approve — reserve a room</Text>
              <Text style={form.fieldLabel}>Room</Text>
              <View style={st.chipsWrap}>
                {assignableRooms.length === 0 ? (
                  <Text style={form.sectionHint}>
                    No rooms with free capacity at {property.name}. The renter stays an inquiry.
                  </Text>
                ) : (
                  assignableRooms.map((item) => {
                    const isActive = approveRoomId === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setApproveRoomId(item.id);
                          setApproveRent(String(item.rent));
                        }}
                        style={[st.chip, !isActive && st.chipInactive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={`Reserve ${item.label}`}
                      >
                        <Text style={[st.chipText, !isActive && st.chipTextInactive]}>
                          {item.label} · {formatPeso(item.rent)}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>
              <View style={st.formRow}>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Monthly rent (₱)</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={approveRent}
                      onChangeText={setApproveRent}
                      placeholder="0"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      keyboardType="number-pad"
                      accessibilityLabel="Monthly rent"
                    />
                  </View>
                </View>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Deposit (₱)</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={approveDeposit}
                      onChangeText={(value) =>
                        setApproveDeposit(value.replace(/[^0-9.]/g, ''))
                      }
                      placeholder="Optional"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      keyboardType="number-pad"
                      accessibilityLabel="Security deposit"
                    />
                  </View>
                </View>
              </View>
              <View style={st.formRow}>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Lease start</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={approveStart}
                      onChangeText={setApproveStart}
                      placeholder="yyyy-mm-dd"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      accessibilityLabel="Lease start date"
                    />
                  </View>
                </View>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Lease end</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={approveEnd}
                      onChangeText={setApproveEnd}
                      placeholder="yyyy-mm-dd or blank"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      accessibilityLabel="Lease end date"
                    />
                  </View>
                </View>
              </View>
              <Pressable
                onPress={() => void onApprove()}
                disabled={busy || !approveRoomId}
                style={({ pressed }) => [
                  form.primaryButton,
                  { marginTop: 12 },
                  pressed && form.primaryButtonPressed,
                  (busy || !approveRoomId) && form.primaryButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirm approval and reserve room"
              >
                <Text style={form.primaryButtonText}>Reserve Room</Text>
              </Pressable>
            </View>
          ) : null}

          {action === 'movein' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Record move-in</Text>
              <View style={st.formRow}>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Move-in date</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={moveInAt}
                      onChangeText={setMoveInAt}
                      placeholder="yyyy-mm-dd"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      accessibilityLabel="Move-in date"
                    />
                  </View>
                </View>
                <View style={st.formRowItem}>
                  <Text style={form.fieldLabel}>Expected end</Text>
                  <View style={form.field}>
                    <TextInput
                      style={form.input}
                      value={moveInEnd}
                      onChangeText={setMoveInEnd}
                      placeholder="yyyy-mm-dd or blank"
                      placeholderTextColor={LANDLORD_THEME.textMuted}
                      accessibilityLabel="Expected lease end"
                    />
                  </View>
                </View>
              </View>
              <Text style={form.sectionHint}>
                Move-in makes the tenancy Active, occupies the room, and creates the first
                rent bill.
              </Text>
              <Pressable
                onPress={() => void onMoveIn()}
                disabled={busy}
                style={({ pressed }) => [
                  form.primaryButton,
                  { marginTop: 12 },
                  pressed && form.primaryButtonPressed,
                  busy && form.primaryButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirm move-in"
              >
                <Text style={form.primaryButtonText}>Confirm Move-In</Text>
              </Pressable>
            </View>
          ) : null}

          {action === 'moveout' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Record move-out</Text>
              <Text style={form.fieldLabel}>Move-out date</Text>
              <View style={form.field}>
                <TextInput
                  style={form.input}
                  value={moveOutAt}
                  onChangeText={setMoveOutAt}
                  placeholder="yyyy-mm-dd"
                  placeholderTextColor={LANDLORD_THEME.textMuted}
                  accessibilityLabel="Move-out date"
                />
              </View>
              <Text style={[form.fieldLabel, { marginTop: 12 }]}>Reason (optional)</Text>
              <View style={[form.field, form.fieldMultiline]}>
                <TextInput
                  style={[form.input, form.inputMultiline]}
                  value={moveOutReason}
                  onChangeText={setMoveOutReason}
                  placeholder="Lease ended, relocated, terminated…"
                  placeholderTextColor={LANDLORD_THEME.textMuted}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Move-out reason"
                />
              </View>
              <Text style={form.sectionHint}>
                All payment and billing history is preserved after move-out.
              </Text>
              <Pressable
                onPress={onMoveOut}
                disabled={busy}
                style={({ pressed }) => [
                  form.dangerButton,
                  { marginTop: 12 },
                  pressed && form.dangerButtonPressed,
                  busy && form.primaryButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Confirm move-out"
              >
                <Text style={form.dangerButtonText}>End Tenancy</Text>
              </Pressable>
            </View>
          ) : null}

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

          {/* Profile */}
          {tab === 'Profile' ? (
            <>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Basic information</Text>
                <Text style={st.bodyLabel}>Full name</Text>
                <Text style={st.bodyValue}>{tenant.fullName}</Text>
                {tenant.notes ? (
                  <>
                    <Text style={[st.bodyLabel, { marginTop: 10 }]}>Notes</Text>
                    <Text style={st.bodyValue}>{tenant.notes}</Text>
                  </>
                ) : null}
              </View>

              <View style={form.sectionCard}>
                <View style={st.sectionHeaderRow}>
                  <Text style={form.sectionTitle}>Contact information</Text>
                  <Pressable
                    onPress={() => setShowContact((prev) => !prev)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showContact ? 'Hide contact details' : 'Reveal contact details'}
                  >
                    <Text style={st.revealText}>{showContact ? 'Hide' : 'Reveal'}</Text>
                  </Pressable>
                </View>
                <Text style={form.sectionHint}>
                  Visible only to you as the property owner. Revealing shows full details.
                </Text>
                <Text style={st.bodyLabel}>Phone</Text>
                <Text style={st.bodyValue}>
                  {tenant.phone ? (showContact ? tenant.phone : maskedPhone) : 'Not provided'}
                </Text>
                <Text style={[st.bodyLabel, { marginTop: 10 }]}>Email</Text>
                <Text style={st.bodyValue}>
                  {tenant.email ? (showContact ? tenant.email : maskedEmail) : 'Not provided'}
                </Text>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Assignment & tenancy</Text>
                <Pressable
                  onPress={() => router.push(landlordPropertyDetails(property.id))}
                  style={st.assignmentRow}
                  accessibilityRole="button"
                  accessibilityLabel="Open property details"
                >
                  <Text style={st.assignmentLabel}>Property</Text>
                  <View style={st.assignmentValueRow}>
                    <Text style={st.assignmentValue}>{property.name}</Text>
                    <Ionicons name="chevron-forward" size={14} color={LANDLORD_THEME.textMuted} />
                  </View>
                </Pressable>
                <View style={st.divider} />
                <View style={st.assignmentRow}>
                  <Text style={st.assignmentLabel}>Room</Text>
                  {room ? (
                    <Pressable
                      onPress={() => router.push(landlordRoomDetails(room.id))}
                      accessibilityRole="button"
                      accessibilityLabel="Open room details"
                    >
                      <Text style={[st.assignmentValue, st.assignmentLink]}>{room.label}</Text>
                    </Pressable>
                  ) : (
                    <Text style={st.assignmentValueMuted}>Not assigned</Text>
                  )}
                </View>
                <View style={st.divider} />
                <View style={st.assignmentRow}>
                  <Text style={st.assignmentLabel}>Monthly rent</Text>
                  <Text style={st.assignmentValue}>
                    {tenant.monthlyRent > 0 ? `${formatPeso(tenant.monthlyRent)}/mo` : '—'}
                  </Text>
                </View>
                {tenant.deposit ? (
                  <>
                    <View style={st.divider} />
                    <View style={st.assignmentRow}>
                      <Text style={st.assignmentLabel}>Deposit held</Text>
                      <Text style={st.assignmentValue}>{formatPeso(tenant.deposit)}</Text>
                    </View>
                  </>
                ) : null}
                <View style={st.divider} />
                <View style={st.assignmentRow}>
                  <Text style={st.assignmentLabel}>Tenancy start</Text>
                  <Text style={st.assignmentValue}>
                    {tenant.leaseStart ? formatDisplayDate(tenant.leaseStart) : 'Not recorded'}
                  </Text>
                </View>
                <View style={st.divider} />
                <View style={st.assignmentRow}>
                  <Text style={st.assignmentLabel}>Expected end</Text>
                  <Text style={st.assignmentValue}>
                    {tenant.leaseEnd ? formatDisplayDate(tenant.leaseEnd) : 'Open-ended'}
                  </Text>
                </View>
                {tenant.moveInAt ? (
                  <>
                    <View style={st.divider} />
                    <View style={st.assignmentRow}>
                      <Text style={st.assignmentLabel}>Moved in</Text>
                      <Text style={st.assignmentValue}>{formatDisplayDate(tenant.moveInAt)}</Text>
                    </View>
                  </>
                ) : null}
                {tenant.moveOutAt ? (
                  <>
                    <View style={st.divider} />
                    <View style={st.assignmentRow}>
                      <Text style={st.assignmentLabel}>Moved out</Text>
                      <Text style={st.assignmentValue}>{formatDisplayDate(tenant.moveOutAt)}</Text>
                    </View>
                  </>
                ) : null}
              </View>
            </>
          ) : null}

          {/* Billing */}
          {tab === 'Billing' ? (
            <>
              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Outstanding balance</Text>
                <Text style={[st.balanceValue, tenant.outstandingBalance > 0 ? st.balanceValueOwed : null]}>
                  {tenant.outstandingBalance > 0 ? formatPeso(tenant.outstandingBalance) : formatPeso(0)}
                </Text>
                <Text style={form.sectionHint}>
                  {unpaidBills.length} unpaid item{unpaidBills.length === 1 ? '' : 's'} · rent and
                  shared expenses combined
                </Text>
              </View>

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Unpaid</Text>
                {unpaidBills.length === 0 ? (
                  <Text style={st.mutedText}>Nothing outstanding.</Text>
                ) : (
                  unpaidBills.map((bill) => {
                    const status = billStatus(bill);
                    const badge = BILL_BADGE[status] ?? BILL_BADGE.Due;
                    return (
                      <View key={bill.id} style={st.billCard}>
                        <View style={st.billCopy}>
                          <Text style={st.billPeriod}>
                            {bill.kind === 'expense' ? bill.note ?? 'Shared expense' : bill.period}
                          </Text>
                          <Text style={st.billMeta}>
                            {bill.kind === 'expense' ? 'Shared expense' : 'Rent'} · Due{' '}
                            {formatShortDate(bill.dueDate)}
                          </Text>
                          <View style={[st.billBadge, { backgroundColor: badge.bg }]}>
                            <Text style={[st.billBadgeText, { color: badge.text }]}>{status}</Text>
                          </View>
                        </View>
                        <View style={st.billRight}>
                          <Text style={st.billAmount}>{formatPeso(bill.amount)}</Text>
                          <Pressable
                            onPress={() => void markBillPaid(bill.id)}
                            style={({ pressed }) => [st.markPaid, pressed && { opacity: 0.8 }]}
                            accessibilityRole="button"
                            accessibilityLabel={`Record payment of ${formatPeso(bill.amount)}`}
                          >
                            <Text style={st.markPaidText}>Mark Paid</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {tenant.status === 'Active' ? (
                <View style={form.sectionCard}>
                  <Text style={form.sectionTitle}>Add billing</Text>
                  {action === 'rentbill' ? (
                    <>
                      <Text style={form.fieldLabel}>Rent due date</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={billDue}
                          onChangeText={setBillDue}
                          placeholder="yyyy-mm-dd"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel="Rent due date"
                        />
                      </View>
                      <Pressable
                        onPress={() => void onAddRentBill()}
                        disabled={busy}
                        style={({ pressed }) => [
                          form.primaryButton,
                          { marginTop: 12 },
                          pressed && form.primaryButtonPressed,
                          busy && form.primaryButtonDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Add rent bill"
                      >
                        <Text style={form.primaryButtonText}>Add Rent Bill</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => setAction('rentbill')}
                      style={({ pressed }) => [st.secondaryAction, pressed && { opacity: 0.8 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Add a rent bill"
                    >
                      <Ionicons name="add-circle-outline" size={16} color={LANDLORD_THEME.primaryDark} />
                      <Text style={st.secondaryActionText}>Add Rent Bill</Text>
                    </Pressable>
                  )}

                  {action === 'expense' ? (
                    <>
                      <Text style={[form.fieldLabel, { marginTop: 14 }]}>What is the shared cost?</Text>
                      <View style={form.field}>
                        <TextInput
                          style={form.input}
                          value={expenseNote}
                          onChangeText={setExpenseNote}
                          placeholder="Electricity share, water, repair…"
                          placeholderTextColor={LANDLORD_THEME.textMuted}
                          accessibilityLabel="Shared expense description"
                        />
                      </View>
                      <View style={st.formRow}>
                        <View style={st.formRowItem}>
                          <Text style={form.fieldLabel}>Amount (₱)</Text>
                          <View style={form.field}>
                            <TextInput
                              style={form.input}
                              value={expenseAmount}
                              onChangeText={(value) => setExpenseAmount(value.replace(/[^0-9.]/g, ''))}
                              placeholder="0"
                              placeholderTextColor={LANDLORD_THEME.textMuted}
                              keyboardType="decimal-pad"
                              accessibilityLabel="Shared expense amount"
                            />
                          </View>
                        </View>
                        <View style={st.formRowItem}>
                          <Text style={form.fieldLabel}>Due date</Text>
                          <View style={form.field}>
                            <TextInput
                              style={form.input}
                              value={expenseDue}
                              onChangeText={setExpenseDue}
                              placeholder="yyyy-mm-dd"
                              placeholderTextColor={LANDLORD_THEME.textMuted}
                              accessibilityLabel="Shared expense due date"
                            />
                          </View>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => void onAddExpense()}
                        disabled={busy}
                        style={({ pressed }) => [
                          form.primaryButton,
                          { marginTop: 12 },
                          pressed && form.primaryButtonPressed,
                          busy && form.primaryButtonDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Record shared expense"
                      >
                        <Text style={form.primaryButtonText}>Record Expense</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => setAction('expense')}
                      style={({ pressed }) => [st.secondaryAction, pressed && { opacity: 0.8 }]}
                      accessibilityRole="button"
                      accessibilityLabel="Add a shared expense"
                    >
                      <Ionicons name="flash-outline" size={16} color={LANDLORD_THEME.primaryDark} />
                      <Text style={st.secondaryActionText}>Add Shared Expense</Text>
                    </Pressable>
                  )}
                </View>
              ) : null}

              <View style={form.sectionCard}>
                <Text style={form.sectionTitle}>Payment history</Text>
                {paidBills.length === 0 ? (
                  <Text style={st.mutedText}>No recorded payments yet.</Text>
                ) : (
                  paidBills.map((bill) => (
                    <View key={bill.id} style={st.billCard}>
                      <View style={st.billCopy}>
                        <Text style={st.billPeriod}>
                          {bill.kind === 'expense' ? bill.note ?? 'Shared expense' : bill.period}
                        </Text>
                        <Text style={st.billMeta}>
                          Paid {bill.paidAt ? formatShortDate(bill.paidAt) : '—'} ·{' '}
                          {bill.kind === 'expense' ? 'Shared expense' : 'Rent'}
                        </Text>
                      </View>
                      <Text style={st.billAmountPaid}>{formatPeso(bill.amount)}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}

          {/* Messages */}
          {tab === 'Messages' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Messages</Text>
              {messages.length === 0 ? (
                <Text style={st.mutedText}>No messages on this tenancy yet.</Text>
              ) : (
                messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      st.messageBubble,
                      message.from === 'landlord' ? st.messageOut : st.messageIn,
                    ]}
                  >
                    <Text style={st.messageMeta}>
                      {message.from === 'landlord' ? 'You' : tenant.fullName} ·{' '}
                      {formatShortDate(message.at)}
                    </Text>
                    <Text style={st.messageBody}>{message.body}</Text>
                  </View>
                ))
              )}
              <View style={st.composer}>
                <TextInput
                  style={st.composerInput}
                  value={messageDraft}
                  onChangeText={setMessageDraft}
                  placeholder="Write a message…"
                  placeholderTextColor={LANDLORD_THEME.textMuted}
                  multiline
                  accessibilityLabel="Message to tenant"
                />
                <Pressable
                  onPress={() => void onSend()}
                  disabled={busy || !messageDraft.trim()}
                  style={({ pressed }) => [
                    st.sendButton,
                    pressed && { opacity: 0.8 },
                    (busy || !messageDraft.trim()) && { opacity: 0.5 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                >
                  <Ionicons name="send" size={15} color={LANDLORD_THEME.onPrimary} />
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* History */}
          {tab === 'History' ? (
            <View style={form.sectionCard}>
              <Text style={form.sectionTitle}>Tenancy activity</Text>
              {activities.length === 0 ? (
                <Text style={st.mutedText}>No activity recorded yet.</Text>
              ) : (
                activities.map((activity) => (
                  <View key={activity.id} style={st.timelineRow}>
                    <View style={st.timelineDot} />
                    <View style={st.timelineCopy}>
                      <Text style={st.timelineTitle}>{activity.title}</Text>
                      <Text style={st.timelineDetail}>{activity.detail}</Text>
                      <Text style={st.timelineAt}>{formatDisplayDate(activity.at.slice(0, 10))}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
