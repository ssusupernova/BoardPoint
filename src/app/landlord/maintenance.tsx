import { LandlordBottomBar } from '@/components/landlord/LandlordBottomBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANDLORD_THEME, maintenanceStyles, styles } from '../../styles/landlord';

interface Ticket {
  id: string;
  unit: string;
  status: 'Urgent' | 'Scheduled' | 'In Progress';
  description: string;
  reported: string;
  tenantName: string;
  contractor?: string;
}

const ALL_TICKETS: Ticket[] = [
  {
    id: 't-1',
    unit: 'Casa Dela Cruz · Room 3',
    status: 'Urgent',
    description: 'Leaking faucet in private bathroom',
    reported: 'Reported 2h ago',
    tenantName: 'Juan Dela Cruz',
    contractor: 'Plumber on call',
  },
  {
    id: 't-2',
    unit: 'North Haven Boarding House · Room 2',
    status: 'Urgent',
    description: 'Power outlet sparking when plugged in',
    reported: 'Reported 3h ago',
    tenantName: 'Alex Reyes',
    contractor: 'Emergency Electrician requested',
  },
  {
    id: 't-3',
    unit: 'City Garden Rooms · Common area',
    status: 'Scheduled',
    description: 'Deep clean laundry area and kitchen',
    reported: 'Due tomorrow, 9:00 AM',
    tenantName: 'Common Space',
    contractor: 'Dapitan Cleaners Co.',
  },
  {
    id: 't-4',
    unit: 'Casa Dela Cruz · Room 1',
    status: 'Scheduled',
    description: 'Window lock handle replacement',
    reported: 'Scheduled for 14 Oct',
    tenantName: 'Carlo Mendoza',
    contractor: 'Handyman Dave',
  },
  {
    id: 't-5',
    unit: 'City Garden Rooms · Room 2',
    status: 'In Progress',
    description: 'Clogged shower drain snaking',
    reported: 'Work started at 2:00 PM',
    tenantName: 'Marco Diaz',
    contractor: 'Express Plumbing',
  },
  {
    id: 't-6',
    unit: 'North Haven Boarding House · Hallway',
    status: 'In Progress',
    description: 'Flickering corridor LED fixture replacement',
    reported: 'Assigned today',
    tenantName: 'Building Common',
    contractor: 'Electrician on route',
  },
];

type FilterType = 'All' | 'Urgent' | 'Scheduled' | 'In Progress';

export default function LandlordMaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const filteredTickets = ALL_TICKETS.filter((t) => {
    if (resolvedIds.includes(t.id)) return false;
    if (activeFilter === 'All') return true;
    return t.status === activeFilter;
  });

  const handleResolve = (ticket: Ticket) => {
    Alert.alert(
      'Resolve Ticket',
      `Mark "${ticket.description}" for ${ticket.unit} as resolved?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Resolved',
          onPress: () => {
            setResolvedIds((prev) => [...prev, ticket.id]);
          },
        },
      ]
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
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="construct" size={22} color={LANDLORD_THEME.onPrimary} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.brandTitle}>Maintenance</Text>
              <Text style={styles.brandSubtitle}>FACILITY REQUESTS & REPAIRS</Text>
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>
              {6 - resolvedIds.length} Open Requests
            </Text>
            <Text style={styles.greetingSubtitle}>
              2 urgent tickets require immediate attention to prevent tenant disruption.
            </Text>
            <View style={maintenanceStyles.statsRow}>
              <View style={styles.pillPeach}>
                <Text style={styles.pillPeachText}>2 Urgent</Text>
              </View>
              <View style={styles.pillBlue}>
                <Text style={styles.pillBlueText}>2 Scheduled</Text>
              </View>
              <View style={maintenanceStyles.pillNeutral}>
                <Text style={maintenanceStyles.pillNeutralText}>2 In Progress</Text>
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={maintenanceStyles.filtersRow}>
            {(['All', 'Urgent', 'Scheduled', 'In Progress'] as FilterType[]).map((f) => {
              const isSelected = activeFilter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[
                    maintenanceStyles.filterChip,
                    !isSelected && maintenanceStyles.filterChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      maintenanceStyles.filterChipText,
                      !isSelected && maintenanceStyles.filterChipTextInactive,
                    ]}
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Tickets List */}
          <View style={maintenanceStyles.listContainer}>
            {filteredTickets.map((ticket) => (
              <View key={ticket.id} style={styles.cardItem}>
                <View style={styles.cardItemTopRow}>
                  <Text style={styles.itemTitle}>{ticket.unit}</Text>
                  <View
                    style={
                      ticket.status === 'Urgent'
                        ? styles.itemBadgeUrgent
                        : ticket.status === 'Scheduled'
                          ? styles.itemBadgeBlue
                          : styles.itemBadgePeach
                    }
                  >
                    <Text
                      style={
                        ticket.status === 'Urgent'
                          ? styles.itemBadgeUrgentText
                          : ticket.status === 'Scheduled'
                            ? styles.itemBadgeBlueText
                            : styles.itemBadgePeachText
                      }
                    >
                      {ticket.status}
                    </Text>
                  </View>
                </View>
                <Text style={maintenanceStyles.issueDescription}>
                  {ticket.description}
                </Text>
                <Text style={styles.itemSubtext}>
                  Tenant: {ticket.tenantName} · {ticket.contractor}
                </Text>

                <View style={maintenanceStyles.ticketFooter}>
                  <Text style={styles.itemTimestamp}>{ticket.reported}</Text>
                  <Pressable
                    onPress={() => handleResolve(ticket)}
                    style={({ pressed }) => [
                      maintenanceStyles.actionButton,
                      pressed && maintenanceStyles.actionButtonPressed,
                    ]}
                  >
                    <Text style={maintenanceStyles.actionButtonText}>Mark Done</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <LandlordBottomBar active="maintenance" />
    </View>
  );
}
