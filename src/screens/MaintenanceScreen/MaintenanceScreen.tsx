import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { MaintenanceCard } from '@/components/renter/dashboard/MaintenanceCard/MaintenanceCard';
import { routes } from '@/routes';
import { useMaintenanceTickets } from '@/services/maintenance';
import { styles } from './MaintenanceScreen.styles';

export default function MaintenanceScreen() {
  const router = useRouter();
  const tickets = useMaintenanceTickets();

  return (
    <ScreenContainer>
      <PageHeader
        title="Maintenance"
        subtitle="Your reported issues"
        onBack={() => router.back()}
      />

      <View style={styles.list}>
        {tickets.map((ticket) => (
          <MaintenanceCard key={ticket.id} ticket={ticket} />
        ))}
      </View>

      <View style={styles.action}>
        <OutlineButton
          label="Report a maintenance issue"
          icon="create-outline"
          onPress={() => router.push(routes.renterReportIssue)}
        />
      </View>
    </ScreenContainer>
  );
}
