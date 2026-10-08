import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { useAuthSession } from '@/services/auth';
import { SplashScreenController } from '@/splash';
import { colors } from '@/theme';

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="home" />
        <Stack.Screen name="renter/preferences" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/sign-up" />
      </Stack.Protected>

      <Stack.Screen name="landlord/list-space" />
    </Stack>
  );
}
