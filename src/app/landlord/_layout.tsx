import { Stack } from 'expo-router';
import { colors } from '@/theme';

/**
 * Nested stack for the landlord area. Every route under `src/app/landlord`
 * lives here so the root layout's landlord guard protects the whole subtree.
 */
export default function LandlordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
