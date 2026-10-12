<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { RecommendationSection } from '@/components/renter/rooms/RecommendationSection/RecommendationSection';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/renter';
import { useAuthSession } from '@/services/auth';
import { loadChecklist, type RenterChecklist } from '@/services/checklist';
import { groupByCategory, rankRooms } from '@/services/recommendations';
import { routes } from '@/routes';
import { styles } from './RecommendedRoomsScreen.styles';

export default function RecommendedRoomsScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const userId = session?.user.id ?? null;

  const [checklist, setChecklist] = useState<RenterChecklist | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void loadChecklist(userId).then((saved) => {
      if (cancelled) return;
      setChecklist(saved);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loading = userId ? !loaded : false;

  const roomsById = useCallback(
    (id: string) => renterMockRooms.find((room) => room.id === id),
    []
  );

  const ranked = useMemo(() => rankRooms(renterMockRooms, checklist), [checklist]);
  const hasChecklist = checklist != null && ranked.recommended.length > 0;
  const groups = useMemo(
    () => groupByCategory(checklist ? ranked.recommended : ranked.others),
    [ranked, checklist]
  );

  if (loading) {
    return (
      <ScreenContainer>
        <Text style={styles.loading}>Loading recommendations…</Text>
      </ScreenContainer>
    );
  }

  if (!checklist) {
    return (
      <ScreenContainer>
        <PageHeader title="Recommended Rooms" subtitle="Personalized picks for you" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No preferences yet</Text>
          <Text style={styles.emptyBody}>
            Set your room preferences first — budget, area, amenities, and house rules — so we can
            rank the rooms that truly fit you.
          </Text>
          <View style={styles.emptyAction}>
            <PrimaryButton
      label="Set my preferences"
      onPress={() => router.push(routes.preferences)}
    />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader title="Recommended Rooms" subtitle="Personalized picks for you" onBack={() => router.back()} />

      <Text style={styles.lede}>
        {hasChecklist
          ? `Top matches for a ${checklist.roomType === 'private' ? 'private' : 'shared'} room within ${checklist.radiusKm} km of ${checklist.originLabel}.`
          : 'No rooms matched every requirement — here are the closest options from your preferences.'}
      </Text>

      {groups.map((group) => (
        <RecommendationSection
          key={group.category}
          category={group.category}
          roomIds={group.rooms.map((item) => item.room.id)}
          roomsById={roomsById}
        />
      ))}

      {!hasChecklist ? (
        <View style={styles.emptyAction}>
          <PrimaryButton
          label="Adjust my preferences"
          onPress={() => router.push(routes.preferences)}
        />
        </View>
      ) : null}

      <View style={styles.footer} />
    </ScreenContainer>
  );
}
=======
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PageHeader } from '@/components/common/PageHeader/PageHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import { RecommendationSection } from '@/components/renter/rooms/RecommendationSection/RecommendationSection';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import {
  createDefaultForm,
  loadChecklist,
  toChecklist,
  type RenterChecklist,
} from '@/services/checklist';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { averageMatch, groupByCategory, recommendRooms } from '@/services/recommendations';
import { colors } from '@/theme';
import { styles } from './RecommendedRoomsScreen.styles';

/**
 * Recommended Rooms: the marketplace ranked against the renter's saved
 * preferences, split into category carousels. Falls back to sensible defaults
 * (and nudges the renter to set preferences) when nothing is saved yet.
 */
export default function RecommendedRoomsScreen() {
  const router = useRouter();
  const { session } = useAuthSession();
  const favoriteIds = useFavoriteRoomIds();

  const [checklist, setChecklist] = useState<RenterChecklist | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    let active = true;
    void loadChecklist(userId).then((saved) => {
      if (!active) return;
      setHasSaved(saved !== null);
      setChecklist(saved ?? toChecklist(createDefaultForm()));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const ranked = useMemo(
    () => (checklist ? recommendRooms(renterMockRooms, checklist) : []),
    [checklist]
  );
  const groups = useMemo(() => groupByCategory(ranked), [ranked]);

  const openRoom = (roomId: string) => router.push(routes.renterRoom(roomId));

  return (
    <ScreenContainer>
      <PageHeader
        title="Recommended rooms"
        subtitle="Ranked against your search preferences"
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Finding your best matches…</Text>
        </View>
      ) : ranked.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>
            Widen your budget, radius or must-haves and we&apos;ll surface rooms that fit.
          </Text>
          <View style={styles.emptyAction}>
            <OutlineButton
              label="Adjust preferences"
              icon="options-outline"
              onPress={() => router.push(routes.preferences)}
            />
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.summary}>
            {ranked.length} matches · {averageMatch(ranked)}% average match
          </Text>

          {!hasSaved ? (
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <Ionicons name="sparkles-outline" size={19} color={colors.primary} />
              </View>
              <View style={styles.bannerCopy}>
                <Text style={styles.bannerTitle}>Personalize these results</Text>
                <Text style={styles.bannerText}>
                  Set your budget, area and must-haves for sharper matches.
                </Text>
              </View>
            </View>
          ) : null}

          {groups.map((group) => (
            <RecommendationSection
              key={group.category}
              title={group.category}
              subtitle={`${group.rooms.length} ${
                group.rooms.length === 1 ? 'room' : 'rooms'
              } match`}
              rooms={group.rooms}
              favoriteIds={favoriteIds}
              onToggleFavorite={(roomId) => void toggleFavoriteRoom(roomId)}
              onOpenRoom={(room) => openRoom(room.id)}
              onSeeAll={() => router.push(routes.renterRoomsByCategory(group.category))}
            />
          ))}

          <View style={styles.emptyAction}>
            <OutlineButton
              label="Adjust preferences"
              icon="options-outline"
              onPress={() => router.push(routes.preferences)}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
>>>>>>> momay
