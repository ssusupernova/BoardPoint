import { useAuthSession } from '@/services/auth';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SplashScreenController } from '../splash';
import { colors } from '../theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  return (
    <>
      <SplashScreenController fontsReady={fontsLoaded || !!fontError} />
      <RootNavigator />
    </>
  );
}

function RootNavigator() {
  const { session } = useAuthSession();
  const role = session?.user.role;
  const isAdmin = role === 'super_admin';

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

      {/* The whole admin panel is gated on an administrator role. */}
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
      
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/choose-role" />
        <Stack.Screen name="(auth)/sign-up" />
      </Stack.Protected>

      <Stack.Protected guard={!!session && role === 'renter'}>
        <Stack.Screen name="renter" />
      </Stack.Protected>

      <Stack.Protected guard={!!session && role === 'landlord'}>
        <Stack.Screen name="landlord" />
      </Stack.Protected>
    </Stack>
  );
}
