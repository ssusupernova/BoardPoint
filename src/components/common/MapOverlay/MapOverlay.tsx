import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';
import { styles } from './MapOverlay.styles';

type Props = {
  status: 'loading' | 'error';
  onRetry: () => void;
  /** Explains why the map failed, when it is more than a generic outage. */
  message?: string;
};

/**
 * Full-bleed loading / error state shown over any map surface. Shared by the
 * draggable pin map and the property markers map so failures always look and
 * behave the same (with a Retry affordance).
 */
export function MapOverlay({ status, onRetry, message }: Props) {
  if (status === 'loading') {
    return (
      <View style={styles.overlay} pointerEvents="none">
        <Ionicons name="map-outline" size={22} color={colors.textSecondary} />
        <Text style={styles.overlayText}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Ionicons name="warning-outline" size={24} color={colors.error} />
      <Text style={styles.overlayTitle}>The map couldn’t load</Text>
      <Text style={styles.overlayText}>
        {message ?? 'Check your connection, then try again.'}
      </Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Retry loading the map"
      >
        <Ionicons name="refresh" size={15} color={colors.onPrimary} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}
