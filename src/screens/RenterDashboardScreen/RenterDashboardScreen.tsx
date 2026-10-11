import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '@/components/common/BrandHeader/BrandHeader';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { ProfileAvatar } from '@/components/common/ProfileAvatar/ProfileAvatar';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { MaintenanceCard } from '@/components/renter/dashboard/MaintenanceCard/MaintenanceCard';
import { PaymentOverviewCard } from '@/components/renter/dashboard/PaymentOverviewCard/PaymentOverviewCard';
import { PropertyCard } from '@/components/renter/dashboard/PropertyCard/PropertyCard';
import { ReminderCard } from '@/components/renter/dashboard/ReminderCard/ReminderCard';
import { renterPaymentOverview, renterReminders, renterTenancy } from '@/data/mock';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { useMaintenanceTickets } from '@/services/maintenance';
import { formatLongDate } from '@/utils/date';
import { styles } from './RenterDashboardScreen.styles';

export default function RenterDashboardScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const tickets = useMaintenanceTickets();

  if (!session) return null;

  const firstName = session.user.fullName.split(' ')[0] || session.user.username;
  const latestTicket = tickets[0];
  const upcoming = renterReminders.slice(0, 2);

  return (
    <RenterScreen active="home">
      <BrandHeader
        subtitle="BOARDING HOUSE RENTAL"
        trailing={
          <ProfileAvatar
            name={session.user.fullName}
            onPress={() => router.push(routes.renterProfile)}
            accessibilityLabel="Open your profile"
          />
        }
      />

      <Text style={styles.eyebrow}>Renter dashboard</Text>
      <Text style={styles.date}>{formatLongDate(new Date())}</Text>
      <Text style={styles.welcome}>Mabuhay ka, {firstName}!</Text>
      <Text style={styles.welcomeSub}>
        Here&apos;s a snapshot of your home, payments, and what&apos;s coming up.
      </Text>

      <View style={styles.section}>
        <SectionHeader title="Your Home" />
        <PropertyCard
          tenancy={renterTenancy}
          onViewTenancy={() => router.push(routes.renterTenancy)}
        />
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
