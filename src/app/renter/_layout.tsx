import { Stack } from 'expo-router';
import { colors } from '@/theme';

/**
 * Nested stack for the renter area. Every route under `src/app/renter` lives
 * here so the root layout's renter guard protects the whole subtree.
 */
export default function RenterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
