import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import { useAuthSession } from '@/services/auth';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { hydrated } = useAuthSession();

  useEffect(() => {
    if (!hydrated) return;
    void SplashScreen.hideAsync();
  }, [hydrated]);

  return null;
}
