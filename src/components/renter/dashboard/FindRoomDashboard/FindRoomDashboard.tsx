import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SectionHeader } from '@/components/renter/SectionHeader/SectionHeader';
import { RecommendationSection } from '@/components/renter/rooms/RecommendationSection/RecommendationSection';
import { OutlineButton } from '@/components/ui/OutlineButton/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton/PrimaryButton';
import { renterMockRooms } from '@/data/mock';
import { routes } from '@/routes';
import {
  createDefaultForm,
  loadChecklist,
  toChecklist,
  type RenterChecklist,
} from '@/services/checklist';
import { toggleFavoriteRoom, useFavoriteRoomIds } from '@/services/favorites';
import { recommendRooms } from '@/services/recommendations';
import { colors } from '@/theme';
import { styles } from './FindRoomDashboard.styles';

type Props = {
  /** Signed-in renter's account id, used to load their saved preferences. */
  userId: string;
};

const STEPS: { title: string; text: string }[] = [
  { title: 'Set your preferences', text: 'Budget, area, room type and must-haves.' },
  { title: 'Browse matched rooms', text: 'We rank listings against what matters to you.' },
  { title: 'Send a rental request', text: 'Ask the landlord to reserve your room.' },
  { title: 'Get confirmed & move in', text: 'Once confirmed, your tenancy appears here.' },
];

/**
 * Onboarding dashboard for renters who don't have a room yet: a "find your
 * room" hero, a short how-it-works list and a carousel of top matches. Rendered
 * inside `RenterScreen` so the brand header and bottom nav are shared.
 */
export function FindRoomDashboard({ userId }: Props) {
  const router = useRouter();
  const favoriteIds = useFavoriteRoomIds();

  const [checklist, setChecklist] = useState<RenterChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadChecklist(userId).then((saved) => {
      if (!active) return;
      setChecklist(saved ?? toChecklist(createDefaultForm()));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const topPicks = useMemo(
    () => (checklist ? recommendRooms(renterMockRooms, checklist).slice(0, 6) : []),
    [checklist]
  );

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="home-outline" size={24} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Let&apos;s find your next home</Text>
        <Text style={styles.heroText}>
          Tell us what you&apos;re looking for and we&apos;ll match you with rooms that fit your
          budget, area and must-haves.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton
            label="Set your preferences"
            icon="options-outline"
            onPress={() => router.push(routes.preferences)}
            accessibilityLabel="Set your room preferences"
          />
          <OutlineButton
            label="Browse all rooms"
            icon="search-outline"
            onPress={() => router.push(routes.renterRooms)}
          />
        </View>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, index) => (
          <View key={step.title}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            </View>
            {index < STEPS.length - 1 ? <View style={styles.stepDivider} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        {loading ? (
          <>
            <SectionHeader title="Top picks for you" />
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Finding rooms near you…</Text>
            </View>
          </>
        ) : (
          <RecommendationSection
            title="Top picks for you"
            subtitle="Based on your preferences — refine them anytime."
            rooms={topPicks}
            favoriteIds={favoriteIds}
            onToggleFavorite={(roomId) => void toggleFavoriteRoom(roomId)}
            onOpenRoom={(room) => router.push(routes.renterRoom(room.id))}
            onSeeAll={() => router.push(routes.renterRecommended)}
          />
        )}
      </View>
    </>
  );
}
