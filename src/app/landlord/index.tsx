import { ProfileAvatar } from '@/components/common/ProfileAvatar/ProfileAvatar';
import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';

import {
  landlordPaymentDetails,
  landlordPropertyDetails,
  routes,
} from '@/routes';
import { useAuthSession } from '@/services/auth';
import {
  decideRentalRequest,
  toPropertyViews,
  toRequestViews,
  useLandlordData,
  useLandlordSummary,
  type ActivityKind,
  type BillView,
} from '@/services/landlordData';
import { formatPeso } from '@/utils/currency';
import { formatRelativeTime, formatShortDate } from '@/utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dashboardStyles } from '../../styles/landlord/dashboard.styles';
import { LANDLORD_THEME, styles } from '../../styles/landlord/styles';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ACTIVITY_ICONS: Record<ActivityKind, { icon: IconName; info: boolean }> = {
  payment: { icon: 'cash-outline', info: false },
  inquiry: { icon: 'chatbubble-outline', info: true },
  tenant: { icon: 'person-add-outline', info: false },
  availability: { icon: 'key-outline', info: true },
  request: { icon: 'mail-unread-outline', info: true },
};

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          {({ pressed }) => (
            <Text
              style={[
                dashboardStyles.sectionAction,
                pressed && { opacity: 0.6 },
              ]}
            >
              {actionLabel}
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function LandlordDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuthSession();
  const data = useLandlordData();
  const summary = useLandlordSummary();

  const firstName = session?.user?.fullName?.split(' ')[0] ?? 'Landlord';
  const greeting = greetingForHour(new Date().getHours());

  const properties = useMemo(
    () =>
      toPropertyViews(data).sort(
        (a, b) =>
          b.totalRooms - a.totalRooms || a.name.localeCompare(b.name)
      ),
    [data]
  );
  const requestViews = useMemo(() => toRequestViews(data), [data]);
  const pendingRequests = requestViews.filter((request) => request.status === 'Pending');
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const activities = useMemo(
    () =>
      [...data.activities].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      ),
    [data]
  );

  const hasProperties = summary.totalProperties > 0;
  const upcoming = summary.upcomingBills.slice(0, 4);
  const overdue = summary.overdueBills.slice(0, 3);
  const unread = summary.unreadNotifications;

  const summaryCards: {
    key: string;
    icon: IconName;
    value: number;
    label: string;
    info?: boolean;
    onPress: () => void;
  }[] = [
      {
        key: 'properties',
        icon: 'business-outline',
        value: summary.totalProperties,
        label: 'Total Properties',
        onPress: () => router.push(routes.landlordProperties),
      },
      {
        key: 'rooms',
        icon: 'grid-outline',
        value: summary.totalRooms,
        label: 'Total Rooms',
        onPress: () => router.push(routes.landlordProperties),
      },
      {
        key: 'available',
        icon: 'key-outline',
        value: summary.availableRooms,
        label: 'Available Rooms',
        info: true,
        onPress: () => router.push(routes.landlordProperties),
      },
      {
        key: 'tenants',
        icon: 'people-outline',
        value: summary.activeTenants,
        label: 'Active Tenants',
        onPress: () => router.push(routes.landlordLeases),
      },
    ];

  const quickActions: { key: string; icon: IconName; label: string; onPress: () => void }[] =
    [
      {
        key: 'property',
        icon: 'business-outline',
        label: 'Add Property',
        onPress: () => router.push(routes.landlordListSpace),
      },
      {
        key: 'room',
        icon: 'bed-outline',
        label: 'Add Room',
        onPress: () => router.push(routes.landlordProperties),
      },
      {
        key: 'tenant',
        icon: 'person-add-outline',
        label: 'Add Tenant',
        onPress: () => router.push(routes.landlordLeases),
      },
      {
        key: 'payment',
        icon: 'cash-outline',
        label: 'Record Payment',
        onPress: () => router.push(routes.landlordBills),
      },
      {
        key: 'expense',
        icon: 'receipt-outline',
        label: 'Add Shared Expense',
        onPress: () => router.push(routes.landlordExpenses),
      },
    ];

  const openNotifications = () => {
    router.push(routes.landlordNotifications);
  };

  const decide = (requestId: string, decision: 'approve' | 'decline') => {
    setDecidingId(requestId);
    void decideRentalRequest(requestId, decision)
      .then((request) => {
        if (decision === 'approve') {
          Alert.alert(
            'Request approved',
            `${request.renterName} is now registered and the room was marked occupied.`
          );
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Please try again.';
        Alert.alert('Could not decide request', message);
      })
      .finally(() => setDecidingId(null));
  };

  const dueChip = (bill: BillView) => {
    const overdueBill = bill.status === 'Overdue';
    const dueToday = bill.status === 'Due';
    return (
      <View
        style={[
          dashboardStyles.dueChip,
          overdueBill && dashboardStyles.overdueChip,
        ]}
      >
        <Text
          style={[
            dashboardStyles.dueChipText,
            overdueBill && dashboardStyles.overdueChipText,
          ]}
        >
          {overdueBill
            ? `Overdue ${formatShortDate(bill.dueDate)}`
            : dueToday
              ? 'Due today'
              : `Due ${formatShortDate(bill.dueDate)}`}
        </Text>
      </View>
    );
  };

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
          {/* Header: brand, notifications, avatar */}
          <View style={dashboardStyles.headerRow}>
            <View style={dashboardStyles.brandGroup}>
              <View
                style={dashboardStyles.logoIconContainer}
                accessibilityRole="image"
                accessibilityLabel="BoardPoint logo"
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={LANDLORD_THEME.onPrimary}
                />
              </View>
              <View style={dashboardStyles.headerTextCol}>
                <Text style={styles.brandTitle}>BoardPoint</Text>
                <Text style={styles.brandSubtitle}>
                  RENTAL OPERATIONS, MAPPED
                </Text>
              </View>
            </View>

            <View style={dashboardStyles.headerActions}>
              <Pressable
                onPress={openNotifications}
                style={({ pressed }) => [
                  dashboardStyles.bellButton,
                  pressed && dashboardStyles.bellButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  unread > 0
                    ? `Notifications, ${unread} unread`
                    : 'Notifications'
                }
              >
                <Ionicons
                  name={unread > 0 ? 'notifications' : 'notifications-outline'}
                  size={20}
                  color={LANDLORD_THEME.textPrimary}
                />
                {unread > 0 ? (
                  <View style={dashboardStyles.bellBadge}>
                    <Text style={dashboardStyles.bellBadgeText}>
                      {unread > 9 ? '9+' : unread}
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              <ProfileAvatar
                name={session?.user?.fullName ?? 'Landlord'}
                size={42}
                onPress={() => router.push(routes.landlordProfile)}
                accessibilityLabel="Open profile"
              />
            </View>
          </View>

          {/* Greeting */}
          <View style={dashboardStyles.greetingBlock}>
            <Text style={dashboardStyles.greetingTitle}>
              {greeting}, Landlord!
            </Text>
            <Text style={dashboardStyles.greetingSubtitle}>
              Welcome back, {firstName}. Here is what is happening across your
              properties today.
            </Text>
          </View>

          {/* Summary cards */}
          <View style={dashboardStyles.summaryGrid}>
            {summaryCards.map((card) => (
              <Pressable
                key={card.key}
                onPress={card.onPress}
                style={({ pressed }) => [
                  dashboardStyles.summaryCard,
                  pressed && dashboardStyles.summaryCardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${card.label}: ${card.value}`}
              >
                <View
                  style={[
                    dashboardStyles.summaryIcon,
                    card.info && dashboardStyles.summaryIconInfo,
                  ]}
                >
                  <Ionicons
                    name={card.icon}
                    size={17}
                    color={
                      card.info
                        ? LANDLORD_THEME.badgeBlueText
                        : LANDLORD_THEME.primaryDark
                    }
                  />
                </View>
                <Text style={dashboardStyles.summaryValue}>{card.value}</Text>
                <Text style={dashboardStyles.summaryLabel}>{card.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Billing summary */}
          <Pressable
            onPress={() => router.push(routes.landlordBills)}
            style={({ pressed }) => [
              dashboardStyles.billingCard,
              pressed && dashboardStyles.billingCardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Billing summary, open rental bills"
          >
            <View style={dashboardStyles.billingHeaderRow}>
              <Text style={dashboardStyles.billingTitle}>Billing summary</Text>
              <Text style={dashboardStyles.billingLink}>View bills</Text>
            </View>

            {summary.hasBillingRecords ? (
              <View style={dashboardStyles.billingRows}>
                <View style={dashboardStyles.billingRow}>
                  <Text style={dashboardStyles.billingRowLabel}>
                    Outstanding rent
                  </Text>
                  <Text
                    style={[
                      dashboardStyles.billingRowValue,
                      dashboardStyles.billingRowValuePrimary,
                    ]}
                  >
                    {formatPeso(summary.outstandingAmount)}
                  </Text>
                </View>
                <View style={dashboardStyles.billingRow}>
                  <Text style={dashboardStyles.billingRowLabel}>
                    Overdue balances
                  </Text>
                  <Text
                    style={[
                      dashboardStyles.billingRowValue,
                      summary.overdueCount > 0
                        ? dashboardStyles.billingRowValueAlert
                        : undefined,
                    ]}
                  >
                    {summary.overdueCount > 0
                      ? `${formatPeso(summary.overdueAmount)} · ${summary.overdueCount}`
                      : 'None'}
                  </Text>
                </View>
                <View style={dashboardStyles.billingRow}>
                  <Text style={dashboardStyles.billingRowLabel}>
                    Next payment due
                  </Text>
                  <Text style={dashboardStyles.billingRowValue}>
                    {summary.nextDueDate
                      ? formatShortDate(summary.nextDueDate)
                      : '—'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={dashboardStyles.billingNote}>
                No billing records yet. Rent bills and due dates appear here
                once tenants are added.
              </Text>
            )}
          </Pressable>

          {/* Rental Requests */}
          <SectionHeader
            title="Rental Requests"
            actionLabel="View all"
            onAction={() => router.push(routes.landlordProperties)}
          />
          {pendingRequests.length > 0 ? (
            pendingRequests.slice(0, 4).map((request) => (
              <View key={request.id} style={dashboardStyles.requestCard}>
                <View style={dashboardStyles.requestHeader}>
                  <View style={dashboardStyles.paymentInfo}>
                    <Text style={dashboardStyles.requestName}>
                      {request.renterName}
                    </Text>
                    <Text style={dashboardStyles.requestMeta}>
                      {request.propertyName} · {request.roomLabel}
                    </Text>
                  </View>
                  <Text style={dashboardStyles.requestRent}>
                    {formatPeso(request.monthlyRent)}/month
                  </Text>
                </View>
                <View style={dashboardStyles.requestActions}>
                  <Pressable
                    onPress={() => decide(request.id, 'approve')}
                    disabled={decidingId === request.id}
                    style={({ pressed }) => [
                      dashboardStyles.requestAction,
                      dashboardStyles.requestActionApprove,
                      pressed && dashboardStyles.requestActionApprovePressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${request.renterName}'s request`}
                  >
                    <Ionicons
                      name="checkmark"
                      size={15}
                      color={LANDLORD_THEME.onPrimary}
                    />
                    <Text style={dashboardStyles.requestActionText}>
                      Approve
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => decide(request.id, 'decline')}
                    disabled={decidingId === request.id}
                    style={({ pressed }) => [
                      dashboardStyles.requestAction,
                      dashboardStyles.requestActionDecline,
                      pressed && dashboardStyles.requestActionDeclinePressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Decline ${request.renterName}'s request`}
                  >
                    <Ionicons
                      name="close"
                      size={15}
                      color={LANDLORD_THEME.primaryDark}
                    />
                    <Text
                      style={[
                        dashboardStyles.requestActionText,
                        dashboardStyles.requestActionTextDecline,
                      ]}
                    >
                      Decline
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={dashboardStyles.requestEmpty}>
              No pending requests. Renter applications will appear here for
              review and approval.
            </Text>
          )}

          {hasProperties ? (
            <>
              {/* My Properties */}
              <SectionHeader
                title="My Properties"
                actionLabel="View all"
                onAction={() => router.push(routes.landlordProperties)}
              />
              {properties.slice(0, 3).map((property) => (
                <Pressable
                  key={property.id}
                  onPress={() =>
                    router.push(landlordPropertyDetails(property.id))
                  }
                  style={({ pressed }) => [
                    styles.cardItem,
                    pressed && styles.cardItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${property.name}, ${property.totalRooms} rooms`}
                >
                  <View style={dashboardStyles.propertyRow}>
                    <View style={dashboardStyles.propertyThumb}>
                      {property.imageUri ? (
                        <Image
                          source={{ uri: property.imageUri }}
                          style={dashboardStyles.propertyThumbImage}
                          contentFit="cover"
                          accessibilityLabel={property.name}
                        />
                      ) : (
                        <Ionicons
                          name="business-outline"
                          size={22}
                          color={LANDLORD_THEME.primaryDark}
                        />
                      )}
                    </View>
                    <View style={dashboardStyles.propertyInfo}>
                      <Text style={dashboardStyles.propertyName}>
                        {property.name}
                      </Text>
                      <Text style={dashboardStyles.propertyLocation}>
                        {property.address}
                      </Text>
                      <Text style={dashboardStyles.propertyCounts}>
                        {property.occupiedRooms} occupied ·{' '}
                        <Text style={dashboardStyles.propertyCountsAccent}>
                          {property.availableRooms} available
                        </Text>
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={LANDLORD_THEME.textMuted}
                    />
                  </View>
                </Pressable>
              ))}

              {/* Recent Activity */}
              <SectionHeader title="Recent Activity" />
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => {
                  const meta = ACTIVITY_ICONS[activity.kind];
                  const target =
                    activity.kind === 'payment'
                      ? routes.landlordBills
                      : activity.kind === 'tenant'
                        ? routes.landlordLeases
                        : routes.landlordProperties;
                  return (
                    <Pressable
                      key={activity.id}
                      onPress={() => router.push(target)}
                      style={({ pressed }) => [
                        styles.cardItem,
                        pressed && styles.cardItemPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${activity.title}, ${activity.detail}`}
                    >
                      <View style={dashboardStyles.activityRow}>
                        <View
                          style={[
                            dashboardStyles.activityIcon,
                            meta.info && dashboardStyles.activityIconInfo,
                          ]}
                        >
                          <Ionicons
                            name={meta.icon}
                            size={16}
                            color={
                              meta.info
                                ? LANDLORD_THEME.badgeBlueText
                                : LANDLORD_THEME.primaryDark
                            }
                          />
                        </View>
                        <View style={dashboardStyles.activityBody}>
                          <Text style={dashboardStyles.activityTitle}>
                            {activity.title}
                          </Text>
                          <Text style={dashboardStyles.activityDetail}>
                            {activity.detail}
                          </Text>
                          <Text style={dashboardStyles.activityTime}>
                            {formatRelativeTime(activity.at)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={dashboardStyles.inlineEmpty}>
                  No activity yet. Payments, inquiries, and tenant changes will
                  show up here.
                </Text>
              )}

              {/* Upcoming Payments */}
              <SectionHeader
                title="Upcoming Payments"
                actionLabel="View all"
                onAction={() => router.push(routes.landlordBills)}
              />
              {upcoming.length > 0 ? (
                upcoming.map((bill) => (
                  <Pressable
                    key={bill.id}
                    onPress={() => router.push(landlordPaymentDetails(bill.id))}
                    style={({ pressed }) => [
                      styles.cardItem,
                      pressed && styles.cardItemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${bill.tenantName}, ${formatPeso(bill.amount)} due ${formatShortDate(bill.dueDate)}`}
                  >
                    <View style={dashboardStyles.paymentRow}>
                      <View style={dashboardStyles.paymentInfo}>
                        <Text style={dashboardStyles.paymentName}>
                          {bill.tenantName}
                        </Text>
                        <Text style={dashboardStyles.paymentMeta}>
                          {bill.propertyName} · {bill.roomLabel}
                        </Text>
                      </View>
                      <View style={dashboardStyles.paymentRight}>
                        <Text style={dashboardStyles.paymentAmount}>
                          {formatPeso(bill.amount)}
                        </Text>
                        {dueChip(bill)}
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={dashboardStyles.inlineEmpty}>
                  {summary.unpaidCount === 0
                    ? 'Nothing due right now. All recorded rent is paid.'
                    : 'No upcoming due dates — every unpaid balance is already overdue.'}
                </Text>
              )}

              {/* Outstanding Balances */}
              <SectionHeader title="Outstanding Balances" />
              <View style={styles.cardItem}>
                <View style={dashboardStyles.balanceHeader}>
                  <View style={dashboardStyles.paymentInfo}>
                    <Text style={dashboardStyles.balanceAmount}>
                      {!summary.hasBillingRecords
                        ? '—'
                        : summary.overdueCount > 0
                          ? formatPeso(summary.overdueAmount)
                          : formatPeso(summary.outstandingAmount)}
                    </Text>
                    <Text style={dashboardStyles.balanceMeta}>
                      {!summary.hasBillingRecords
                        ? 'No billing records yet'
                        : summary.overdueCount > 0
                          ? `${summary.overdueCount} overdue ${summary.overdueCount === 1 ? 'balance' : 'balances'}`
                          : summary.unpaidCount > 0
                            ? `${summary.unpaidCount} unpaid ${summary.unpaidCount === 1 ? 'bill' : 'bills'}`
                            : 'Nothing outstanding — all bills are paid'}
                    </Text>
                  </View>
                  <View
                    style={[
                      dashboardStyles.dueChip,
                      summary.overdueCount > 0 && dashboardStyles.overdueChip,
                    ]}
                  >
                    <Text
                      style={[
                        dashboardStyles.dueChipText,
                        summary.overdueCount > 0 &&
                        dashboardStyles.overdueChipText,
                      ]}
                    >
                      {summary.overdueCount > 0
                        ? 'Action needed'
                        : 'All current'}
                    </Text>
                  </View>
                </View>

                {overdue.length > 0 ? (
                  overdue.map((bill) => (
                    <Pressable
                      key={bill.id}
                      onPress={() => router.push(landlordPaymentDetails(bill.id))}
                      style={({ pressed }) => [
                        pressed && { opacity: 0.7 },
                        { marginTop: 12 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${bill.tenantName} overdue ${formatPeso(bill.amount)}`}
                    >
                      <View style={dashboardStyles.paymentRow}>
                        <View style={dashboardStyles.paymentInfo}>
                          <Text style={dashboardStyles.paymentName}>
                            {bill.tenantName}
                          </Text>
                          <Text style={dashboardStyles.paymentMeta}>
                            {bill.propertyName} · {bill.roomLabel}
                          </Text>
                        </View>
                        <View style={dashboardStyles.paymentRight}>
                          <Text style={dashboardStyles.paymentAmount}>
                            {formatPeso(bill.amount)}
                          </Text>
                          {dueChip(bill)}
                        </View>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={dashboardStyles.balanceMeta}>
                    {summary.unpaidCount > 0
                      ? `Nothing overdue yet — ${formatPeso(summary.outstandingAmount)} is scheduled for upcoming due dates.`
                      : 'No unpaid balances. Every recorded bill has been settled.'}
                  </Text>
                )}

                <View style={dashboardStyles.balanceFooter}>
                  <Text style={dashboardStyles.balanceMeta}>
                    {summary.paidCount} paid · {summary.unpaidCount} unpaid
                  </Text>
                  <Pressable
                    onPress={() => router.push(routes.landlordBills)}
                    style={({ pressed }) => [
                      dashboardStyles.viewDetailsButton,
                      pressed && dashboardStyles.viewDetailsButtonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="View outstanding balance details"
                  >
                    <Text style={dashboardStyles.viewDetailsButtonText}>
                      View details
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={13}
                      color={LANDLORD_THEME.primaryDark}
                    />
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            /* Empty state: no properties yet */
            <View style={dashboardStyles.emptyCard}>
              <View style={dashboardStyles.emptyIcon}>
                <Ionicons
                  name="business-outline"
                  size={26}
                  color={LANDLORD_THEME.primaryDark}
                />
              </View>
              <Text style={dashboardStyles.emptyTitle}>
                No properties yet
              </Text>
              <Text style={dashboardStyles.emptyBody}>
                Add your first property to start tracking rooms, tenants, rent,
                and occupancy. Everything on this dashboard is built from your
                records.
              </Text>
              <Pressable
                onPress={() => router.push(routes.landlordListSpace)}
                style={({ pressed }) => [
                  dashboardStyles.emptyButton,
                  pressed && dashboardStyles.emptyButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add your first property"
              >
                <Ionicons name="add" size={18} color={LANDLORD_THEME.onPrimary} />
                <Text style={dashboardStyles.emptyButtonText}>
                  Add your first property
                </Text>
              </Pressable>
            </View>
          )}

          {/* Quick Actions */}
          <SectionHeader title="Quick Actions" />
          <View style={dashboardStyles.quickGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={action.onPress}
                style={({ pressed }) => [
                  dashboardStyles.quickAction,
                  pressed && dashboardStyles.quickActionPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={dashboardStyles.quickActionIcon}>
                  <Ionicons
                    name={action.icon}
                    size={17}
                    color={LANDLORD_THEME.onPrimary}
                  />
                </View>
                <Text style={dashboardStyles.quickActionLabel}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="overview" />
    </View>
  );
}
