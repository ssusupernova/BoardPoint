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