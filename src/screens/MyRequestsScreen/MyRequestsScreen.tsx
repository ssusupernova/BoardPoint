import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { RequestCard } from '@/components/renter/rooms/RequestCard/RequestCard';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { routes } from '@/routes';
import {
  activeRequests,
  cancelRentalRequest,
  isVerifiedRenter,
  useRentalRequestsState,
} from '@/services/rentalRequests';
import { colors } from '@/theme';
import { styles } from './MyRequestsScreen.styles';

/**
 * The renter's rental requests and confirmed registrations. An empty list means
 * they still need to find a room, so it funnels them to Recommended Rooms.
 */
export default function MyRequestsScreen() {
  const router = useRouter();
  const { requests, ready } = useRentalRequestsState();

  const list = activeRequests(requests);
  const verified = isVerifiedRenter(requests);

  return (
    <ScreenContainer>
      <PageHeader
        title="My requests"
        subtitle="Rooms you've asked to reserve"
        onBack={() => router.back()}
      />

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading your requests…</Text>
        </View>
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptyText}>
            Browse rooms matched to your preferences and send your first request.
          </Text>
          <View style={styles.emptyAction}>
            <OutlineButton
              label="See recommended rooms"
              icon="sparkles-outline"
              onPress={() => router.push(routes.renterRecommended)}
            />
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.summary}>
            {list.length} {list.length === 1 ? 'request' : 'requests'}
          </Text>

          {verified ? (
            <View style={styles.banner}>
              <Ionicons name="shield-checkmark" size={18} color={colors.successText} />
              <Text style={styles.bannerText}>
                You&apos;re a verified renter — one registration is confirmed.
              </Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {list.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onOpenRoom={() => router.push(routes.renterRoom(request.roomId))}
                onCancel={() => void cancelRentalRequest(request.id)}
              />
            ))}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
