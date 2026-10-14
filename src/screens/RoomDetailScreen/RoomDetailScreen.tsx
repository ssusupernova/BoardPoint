import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import {
  useIsVerifiedRenter,
  useLandlordData,
  useRoomRequestState,
  submitRentalRequest,
} from '@/services/landlordData';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { toErrorMessage } from '@/utils/errors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './RoomDetailScreen.styles';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthSession();
  const renterId = session?.user.id ?? null;

  const favoriteIds = useFavoriteRoomIds();
  const { properties } = useLandlordData();

  const room = renterMockRooms.find((item) => item.id === id);

  const requestState = useRoomRequestState(renterId, id ?? '');
  const isVerified = useIsVerifiedRenter(renterId, room?.propertyId);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!room) {
    return (
      <ScreenContainer>
        <PageHeader title="Room details" onBack={() => router.back()} />
        <Text style={styles.missing}>
          This room is no longer available.
        </Text>
      </ScreenContainer>
    );
  }

  const isFavorite = favoriteIds.includes(room.id);

  const details = [
    room.roomLabel,
    room.privacy,
    room.occupancy,
  ]
    .filter(Boolean)
    .join(' · ');

  const distance =
    room.distanceFromLabel != null
      ? `${room.distanceKm} km from ${room.distanceFromLabel}`
      : `${room.distanceKm} km away`;

  const property = properties.find(
    (item) => item.id === room.propertyId,
  );

  const landlordRoom = property?.rooms.find(
    (item) => item.id === room.landlordRoomId,
  );

  const stillAvailable = landlordRoom?.status === 'Available';

  /**
   * Why the request button is currently closed, in plain words. This keeps the
   * disabled state from feeling broken — the button greys out only for reasons
   * we can name to the renter. Pending/approved requests render their own
   * status card instead of this button, so they aren't named here.
   */
  const requestClosedReason = !renterId
    ? 'Sign in with a renter account to send a rental request.'
    : !stillAvailable
      ? property == null || landlordRoom == null
        ? 'This room is no longer listed with its landlord, so requests are closed.'
        : 'This room is marked as taken in the landlord’s records, so requests are closed.'
      : null;

  const requestDisabled =
    submitting ||
    !renterId ||
    !stillAvailable ||
    requestState === 'pending' ||
    requestState === 'approved';

  const handleRequest = async () => {
    if (submitting || requestDisabled || !renterId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitRentalRequest({
        renterId,
        renterName: session?.user.fullName ?? session?.user.username ?? 'A renter',
        roomRefId: room.id,
      });
    } catch (error) {
      setSubmitError(toErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Room details"
        onBack={() => router.back()}
      />

      <View style={styles.media}>
        {room.imageUri ? (
          <Image
            source={{ uri: room.imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="bed-outline"
              size={46}
              color={colors.primary}
            />
          </View>
        )}

        {room.availabilityLabel ? (
          <View style={styles.availability}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={colors.primary}
            />
            <Text style={styles.availabilityText}>
              {room.availabilityLabel}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void toggleFavoriteRoom(room.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          accessibilityLabel={
            isFavorite ? 'Remove from saved rooms' : 'Save this room'
          }
          style={({ pressed }) => [
            styles.favorite,
            pressed && styles.favoritePressed,
          ]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.head}>
        <Text style={styles.title}>{room.title}</Text>

        {details ? (
          <Text style={styles.details}>{details}</Text>
        ) : null}

        {room.propertyName ? (
          <Text style={styles.property}>{room.propertyName}</Text>
        ) : null}

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.location}>{room.area}</Text>
        </View>
      </View>

      <View style={styles.rentRow}>
        <Text style={styles.rent}>{formatPeso(room.price)}</Text>
        <Text style={styles.perMonth}>/month</Text>
      </View>

      {isVerified ? (
        <View style={styles.badges}>
          <StatusBadge text="Verified renter" variant="success" />
        </View>
      ) : null}

      {room.featureBadges?.length ? (
        <View style={styles.badges}>
          {room.featureBadges.map((badge) => (
            <StatusBadge
              key={badge}
              text={badge}
              variant="neutral"
            />
          ))}
        </View>
      ) : null}

      {room.amenities?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's included</Text>

          {room.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.metaRow}>
          <Ionicons
            name="navigate-outline"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText}>{distance}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="sparkles-outline"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText}>
            {room.matchPercent}% match with your checklist
          </Text>
        </View>
      </View>

      <View style={styles.action}>
        {submitError ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.error}
            />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        {requestState === 'approved' ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Approved" variant="success" dot />

            <Text style={styles.statusText}>
              Your rental request has been approved. Check your applications
              for the latest details.
            </Text>

            <PrimaryButton
              label="View my requests"
              icon="list-outline"
              onPress={() => router.push(routes.renterApplications)}
            />
          </View>
        ) : requestState === 'pending' ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Pending" variant="info" dot />

            <Text style={styles.statusText}>
              Your request is awaiting the landlord's review.
            </Text>

            <PrimaryButton
              label="View my requests"
              icon="list-outline"
              onPress={() => router.push(routes.renterApplications)}
            />
          </View>
        ) : requestState === 'declined' ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Declined" />

            <Text style={styles.statusText}>
              Your previous request was not approved. You can try again if
              the room is still available.
            </Text>

            <PrimaryButton
              label="Request again"
              icon="refresh-outline"
              onPress={() => void handleRequest()}
              loading={submitting}
              disabled={!stillAvailable || !renterId || submitting}
            />
          </View>
        ) : (
          <>
            {requestClosedReason ? (
              <View style={styles.closedReason}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.closedReasonText}>{requestClosedReason}</Text>
              </View>
            ) : null}

            <PrimaryButton
              label="Send rental request"
              icon="paper-plane-outline"
              onPress={() => void handleRequest()}
              loading={submitting}
              disabled={requestDisabled}
              accessibilityLabel={`Send a rental request for ${room.title}`}
            />
          </>
        )}

        <View style={styles.secondaryAction}>
          <PrimaryButton
            label={isFavorite ? 'Saved to favorites' : 'Save this room'}
            icon="heart-outline"
            onPress={() => void toggleFavoriteRoom(room.id)}
          />
        </View>
      </View>

      <Text style={styles.note}>
        {!stillAvailable
          ? 'This room may no longer be available. Browse similar rooms in Recommended Rooms.'
          : requestState === 'pending'
            ? 'The landlord will review your request. You can check its status in your applications.'
            : requestState === 'approved'
              ? 'Your rental request has been approved. Check your applications for more information.'
              : 'Sending a request lets the landlord review your rental application. Approval may unlock your Verified Renter badge.'}
      </Text>
    </ScreenContainer>
  );
}