import { useAuthSession } from '@/services/auth';
import { Stack } from 'expo-router';
import { SplashScreenController } from '../splash';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <SplashScreenController />
      <RootNavigator />
    </>
  );
}

function RootNavigator() {
  const { session } = useAuthSession();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="home" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/choose-role" />
        <Stack.Screen name="(auth)/sign-up" />
      </Stack.Protected>

      <Stack.Screen name="landlord/list-space" />
    </Stack>
  );
}
