import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { StatusBadge } from '@/components/renter/StatusBadge/StatusBadge';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import {
  submitRentalRequest,
  useIsVerifiedRenter,
  useLandlordData,
  useRoomRequestState,
} from '@/services/landlordData';
import { colors } from '@/theme';
import { formatPeso } from '@/utils/currency';
import { styles } from './RoomDetailScreen.styles';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthSession();
  const renterId = session?.user.id ?? null;
  const renterName = session?.user.fullName || session?.user.username || 'Renter';

  const favoriteIds = useFavoriteRoomIds();
  const { properties } = useLandlordData();
  const room = renterMockRooms.find((item) => item.id === id);

  const requestState = useRoomRequestState(renterId, id ?? '');
  const isVerified = useIsVerifiedRenter(renterId, room?.propertyId);

  const [requesting, setRequesting] = useState(false);

  if (!room) {
    return (
      <ScreenContainer>
        <PageHeader title="Room details" onBack={() => router.back()} />
        <Text style={styles.missing}>This room is no longer available.</Text>
      </ScreenContainer>
    );
  }

  const isFavorite = favoriteIds.includes(room.id);
  const details = [room.roomLabel, room.privacy, room.occupancy].filter(Boolean).join(' · ');
  const distance =
    room.distanceFromLabel != null
      ? `${room.distanceKm} km from ${room.distanceFromLabel}`
      : `${room.distanceKm} km away`;

  const property = properties.find((item) => item.id === room.propertyId);
  const landlordRoom = property?.rooms.find((item) => item.id === room.landlordRoomId);
  const stillAvailable = landlordRoom?.status === 'Available';

  const requestLabel = (() => {
    if (requestState === 'pending') return 'Request sent';
    if (requestState === 'approved') return 'Approved · You are in';
    if (requestState === 'declined') return 'Request this room';
    return 'Request this room';
  })();

  const handleRequest = async () => {
    if (!renterId) {
      router.replace(routes.signIn);
      return;
    }
    setRequesting(true);
    try {
      await submitRentalRequest({
        roomId: room.id,
        roomTitle: room.title,
        propertyName: room.propertyName,
        address: room.area,
        monthlyRent: room.price,
      });
      router.push(routes.renterApplications);
      await submitRentalRequest({ renterId, renterName, roomRefId: room.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong sending your request.';
      Alert.alert('Could not send request', message);
    } finally {
      setRequesting(false);
    }
  };

  const requestDisabled =
    requestState === 'pending' || requestState === 'approved' || !stillAvailable || requesting;

  return (
    <ScreenContainer>
      <PageHeader title="Room details" onBack={() => router.back()} />

      <View style={styles.media}>
        {room.imageUri ? (
          <Image source={{ uri: room.imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="bed-outline" size={46} color={colors.primary} />
          </View>
        )}

        {room.availabilityLabel ? (
          <View style={styles.availability}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={styles.availabilityText}>{room.availabilityLabel}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void toggleFavoriteRoom(room.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          accessibilityLabel={isFavorite ? 'Remove from saved rooms' : 'Save this room'}
          style={({ pressed }) => [styles.favorite, pressed && styles.favoritePressed]}
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
        {details ? <Text style={styles.details}>{details}</Text> : null}
        {room.propertyName ? <Text style={styles.property}>{room.propertyName}</Text> : null}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
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
            <StatusBadge key={badge} text={badge} variant="neutral" />
          ))}
        </View>
      ) : null}

      {room.amenities?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What&apos;s included</Text>
          {room.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.metaRow}>
          <Ionicons name="navigate-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{distance}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="sparkles-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{room.matchPercent}% match with your checklist</Text>
        </View>
      </View>

      <View style={styles.action}>
        {requestState === 'confirmed' ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Confirmed" variant="success" dot />
            <Text style={styles.statusText}>
              You&apos;re an active renter — this room is confirmed for you.
            </Text>
            <OutlineButton
              label="View my requests"
              icon="list-outline"
              onPress={() => router.push(routes.renterApplications)}
            />
          </View>
        ) : requestState === 'pending' && request ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Pending" variant="info" dot />
            <Text style={styles.statusText}>
              Request sent {formatDisplayDate(request.submittedAt)}. Waiting for the landlord to
              confirm.
            </Text>
            <OutlineButton
              label="View my requests"
              icon="list-outline"
              onPress={() => router.push(routes.renterApplications)}
            />
            <OutlineButton
              label="Cancel request"
              icon="close-outline"
              onPress={() => void cancelRentalRequest(request.id)}
            />
          </View>
        ) : requestState === 'declined' ? (
          <View style={styles.statusCard}>
            <StatusBadge text="Declined" />
            <Text style={styles.statusText}>
              This request wasn&apos;t approved. You can send a new request.
            </Text>
            <PrimaryButton
              label="Request again"
              icon="refresh-outline"
              onPress={() => void handleRequest()}
              loading={submitting}
            />
          </View>
        ) : (
          <PrimaryButton
            label="Send rental request"
            icon="paper-plane-outline"
            onPress={() => void handleRequest()}
            loading={submitting}
            accessibilityLabel={`Send a rental request for ${room.title}`}
          />
        )}

        <View style={styles.secondaryAction}>
          <OutlineButton
            label={isFavorite ? 'Saved to favorites' : 'Save this room'}
            icon="heart-outline"
            onPress={() => void toggleFavoriteRoom(room.id)}
            accessibilityLabel={isFavorite ? 'Remove from saved rooms' : 'Save this room'}
          />
        </View>
        <PrimaryButton label={requestLabel} onPress={() => void handleRequest()} loading={requesting} disabled={requestDisabled} />
      </View>

      <Text style={styles.note}>
        {!stillAvailable
          ? 'This room was just taken. Browse similar rooms in Recommended Rooms.'
          : requestState === 'pending'
            ? 'The landlord will review your request. You will be marked as a verified renter here once it is approved.'
            : requestState === 'approved'
              ? 'Welcome aboard! Your landlord has confirmed your registration.'
              : 'Sending a request lets the landlord review your registration. Approval unlocks your Verified Renter badge at this property.'}
      </Text>
    </ScreenContainer>
  );
}