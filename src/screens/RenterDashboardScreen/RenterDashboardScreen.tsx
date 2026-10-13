import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { FindRoomDashboard } from '@/components/renter/dashboard/FindRoomDashboard/FindRoomDashboard';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { MaintenanceCard } from '@/components/renter/dashboard/MaintenanceCard/MaintenanceCard';
import { PaymentOverviewCard } from '@/components/renter/dashboard/PaymentOverviewCard/PaymentOverviewCard';
import { PropertyCard } from '@/components/renter/dashboard/PropertyCard/PropertyCard';
import { ReminderCard } from '@/components/renter/dashboard/ReminderCard/ReminderCard';
import { renterPaymentOverview, renterReminders } from '@/data/mock';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { useMaintenanceTickets } from '@/services/maintenance';
import { activeTenancy, isVerifiedRenter, useRentalRequestsState } from '@/services/rentalRequests';
import { colors } from '@/theme';
import { formatLongDate } from '@/utils/date';
import { styles } from './RenterDashboardScreen.styles';

export default function RenterDashboardScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const tickets = useMaintenanceTickets();
  const { requests, ready } = useRentalRequestsState();

  if (!session) return null;

  const firstName = session.user.fullName.split(' ')[0] || session.user.username;
  const today = formatLongDate(new Date());

  // Wait for the request store to bind to this account before choosing which
  // dashboard to show, so we never flash the wrong state.
  if (!ready) {
    return (
      <RenterScreen active="home">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </RenterScreen>
    );
  }

  const hasRoom = isVerifiedRenter(requests);
  const tenancy = activeTenancy(requests);

  if (!hasRoom || !tenancy) {
    return (
      <RenterScreen active="home">
        <Text style={styles.eyebrow}>Renter dashboard</Text>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.welcome}>Mabuhay ka, {firstName}!</Text>
        <Text style={styles.welcomeSub}>
          You don&apos;t have a room yet — let&apos;s find one that fits you.
        </Text>
        <FindRoomDashboard userId={session.user.id} />
      </RenterScreen>
    );
  }

  const latestTicket = tickets[0];
  const upcoming = renterReminders.slice(0, 2);

  return (
    <RenterScreen active="home">
      <Text style={styles.eyebrow}>Renter dashboard</Text>
      <Text style={styles.date}>{today}</Text>
      <Text style={styles.welcome}>Mabuhay ka, {firstName}!</Text>
      <Text style={styles.welcomeSub}>
        Here&apos;s a snapshot of your home, payments, and what&apos;s coming up.
      </Text>

      <View style={styles.section}>
        <SectionHeader title="Your Home" />
        <PropertyCard
          tenancy={tenancy}
          onViewTenancy={() => router.push(routes.renterTenancy)}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Find your next home" />
        <View style={styles.list}>
          <OutlineButton
            label="Recommended rooms for you"
            icon="sparkles"
            onPress={() => router.push(routes.renterRecommended)}
          />
          <OutlineButton
            label="Explore all rooms"
            icon="grid-outline"
            onPress={() => router.push(routes.renterRooms)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Payment Overview" />
        <PaymentOverviewCard
          overview={renterPaymentOverview}
          onViewBills={() => router.push(routes.renterBills)}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Coming Up"
          actionLabel="All updates"
          onAction={() => router.push(routes.renterAlerts)}
        />
        <View style={styles.list}>
          {upcoming.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Maintenance" />
        {latestTicket ? (
          <MaintenanceCard
            ticket={latestTicket}
            onPress={() => router.push(routes.renterMaintenance)}
          />
        ) : null}
        <View style={styles.maintenanceAction}>
          <OutlineButton
            label="Report a maintenance issue"
            icon="create-outline"
            onPress={() => router.push(routes.renterReportIssue)}
          />
        </View>
      </View>
    </RenterScreen>
  );
}
