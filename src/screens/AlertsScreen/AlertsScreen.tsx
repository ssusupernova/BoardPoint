import { View } from 'react-native';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { RenterScreen } from '@/components/navigation/RenterScreen/RenterScreen';
import { ReminderCard } from '@/components/renter/dashboard/ReminderCard/ReminderCard';
import { renterReminders, type Reminder } from '@/data/mock';
import { useMaintenanceTickets } from '@/services/maintenance';
import { styles } from './AlertsScreen.styles';

export default function AlertsScreen() {
  const tickets = useMaintenanceTickets();

  const ticketAlerts: Reminder[] = tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    detail: ticket.detail,
    date: ticket.updatedAt,
    status: ticket.status,
  }));

  const alerts = [...renterReminders, ...ticketAlerts];

  return (
    <RenterScreen active="alerts">
      <PageHeader title="Alerts" subtitle="Payments, visits, and updates" />

      <View style={styles.list}>
        {alerts.map((alert) => (
          <ReminderCard key={alert.id} reminder={alert} />
        ))}
      </View>
    </RenterScreen>
  );
}
